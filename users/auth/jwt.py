from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings

ALGO = "HS256"


def create_access_token(user_id: int):
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "iat": now,
        "exp": now + timedelta(days=7),  # Token expires in 7 days
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGO)
    return token


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGO])
        return payload["user_id"]
    except Exception:
        return None
