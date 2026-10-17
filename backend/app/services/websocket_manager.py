"""
WebSocket Manager for real-time anomaly alert broadcasting.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Set
from fastapi import WebSocket

logger = logging.getLogger("aegis-link-ws")


class ConnectionManager:
    """Manages active user WebSocket connections."""

    def __init__(self) -> None:
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user_id={user_id}")

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected for user_id={user_id}")

    async def broadcast_alert(
        self, patient_id: str, alert_payload: dict, target_user_ids: List[str]
    ) -> None:
        """Broadcast anomaly alert payload to target caregiver and patient connections."""
        targets: Set[str] = set(target_user_ids)
        targets.add(patient_id)

        for uid in targets:
            if uid in self.active_connections:
                for ws in list(self.active_connections[uid]):
                    try:
                        await ws.send_json(alert_payload)
                    except Exception as exc:
                        logger.warning(f"Error sending WS alert to user {uid}: {exc}")
                        self.disconnect(uid, ws)


ws_manager = ConnectionManager()
