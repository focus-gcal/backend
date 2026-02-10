from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/ping")
def hello(request):
    return "pong"
