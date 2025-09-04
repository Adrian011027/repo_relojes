# rutas/routes_empleados.py
from aiohttp import web
import Funciones.empleados as emp

def _resolve(*names):
    for n in names:
        if hasattr(emp, n):
            return getattr(emp, n)
    return None

def setup_empleados_routes(app: web.Application):
    # resolver funciones (aliases comunes incluidos)
    empleados = _resolve("empleados", "listar_empleados", "get_empleados")
    empleado_id = _resolve("empleado_id", "get_empleado", "empleado_por_id")
    crear_empleado = _resolve("crear_empleado", "create_empleado", "create_user")
    eliminar_empleado = _resolve("eliminar_empleado", "delete_empleado", "remove_empleado")
    actualizar_empleado = _resolve("actualizar_empleado", "update_empleado", "modificar_empleado")
    actualizar_estatus_empleado = _resolve("actualizar_estatus_empleado", "actualizar_estatus", "update_status_empleado")
    users_id = _resolve("users_id", "user_id", "get_user")
    users = _resolve("users", "list_users", "get_users")
    actualizar_user = _resolve("actualizar_user", "update_user", "modificar_user")

    # Validar funciones críticas
    required = {
        "empleados": empleados,
        "empleado_id": empleado_id,
        "crear_empleado": crear_empleado,
        "eliminar_empleado": eliminar_empleado,
        "actualizar_empleado": actualizar_empleado,
        "actualizar_user": actualizar_user
    }
    missing = [k for k, v in required.items() if v is None]
    if missing:
        raise ImportError(
            "Funciones faltantes en Funciones.empleados: "
            + ", ".join(missing)
            + ". Añade las funciones o crea aliases en Funciones/empleados.py"
        )

    # Registro de rutas
    app.router.add_get("/empleados", empleados)
    app.router.add_get("/empleados/{id}", empleado_id)
    app.router.add_post("/empleados", crear_empleado)
    app.router.add_delete("/empleados/{id}", eliminar_empleado)
    app.router.add_patch("/empleados/{id}", actualizar_empleado)
    app.router.add_patch("/users/update/{id}", actualizar_user)
    app.router.add_get("/user", users)
    # estatus es opcional: registramos si existe
    if actualizar_estatus_empleado:
        app.router.add_patch("/empleados/{id}/estatus", actualizar_estatus_empleado)

    # Users relacionados (si existen)
    if users_id:
        app.router.add_get("/user/{id}", users_id)
    if users:
        app.router.add_get("/users", users)
