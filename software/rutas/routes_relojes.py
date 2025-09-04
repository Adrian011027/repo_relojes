# rutas/routes_relojes.py
from aiohttp import web
from Funciones.asignarReloj import (
    Textr, endpoint_ping_reloj, endpoint_ping_todos_los_relojes,
    endpoint_tareas_para_reloj, update_reloj_id, desasignar_reloj
)

def setup_relojes_routes(app: web.Application):
    app.router.add_get("/textra", Textr)
    app.router.add_get("/ping_relojes", endpoint_ping_todos_los_relojes)
    app.router.add_get("/ping_reloj/{reloj_id}", endpoint_ping_reloj)
    app.router.add_post("/tareas_reloj/{reloj_id}", endpoint_tareas_para_reloj)
    app.router.add_patch("/update_reloj_id/{reloj_id}", update_reloj_id)
    app.router.add_patch("/relojes/{reloj_id}", desasignar_reloj)
