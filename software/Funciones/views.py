# Funciones/views.py
from aiohttp import web
import os

# --- Páginas HTML ---
async def home(request):
    raise web.HTTPFound('/login')

async def inicio(request):
    return web.FileResponse('./web/Home/home.html')

async def actividades(request):
    return web.FileResponse('./web/Actividades/actividades.html')

async def gestion(request):
    return web.FileResponse('./web/gestion/gestion.html')

async def informes(request):
    return web.FileResponse('./web/informes/informes.html')

async def registrar_equipo(request):
    return web.FileResponse('./web/gestion/Registrar Equipo/registrarEquipo.html')

# --- Archivos JSON ---
async def obtener_json(request):
    path = os.path.join(os.getcwd(), 'empleados.json')
    if os.path.exists(path):
        return web.FileResponse(path)
    return web.Response(status=404, text="Archivo empleados.json no encontrado.")

async def obtener_relojes_json(request):
    path = os.path.join(os.getcwd(), 'relojes_conectados.json')
    if os.path.exists(path):
        return web.FileResponse(path)
    return web.Response(status=404, text="Archivo relojes_conectados.json no encontrado.")

async def obtener_backup_json(request):
    path = os.path.join(os.getcwd(), 'backup.json')
    if os.path.exists(path):
        return web.FileResponse(path)
    return web.Response(status=404, text="Archivo backup.json no encontrado.")
