from ninja.security import HttpBearer
from django.contrib.auth import get_user_model
from users.auth.jwt import decode_access_token

User = get_user_model()

class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        user_id = decode_access_token(token)
        if user_id is None:
            return None
        try:
            user = User.objects.get(id=user_id)
            request.user = user
            return request.user
        except User.DoesNotExist:
            request.user = None
            return None
        