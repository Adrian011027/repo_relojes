from aiohttp import web
from Funciones.schemas import EmpleadoSchema, EmpleadoUpdateSchema, Users
from pydantic import ValidationError
from utils.files import leer_empleados, guardar_empleados, leer_users, guardar_users, guardar_user
import aiofiles
import os
import re
import bcrypt

UPLOAD_DIR = "./web/Images/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ------------------ Endpoints ------------------

async def empleados(request):
    return web.json_response(leer_empleados())

async def empleado_id(request):
    empleado_id = int(request.match_info['id'])
    empleado = next((e for e in leer_empleados() if e['id'] == empleado_id), None)
    if empleado:
        return web.json_response(empleado)
    return web.json_response({'message': 'Empleado no encontrado'}, status=404)

async def users_id(request):
    users_id = int(request.match_info['id'])
    users = leer_users()
    user = next((e for e in users['users'] if int(e.get('empleado_id')) == users_id), None)
    if user:
        return web.json_response(user)
    return web.json_response({'message': 'Usuario no encontrado'}, status=404)

async def users(request):
    return web.json_response(leer_users())

def limpiar_nombre(nombre):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', nombre)

# ------------------ Crear empleado ------------------
async def crear_empleado(request):
    empleados = leer_empleados()
    nuevo_id = max([e['id'] for e in empleados], default=0) + 1

    data = {}
    imagen = None
    username = None

    # Soporte JSON y multipart
    if request.content_type.startswith("multipart/"):
        reader = await request.multipart()
        async for part in reader:
            if part.name == "imagen":
                imagen = await part.read()
            else:
                value = await part.text()
                data[part.name] = value
                if part.name == "username":
                    username = value
    else:
        try:
            data = await request.json()
            username = data.get("username")
        except Exception:
            return web.json_response({"error": "Formato de request no válido"}, status=400)

    if not username:
        return web.json_response({"error": "Falta username"}, status=400)
    if not data.get("password"):
        return web.json_response({"error": "Falta password"}, status=400)

    # Normalizar role
    _role_aliases = {
        "admin": "administrador",
        "administrator": "administrador",
        "adm": "administrador",
        "empleado": "empleado",
        "user": "empleado",
    }
    if "role" in data and isinstance(data["role"], str):
        data["role"] = _role_aliases.get(data["role"].strip().lower(), data["role"])

    # Guardar imagen si viene
    filename = f"{username}.jpg"
    if imagen:
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(imagen)
        data["imagen"] = filename
    else:
        data["imagen"] = None

    # Crear empleado
    try:
        empleado_model = EmpleadoSchema(
            nombre=data.get("nombre"),
            puesto=data.get("puesto"),
            imagen=data.get("imagen"),
        )
    except ValidationError as e:
        return web.json_response({"error": e.errors()}, status=400)

    nuevo_empleado = empleado_model.model_dump()
    nuevo_empleado["id"] = nuevo_id
    empleados.append(nuevo_empleado)
    guardar_empleados(empleados)

    # Hashear contraseña con bcrypt
    password_claro = data.get("password")
    hashed = bcrypt.hashpw(password_claro.encode("utf-8"), bcrypt.gensalt())

    user = Users(
        username=username,
        password=hashed.decode("utf-8"),  # guardamos el hash
        role=data.get("role"),
        empleado_id=nuevo_id
    )

    # 🔑 usar mode="json" para que SecretStr se convierta a str
    guardar_user(user.model_dump(mode="json"))

    return web.json_response({
        "message": "Empleado agregado correctamente",
        "empleado": nuevo_empleado,
        "user": user.model_dump(mode="json")
    }, status=201)

# ------------------ Eliminar empleado ------------------
async def eliminar_empleado(request):
    id = int(request.match_info['id'])
    empleados = leer_empleados()
    users = leer_users().get("users", [])

    emp_idx = next((i for i, e in enumerate(empleados) if e['id'] == id), None)
    usr_idx = next((i for i, u in enumerate(users) if u['empleado_id'] == id), None)

    if emp_idx is None or usr_idx is None:
        return web.json_response({'message': 'No encontrado'}, status=404)

    empleados.pop(emp_idx)
    users.pop(usr_idx)
    guardar_empleados(empleados)
    guardar_users(users)
    return web.json_response({'message': 'Empleado eliminado correctamente'})

# ------------------ Actualizar empleado ------------------
async def actualizar_empleado(request):
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

    # ------------------ Actualización de tareas ------------------
    if "tareas_asignadas" in data and isinstance(data["tareas_asignadas"], dict):
        for dia, nuevas_tareas in data["tareas_asignadas"].items():
            if not isinstance(nuevas_tareas, list):
                continue

            # aseguramos que el día exista
            if dia not in empleado["tareas_asignadas"]:
                empleado["tareas_asignadas"][dia] = []

            for nueva in nuevas_tareas:
                if "id" not in nueva:
                    continue

                # buscar si la tarea ya existe
                for i, tarea in enumerate(empleado["tareas_asignadas"][dia]):
                    if tarea.get("id") == nueva["id"]:
                        # actualizar solo esa tarea
                        empleado["tareas_asignadas"][dia][i].update(nueva)
                        break
                else:
                    # si no existe, agregarla
                    empleado["tareas_asignadas"][dia].append(nueva)

        # quitamos del payload para no sobreescribir todo
        data.pop("tareas_asignadas")

    # ------------------ Actualización de otros campos ------------------
    for key, value in data.items():
        if value is not None:
            empleado[key] = value

    guardar_empleados(empleados)

    return web.json_response({
        "ok": True,
        "message": f"Empleado {empleado_id} actualizado correctamente",
        "empleado": empleado
    })

# ------------------ Actualizar usuario ------------------
async def actualizar_user(request):
    user_id = request.match_info.get("id")
    if not user_id:
        return web.json_response({"error": "ID de usuario requerido"}, status=400)

    users_data = leer_users()
    users = users_data.get("users", [])
    user = next((u for u in users if str(u["empleado_id"]) == str(user_id)), None)
    if not user:
        return web.json_response({"error": "Usuario no encontrado"}, status=404)

    try:
        if request.content_type.startswith("multipart/"):
            reader = await request.multipart()
            data = {}
            async for part in reader:
                value = await part.text()
                data[part.name] = value
        else:
            data = await request.json()
    except Exception:
        return web.json_response({"error": "Formato de request no válido"}, status=400)

    # Normalizar role
    _role_aliases = {
        "admin": "administrador",
        "administrator": "administrador",
        "adm": "administrador",
        "empleado": "empleado",
        "user": "empleado",
    }
    if "role" in data and isinstance(data["role"], str):
        data["role"] = _role_aliases.get(data["role"].strip().lower(), data["role"])

    # Actualizar campos
    for key, value in data.items():
        if value is None:
            continue
        if key == "password":
            # Re-hash contraseña
            hashed = bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt())
            user["password"] = hashed.decode("utf-8")
        else:
            user[key] = value

    # Guardar lista completa de users
    guardar_users(users)

    return web.json_response({
        "ok": True,
        "message": f"Usuario {user_id} actualizado correctamente",
        "user": user
    }, status=200)
