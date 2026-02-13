import jwt
from datetime import datetime, timedelta
from django.conf import settings

ALGO = "HS256"

def create_access_token(user_id: int):
    payload = {
        "user_id": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGO)
    return token


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGO])
        return payload["user_id"]
    except Exception:
        return None