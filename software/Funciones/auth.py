from aiohttp import web
from utils.files import leer_users, leer_empleados
import json, bcrypt, re

# ───────────────────────────────
# Detectar si un string es hash bcrypt válido
# ───────────────────────────────
def is_bcrypt_hash(value: str) -> bool:
    if not value or not isinstance(value, str):
        return False
    return bool(re.match(r'^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$', value))


async def login(request):
    return web.FileResponse('./web/login/login.html')


async def login_post(request):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return web.json_response(
            {"success": False, "detail": "Faltan credenciales"},
            status=400
        )

    # =========================
    # 1️⃣ Buscar en users.json
    # =========================
    users = leer_users().get("users", [])
    user_found = next((u for u in users if u.get("username") == username), None)

    if user_found:
        hashed = user_found.get("password")
        valido = False

        if hashed:
            # Caso texto plano
            if hashed == password:
                valido = True
            # Caso hash bcrypt válido
            elif is_bcrypt_hash(hashed) and bcrypt.checkpw(
                password.encode("utf-8"), hashed.encode("utf-8")
            ):
                valido = True

        if valido:
            role = user_found.get("role", "empleado")
            empleado_id = user_found.get("empleado_id")
            user = {
                "username": username,
                "role": role,
                "empleado_id": empleado_id,
                "tipo": "user"
            }
            response = web.json_response({"success": True, "message": "Login exitoso", **user})
            response.set_cookie("usuario", json.dumps(user))
            return response
        else:
            return web.json_response({"success": False, "detail": "Contraseña incorrecta"}, status=401)

    # =============================
    # 2️⃣ Buscar en empleados.json
    # =============================
    empleados = leer_empleados()
    empleado_found = next((e for e in empleados if e.get("username") == username), None)

    if empleado_found:
        hashed = empleado_found.get("password_dp")
        valido = False

        if hashed:
            if hashed == password:
                valido = True
            elif is_bcrypt_hash(hashed) and bcrypt.checkpw(
                password.encode("utf-8"), hashed.encode("utf-8")
            ):
                valido = True

        if valido:
            role = empleado_found.get("role_dp", "empleado")
            empleado_id = empleado_found.get("id")
            user = {
                "username": username,
                "role": role,
                "empleado_id": empleado_id,
                "tipo": "empleado"
            }
            response = web.json_response({"success": True, "message": "Login exitoso", **user})
            response.set_cookie("usuario", json.dumps(user))
            return response

        return web.json_response({"success": False, "detail": "Contraseña incorrecta"}, status=401)

    # =============================
    # ❌ Ninguno encontrado
    # =============================
    return web.json_response({"success": False, "detail": "Usuario no encontrado"}, status=404)


async def logout(request):
    response = web.HTTPFound("/login")
    response.del_cookie("usuario")
    return response