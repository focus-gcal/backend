from django.contrib.auth import get_user_model
from django.core.cache import cache
from ninja import Router
from users.auth.google import GoogleAuthService
from users.auth.jwt import create_access_token
from users.repository import UserRepository

from .schemas.auth import (
    OAuthStartError,
    OAuthStartIn,
    OAuthStartOut,
    StateIn,
    StateOut,
)

User = get_user_model()

router = Router()


@router.post("/google/callback", response={200: OAuthStartOut, 400: OAuthStartError})
def google_callback(request, data: OAuthStartIn):
    code = data.code
    state = data.state
    redis_key = f"google_state_{state}"
    if not cache.get(redis_key):
        return 400, OAuthStartError(ok=False, error="State not found")
    cache.delete(redis_key)
    credentials, error = GoogleAuthService.exchange_code_for_token(code)
    if credentials is None:
        return 400, OAuthStartError(
            ok=False, error=error if error else "Failed to exchange code for token"
        )
    user_info = GoogleAuthService.get_user_info(credentials.id_token)
    if user_info is None:
        return 400, OAuthStartError(
            ok=False, error="Failed to get user info from Google"
        )
    user = UserRepository.get_or_create_user_from_google(user_info, credentials)
    GoogleAuthService.store_access_token(user.id, credentials)
    jwt, expires_at = create_access_token(user.id)
    return 200, OAuthStartOut(ok=True, jwt_token=jwt, expiry_date=expires_at)


@router.post("/google/start", response={200: StateOut, 400: StateOut})
def google_start(request, data: StateIn):
    state = data.state
    created = cache.add(f"google_state_{state}", True, timeout=600)
    if created:
        return 200, StateOut(ok=True, state=state)
    else:
        return 400, StateOut(ok=False, state=state, error="State already used")
