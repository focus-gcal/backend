from ninja import Router, Schema
from django.contrib.auth import get_user_model
from users.auth.jwt import create_access_token
from django.contrib.auth import authenticate

User = get_user_model()
router = Router()


class RegisterIn(Schema):
    username: str
    email: str
    password: str
    max_duration_chunk:int | None = None

class RegisterOut(Schema):
    ok: bool
    id : int | None = None
    username : str | None = None
    email : str | None = None
    error: str | None = None

class LoginIn(Schema):
    username: str
    password: str

class TokenOut(Schema):
    ok: bool
    token: str | None = None
    token_type: str | None = None
    error: str | None = None
    
@router.post("/login", response=TokenOut)
def token(request, data: LoginIn):
    user = authenticate(LoginIn, username=data.username, password=data.password)
    if user is None:
        return TokenOut(ok=False, error="Invalid credentials.")
    
    token = create_access_token(user.id)
    return TokenOut(ok=True, token=token, token_type="Bearer")



@router.post("/register", response=RegisterOut)
def register(request, data: RegisterIn):
    username = data.username.strip()
    email = data.email.strip().lower()
    
    if User.objects.filter(username=username).exists():
        return RegisterOut(ok=False, error="Username already exists.")
    if User.objects.filter(email=email).exists():
        return RegisterOut(ok=False, error="Email already exists.")
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=data.password,
    )
    if data.max_duration_chunk is not None:
        user.max_duration_chunk = data.max_duration_chunk
        user.save(update_fields=["max_duration_chunk"])
    return RegisterOut(ok=True, id=user.id, username=user.username, email=user.email)