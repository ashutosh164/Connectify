from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()

# user_id -> websocket
active_connections: Dict[str, WebSocket] = {}


@app.websocket("/ws/chat/{user_id}")
async def chat_ws(websocket: WebSocket, user_id: str):
    await websocket.accept()
    active_connections[user_id] = websocket
    print(f"{user_id} connected")

    try:
        while True:
            data = await websocket.receive_json()
            receiver = data["to"]
            message = data["message"]

            payload = {
                "from": user_id,
                "message": message
            }

            # send to receiver
            if receiver in active_connections:
                await active_connections[receiver].send_json(payload)

            # ALSO send back to sender (IMPORTANT)
            await websocket.send_json(payload)

    except WebSocketDisconnect:
        del active_connections[user_id]
        print(f"{user_id} disconnected")
