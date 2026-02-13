from ninja import Router
from users.auth.ninja_auth import JWTAuth

router = Router(tags=["me"])

@router.get("", auth=JWTAuth())
def me(request):
    return {"id": request.auth.id, "username": request.auth.username, "email": request.auth.email}
