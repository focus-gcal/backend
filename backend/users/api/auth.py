from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from ninja import Router
from users.auth.jwt import create_access_token

from .schemas.auth import LoginIn, RegisterIn, RegisterOut, TokenOut

User = get_user_model()

router = Router()


@router.post("/login", response={200: TokenOut, 401: TokenOut})
def token(request, data: LoginIn):
    user = authenticate(request, username=data.username, password=data.password)
    if user is None:
        return 401, TokenOut(ok=False, error="Invalid credentials.")

    token = create_access_token(user.id)
    return 200, TokenOut(ok=True, token=token, token_type="Bearer")


@router.post("/register", response={200: RegisterOut, 400: RegisterOut})
def register(request, data: RegisterIn):
    username = data.username
    email = data.email
    # check if account already exists with the same username or email
    if User.objects.filter(Q(username=username) | Q(email=email)).exists():
        return 400, RegisterOut(ok=False, error="Username or email already exists.")
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=data.password,
            max_duration_chunk=data.max_duration_chunk or 60,
        )
    except Exception as e:
        return 400, RegisterOut(ok=False, error=str(e))
    return 200, RegisterOut(
        ok=True, id=user.id, username=user.username, email=user.email
    )
