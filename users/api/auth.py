from django.contrib.auth import authenticate, get_user_model
from ninja import Router

from users.auth.jwt import create_access_token

from .schemas.auth import LoginIn, RegisterIn, RegisterOut, TokenOut

User = get_user_model()

router = Router()


@router.post("/login", response=TokenOut)
def token(request, data: LoginIn):
    user = authenticate(request, username=data.username, password=data.password)
    if user is None:
        return TokenOut(ok=False, error="Invalid credentials.")

    token = create_access_token(user.id)
    return TokenOut(ok=True, token=token, token_type="Bearer")


@router.post("/register", response=RegisterOut)
def register(request, data: RegisterIn):
    username = data.username
    email = data.email

    user = User.objects.create_user(
        username=username,
        email=email,
        password=data.password,
        max_duration_chunk=data.max_duration_chunk or 60,
    )
    return RegisterOut(ok=True, id=user.id, username=user.username, email=user.email)
