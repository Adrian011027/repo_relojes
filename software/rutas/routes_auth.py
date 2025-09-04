# rutas/routes_auth.py
from aiohttp import web
from Funciones.auth import login, login_post, logout

def setup_auth_routes(app: web.Application):
    app.router.add_get("/login", login)
    app.router.add_post("/login", login_post)
    app.router.add_get("/logout", logout)
