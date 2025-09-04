from aiohttp import web
import json
import os
from Funciones.schemas import EmpleadoSchema, EmpleadoUpdateSchema, TareaSchema
from pydantic import ValidationError

# Función para leer empleados desde el archivo JSON
def leer_empleados():
    archivo_empleados = './empleados.json'
    if os.path.exists(archivo_empleados):
        with open(archivo_empleados, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Función para guardar empleados en el archivo JSON
def guardar_empleados(empleados):
    archivo_empleados = './empleados.json'
    with open(archivo_empleados, 'w', encoding='utf-8') as f:
        json.dump(empleados, f, indent=2)

# Obtener todos los empleados
async def tareas(request):
    print('Tareas')
    return web.json_response(leer_empleados())
    

# Obtener un empleado por ID
async def empleado_id(request):
    empleado_id = int(request.match_info['id'])
    empleado = next((e for e in leer_empleados() if e['id'] == empleado_id), None)
    if empleado:
        return web.json_response(empleado)
    return web.json_response({'message': 'Empleado no encontrado'}, status=404)

# Crear un nuevo empleado

# Actualizar un empleado
async def tareas_dia(request):

    try:
        empleado_id = int(request.match_info['id'])
        dia = int(request.match_info['dia'])  # Convertir a entero el día

        dias_semana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

        empleado = next((e for e in leer_empleados() if e['id'] == empleado_id), None)

        if empleado:
            # Verificar si el empleado tiene tareas asignadas correctamente
            if 'tareas_asignadas' in empleado and isinstance(empleado['tareas_asignadas'], list) and len(empleado['tareas_asignadas']) > 0:
                tareas_dia = empleado['tareas_asignadas'][0].get(dias_semana[dia], [])
                return web.json_response({'tareas': tareas_dia})

            return web.json_response({'message': 'No hay tareas asignadas'}, status=404)

        return web.json_response({'message': 'Empleado no encontrado'}, status=404)

    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)


# ------------------ Crear tarea para un empleado ------------------
async def crear_tarea(request):
    empleado_id = request.match_info.get("id")
    if not empleado_id:
        return web.json_response({"error": "ID de empleado requerido"}, status=400)

    empleados = leer_empleados()
    empleado = next((e for e in empleados if str(e["id"]) == str(empleado_id)), None)
    if not empleado:
        return web.json_response({"error": "Empleado no encontrado"}, status=404)

    try:
        data = await request.json()
    except Exception:
        return web.json_response({"error": "Formato de request no válido"}, status=400)

    if "tareas_asignadas" not in data or not isinstance(data["tareas_asignadas"], dict):
        return web.json_response({"error": "Faltan tareas_asignadas"}, status=400)

    # sacar el último id de tareas
    max_id = 0
    for tareas in empleado.get("tareas_asignadas", {}).values():
        for tarea in tareas:
            if tarea.get("id", 0) > max_id:
                max_id = tarea["id"]

    # añadir nuevas tareas con id autoincremental
    for dia, nuevas_tareas in data["tareas_asignadas"].items():
        if dia not in empleado["tareas_asignadas"]:
            empleado["tareas_asignadas"][dia] = []
        for nueva in nuevas_tareas:
            max_id += 1
            nueva["id"] = max_id
            empleado["tareas_asignadas"][dia].append(nueva)

    guardar_empleados(empleados)

    return web.json_response({
        "ok": True,
        "message": f"Tareas agregadas al empleado {empleado_id}",
        "empleado": empleado
    }, status=201)
