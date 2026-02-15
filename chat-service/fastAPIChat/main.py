from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import json

app = FastAPI()
templates = Jinja2Templates(directory="templates")


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[websocket] = username

        await self.broadcast_system(f"🔵 {username} Online")
        await self.broadcast_users()

    def disconnect(self, websocket: WebSocket):
        username = self.active_connections.get(websocket)
        if username:
            del self.active_connections[websocket]
        return username

    async def broadcast_users(self):
        users = list(self.active_connections.values())
        message = json.dumps({"type": "users", "users": users})
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_system(self, text: str):
        message = json.dumps({"type": "system", "text": text})
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_message(self, username: str, text: str):
        message = json.dumps({"type": "chat", "username": username, "text": text})
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_typing(self, username: str):
        message = json.dumps({"type": "typing", "username": username})
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def chat_page(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})


@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            if payload["type"] == "chat":
                await manager.broadcast_message(username, payload["text"])

            elif payload["type"] == "typing":
                await manager.broadcast_typing(username)

    except WebSocketDisconnect:
        left_user = manager.disconnect(websocket)
        await manager.broadcast_system(f"🔴 {left_user} Offline")
        await manager.broadcast_users()
