# rutas/routes_tareas.py
from aiohttp import web
from Funciones.tareas import tareas, tareas_dia, crear_tarea
from Funciones.jsonRelog import tareas_completada
import Funciones.asignarReloj as ar

def _resolve(*names):
    for n in names:
        if hasattr(ar, n):
            return getattr(ar, n)
    return None

def setup_tareas_routes(app: web.Application):
    app.router.add_get("/tareas", tareas)
    app.router.add_get("/tareas/{id}/{dia}", tareas_dia)
    app.router.add_post("/tareas/{id}", crear_tarea)   # POST = crear tarea

    
    # Intentamos resolver la función que envía tareas extra con varios aliases posibles
    enviar_tareas_extra = _resolve(
        "enviar_tareas_extra",
        "enviar_tarea_extra",
        "send_extra_tasks",
        "send_task_extra",
        "enviar_tareas",
        "enviar_tareas_extra_a_reloj"
    )

    required = {"enviar_tareas_extra": enviar_tareas_extra}
    missing = [k for k, v in required.items() if v is None]
    if missing:
        raise ImportError(
            "Funciones faltantes en Funciones.asignarReloj: "
            + ", ".join(missing)
            + ". Revisa nombres de función o añade aliases en Funciones/asignarReloj.py"
        )

    # Rutas relacionadas con tareas extra (ajusta path si tu app usa otra)
    app.router.add_post("/tareas/extra/enviar", enviar_tareas_extra)
    app.router.add_post("/tareas_completada", tareas_completada)  # opcional si lo usas
