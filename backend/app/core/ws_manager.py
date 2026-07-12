import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int) -> None:
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, data: dict) -> None:
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(data)
            except Exception:
                logger.exception("Failed to send websocket message to user %s", user_id)
                self.disconnect(user_id)

    def is_online(self, user_id: int) -> bool:
        return user_id in self.active_connections


manager = ConnectionManager()
