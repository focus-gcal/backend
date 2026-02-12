from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/ping")
def ping(request):
    return "pong"
