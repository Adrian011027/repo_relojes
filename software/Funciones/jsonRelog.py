from utils.files import leer_empleados
from utils.tareas_utils import get_tareas_empleado, filtrar_tareas, actualizar_estatus_tarea
from datetime import datetime
import requests

# ejemplo: tareas completadas (estatus → 0)
def tareas_completada(id_empleado, id_task):
    actualizado = actualizar_estatus_tarea(id_empleado, id_task, 0)
    if not actualizado:
        return {"error": "No se pudo actualizar tarea"}
    return {"success": True}
