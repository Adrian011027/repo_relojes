import json
import time
import aiohttp_cors
from aiohttp import web
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dateutil.relativedelta import relativedelta, SU
from datetime import datetime

from rutas import setup_routes
from Funciones.asignarIp import obtener_ip_local
from Funciones.asignarReloj import verificar_tareas_expiradas, websocket_handler  # 👈 import WS aquí
from estadoGlobal import relojes_conectados, ping_events

# =======================
# 🔒 Middleware
# =======================
@web.middleware
async def auth_middleware(request, handler):
    path = request.path

    rutas_publicas = [
        "/", "/actividades", "/login", "/logout", "/web", "/empleados.json",
        "/relojes_conectados.json", "/ws", "/ping_reloj", "/ping_relojes"
    ]
    if any(path.startswith(r) for r in rutas_publicas):
        return await handler(request)

    user_cookie = request.cookies.get("usuario")
    if not user_cookie:
        return web.HTTPFound("/actividades")

    try:
        user = json.loads(user_cookie)
    except Exception:
        return web.HTTPFound("/actividades")

    rol = user.get("role")

    if path.startswith(("/gestion", "/empleados", "/registrar-equipo")):
        if rol != "admin":
            return web.HTTPFound("/actividades")

    if path.startswith(("/informes", "/actividades")):
        if rol not in ["admin", "empleado"]:
            return web.HTTPFound("/actividades")

    return await handler(request)


# =======================
# 📦 Backup empleados.json
# =======================
async def generar_backup():
    try:
        with open("empleados.json", "r", encoding="utf-8") as f:
            empleados = json.load(f)

        for emp in empleados:
            for dia, lst in emp.get("tareas_asignadas", {}).items():
                emp["tareas_asignadas"][dia] = [t for t in lst if t.get("estatus") == 0]

        with open("backup.json", "w", encoding="utf-8") as f:
            json.dump(empleados, f, ensure_ascii=False, indent=2)

        print("✅ Backup generado")
    except Exception as e:
        print("❌ Error generando backup:", e)


async def endpoint_backup(request):
    await generar_backup()
    return web.json_response({"success": True})


# =======================
# ⏱️ Scheduler
# =======================
async def startup_scheduler(app):
    scheduler = AsyncIOScheduler()

    prox_domingo = datetime.now() + relativedelta(weekday=SU(+1))

    scheduler.add_job(
        generar_backup,
        trigger="interval",
        weeks=2,
        next_run_time=prox_domingo
    )

    scheduler.add_job(
        verificar_tareas_expiradas,
        trigger="interval",
        minutes=1
    )

    scheduler.start()
    print("🗓️ Backup quincenal programado")
    print("⏱️ Verificador de tareas expiradas cada minuto")


# =======================
# 🚀 Inicialización app
# =======================
app = web.Application(client_max_size=10 * 1024 * 1024, middlewares=[auth_middleware])
app.on_startup.append(startup_scheduler)

# Rutas (importa todas las de rutas/)
setup_routes(app)

# Endpoints adicionales
app.router.add_get("/backup", endpoint_backup)
app.router.add_get("/ws", websocket_handler)  # 👈 ahora el WS está en Funciones/asignarReloj

# CORS
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
    )
})
for route in list(app.router.routes()):
    cors.add(route)

if __name__ == "__main__":
    web.run_app(app, host=obtener_ip_local(), port=2298)
