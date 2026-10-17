"""
WebSocket routes for real-time alerts.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from jose import jwt

from app.core.config import get_settings
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("aegis-link-ws")
router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
) -> None:
    """
    WebSocket endpoint for real-time anomaly alert streaming.
    Authenticates user via token query param and subscribes to alerts.
    """
    if not token:
        logger.warning("WebSocket connection attempt missing token query parameter.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        settings = get_settings()
        payload = jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception as exc:
        logger.warning(f"WebSocket auth failed: {exc}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await ws_manager.connect(str(user_id), websocket)
    try:
        while True:
            # Keep connection alive and process ping/pong or client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(str(user_id), websocket)
    except Exception as exc:
        logger.warning(f"WebSocket connection error: {exc}")
        ws_manager.disconnect(str(user_id), websocket)
