# chat/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # connect to: ws://<host>/ws/chat/<conversation_id>/
    re_path(r'ws/chat/(?P<conversation_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]
