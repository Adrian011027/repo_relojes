# Funciones/reset_password.py
from aiohttp import web
from utils.files import leer_empleados, guardar_empleados
import bcrypt, random, string, datetime, os
from twilio.rest import Client

# 🔹 Almacenamos temporalmente los códigos de recuperación
RESET_CODES = {}  # { username: {"code": "123456", "exp": datetime } }

# 🔹 Configuración Twilio (usa variables de entorno)
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")          # Número Twilio para SMS
TWILIO_WHATSAPP = os.getenv("TWILIO_WHATSAPP")    # Ejemplo: "whatsapp:+1234567890"

client = Client(TWILIO_SID, TWILIO_AUTH)

# ------------------ Utilidades ------------------
def _generate_code(length=6):
    """Genera un código numérico aleatorio de N dígitos."""
    return ''.join(random.choices(string.digits, k=length))

def _find_empleado_by_username(username: str, empleados: list):
    """Busca un empleado por username en la lista de empleados.json"""
    return next((e for e in empleados if e.get("username") == username), None)

# ------------------ Endpoints ------------------

# Paso 1: solicitar recuperación
async def request_reset(request):
    data = await request.json()
    username = data.get("username")

    if not username:
        return web.json_response({"error": "Falta username"}, status=400)

    empleados = leer_empleados()
    empleado = _find_empleado_by_username(username, empleados)
    if not empleado:
        return web.json_response({"error": "Empleado no encontrado"}, status=404)

    # ⚠️ El empleado debe tener un teléfono registrado
    telefono = empleado.get("telefono")
    if not telefono:
        return web.json_response({"error": "Empleado sin teléfono registrado"}, status=400)

    # Generar código y guardar temporalmente
    code = _generate_code()
    RESET_CODES[username] = {
        "code": code,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    }

    # Enviar por Twilio (SMS o WhatsApp)
    try:
        message = client.messages.create(
            body=f"Tu código de recuperación es: {code}",
            from_=TWILIO_PHONE,   # o TWILIO_WHATSAPP si usas WhatsApp
            to=telefono
        )
        print(f"📤 Código enviado a {telefono}, SID: {message.sid}")
    except Exception as e:
        return web.json_response({"error": f"No se pudo enviar SMS/WhatsApp: {str(e)}"}, status=500)

    return web.json_response({"message": "Código enviado por SMS/WhatsApp"}, status=200)


# Paso 2: verificar código
async def verify_reset(request):
    data = await request.json()
    username = data.get("username")
    code = data.get("code")

    if not username or not code:
        return web.json_response({"error": "Faltan datos"}, status=400)

    record = RESET_CODES.get(username)
    if not record:
        return web.json_response({"error": "No se solicitó recuperación"}, status=400)

    if record["exp"] < datetime.datetime.utcnow():
        RESET_CODES.pop(username, None)
        return web.json_response({"error": "Código expirado"}, status=400)

    if record["code"] != code:
        return web.json_response({"error": "Código inválido"}, status=400)

    return web.json_response({"message": "Código válido"}, status=200)


# Paso 3: confirmar nueva contraseña
async def confirm_reset(request):
    data = await request.json()
    username = data.get("username")
    new_password = data.get("new_password")

    if not username or not new_password:
        return web.json_response({"error": "Faltan datos"}, status=400)

    empleados = leer_empleados()
    empleado = _find_empleado_by_username(username, empleados)
    if not empleado:
        return web.json_response({"error": "Empleado no encontrado"}, status=404)

    # Verificar que haya un código válido antes de permitir reset
    if username not in RESET_CODES:
        return web.json_response({"error": "No autorizado"}, status=403)

    # Hashear nueva contraseña
    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
    empleado["password_dp"] = hashed.decode("utf-8")

    guardar_empleados(empleados)

    # Invalidar código usado
    RESET_CODES.pop(username, None)

    return web.json_response({"message": "Contraseña actualizada con éxito"}, status=200)
