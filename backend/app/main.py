"""
Aegis Link – FastAPI application entry-point.

Configures:
- CORS middleware (allowing the React dev server origins).
- Custom exception handlers.
- All API route modules under the ``/api`` prefix.
- A health-check endpoint at ``/api/health``.

Run with::

    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import ai_features, appointments, medications, users, vitals
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

# ── Logging ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("aegis-link")

# ── Application ───────────────────────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title="Aegis Link API",
    description=(
        "Backend API for the Aegis Link family health management platform. "
        "Provides endpoints for user management, vital-sign tracking, "
        "medication management, appointment scheduling, and AI-powered "
        "health features (chatbot, symptom checker, health insights)."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ───────────────────────────────────────────────
register_exception_handlers(app)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(users.router, prefix="/api")
app.include_router(vitals.router, prefix="/api")
app.include_router(medications.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(ai_features.router, prefix="/api")


# ── Health check ──────────────────────────────────────────────────────


@app.get("/api/health", tags=["Health"])
async def health_check() -> dict:
    """
    Lightweight liveness probe.

    Returns ``{"status": "healthy"}`` when the server is running.
    """
    return {"status": "healthy", "service": "aegis-link-api"}


# ── Startup / Shutdown Events ────────────────────────────────────────


@app.on_event("startup")
async def on_startup() -> None:
    """Log application startup."""
    logger.info(
        "Aegis Link API started (env=%s, origins=%s)",
        settings.app_env,
        settings.cors_origin_list,
    )


@app.on_event("shutdown")
async def on_shutdown() -> None:
    """Log application shutdown."""
    logger.info("Aegis Link API shutting down.")
