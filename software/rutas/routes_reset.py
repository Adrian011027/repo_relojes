from aiohttp import web
from Funciones import reset_password

def setup_reset_routes(app: web.Application):
    app.router.add_post("/auth/reset/request", reset_password.request_reset)
    app.router.add_post("/auth/reset/verify", reset_password.verify_reset)
    app.router.add_post("/auth/reset/confirm", reset_password.confirm_reset)
