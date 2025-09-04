# utils/tareas_utils.py
from datetime import datetime
from utils.constants import DIAS_SEMANA
from utils.files import leer_empleados, guardar_empleados

# Obtener nombre del día actual en español
def dia_actual():
    return DIAS_SEMANA[datetime.now().weekday()]

# Obtener tareas de un empleado en un día específico
def get_tareas_empleado(empleado_id: int, dia: str = None):
    empleados = leer_empleados()
    empleado = next((e for e in empleados if e["id"] == empleado_id), None)
    if not empleado:
        return []
    if not dia:
        dia = dia_actual()
    return empleado.get("tareas_asignadas", {}).get(dia, [])

# Filtrar tareas por estatus
def filtrar_tareas(estatus: int, dia: str = None):
    empleados = leer_empleados()
    if not dia:
        dia = dia_actual()

    tareas_filtradas = []
    for empleado in empleados:
        for d, tareas in empleado.get("tareas_asignadas", {}).items():
            if d == dia:
                for tarea in tareas:
                    if tarea.get("estatus") == estatus:
                        tareas_filtradas.append({
                            "id_empleado": empleado.get("id"),
                            "nombre": empleado.get("nombre"),
                            "dia": d,
                            "tarea": tarea,
                        })
    return tareas_filtradas

# Actualizar estatus de una tarea específica
def actualizar_estatus_tarea(empleado_id: int, tarea_id: int, nuevo_estatus: int):
    empleados = leer_empleados()
    dia = dia_actual()

    for emp in empleados:
        if emp["id"] == empleado_id:
            tareas = emp.get("tareas_asignadas", {}).get(dia, [])
            for tarea in tareas:
                if tarea["id"] == tarea_id:
                    tarea["estatus"] = nuevo_estatus
                    guardar_empleados(empleados)
                    return True
    return False
