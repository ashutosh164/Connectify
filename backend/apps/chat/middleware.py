from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import jwt

User = get_user_model()

class TokenAuthMiddleware:
    """
    Query-string based token auth: ws://.../ws/chat/1/?token=...
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return TokenAuthMiddlewareInstance(scope, self.inner)

class TokenAuthMiddlewareInstance:
    def __init__(self, scope, inner):
        self.scope = dict(scope)
        self.inner = inner

    async def __call__(self, receive, send):
        query_string = self.scope.get('query_string', b'').decode()
        qs = parse_qs(query_string)
        token = qs.get('token', [None])[0]
        user = AnonymousUser()
        if token:
            try:
                validated = UntypedToken(token)  # verify signature
                # decode to get user id
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id') or payload.get('user', None)
                if user_id:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    try:
                        user = await database_sync_to_async(User.objects.get)(id=user_id)
                    except User.DoesNotExist:
                        user = AnonymousUser()
            except Exception:
                user = AnonymousUser()

        self.scope['user'] = user
        inner = self.inner(self.scope)
        return await inner(receive, send)
