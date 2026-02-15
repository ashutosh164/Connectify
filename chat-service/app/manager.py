from typing import Dict
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()   # ✅ MUST be here
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)

    async def send_to_user(self, data: dict):
        to_user = data.get("to")
        if not to_user:
            return

        ws = self.active_connections.get(str(to_user))
        if ws:
            await ws.send_text(json.dumps(data))

    async def broadcast(self, data: dict):
        for ws in list(self.active_connections.values()):
            try:
                await ws.send_text(json.dumps(data))
            except:
                pass
