from aiohttp import web
from Funciones import views

def setup_misc_routes(app: web.Application):
    """
    Registrar rutas misc (sin WebSocket).
    """

    async def health(request):
        return web.json_response({"ok": True})

    async def version(request):
        return web.json_response({"version": app.get("version", "1.0.0")})

    # --- Páginas ---
    app.router.add_get("/", views.home)
    app.router.add_get("/actividades", views.actividades)
    app.router.add_get("/gestion", views.gestion)
    app.router.add_get("/informes", views.informes)
    app.router.add_get("/registrar-equipo", views.registrar_equipo)

    # --- Archivos JSON ---
    app.router.add_get("/empleados.json", views.obtener_json)
    app.router.add_get("/relojes_conectados.json", views.obtener_relojes_json)
    app.router.add_get("/backup.json", views.obtener_backup_json)

    # --- Archivos estáticos ---
    app.router.add_static("/web", path="./web", name="web")

    # --- Health & Version ---
    app.router.add_get("/health", health)
    app.router.add_get("/version", version)
