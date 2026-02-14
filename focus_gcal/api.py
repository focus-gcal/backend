from ninja import NinjaAPI

from users.api import api as users_api

api = NinjaAPI()

api.add_router("/users/", users_api.router)


@api.get("/ping")
def ping(request):
    return "pong"
