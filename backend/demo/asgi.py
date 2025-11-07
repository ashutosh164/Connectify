

# import os
#
# from django.core.asgi import get_asgi_application
#
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'demo.settings')
#
# application = get_asgi_application()


import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
# import chat.routing
from ..apps.chat import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'demo.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(  # uses Django session auth + user in scope
        URLRouter(
            routing.websocket_urlpatterns
        )
    ),
})

