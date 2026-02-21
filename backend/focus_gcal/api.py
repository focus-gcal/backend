from ninja import NinjaAPI
from users.api import api as auth_api

api = NinjaAPI()

api.add_router("/auth/", auth_api.router)


@api.get("/ping")
def ping(request):
    return "pong"
