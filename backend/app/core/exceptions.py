"""
Custom exception handlers registered on the FastAPI application.

Keeps error responses consistent and avoids leaking internal details
in production.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse


class AegisLinkException(Exception):
    """Base exception for Aegis Link application errors."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class SupabaseOperationError(AegisLinkException):
    """Raised when a Supabase database operation fails."""

    def __init__(self, message: str = "Database operation failed") -> None:
        super().__init__(message=message, status_code=502)


class GroqServiceError(AegisLinkException):
    """Raised when the Groq AI service returns an error or is unavailable."""

    def __init__(self, message: str = "AI service is currently unavailable") -> None:
        super().__init__(message=message, status_code=503)


class InsufficientPermissionsError(AegisLinkException):
    """Raised when a user lacks the required role for an operation."""

    def __init__(self, message: str = "You do not have permission to perform this action") -> None:
        super().__init__(message=message, status_code=403)


def register_exception_handlers(app: FastAPI) -> None:
    """Attach custom exception handlers to the FastAPI application."""

    @app.exception_handler(AegisLinkException)
    async def aegis_link_exception_handler(
        _request: Request, exc: AegisLinkException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message},
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        _request: Request, exc: HTTPException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        _request: Request, _exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected internal error occurred."},
        )
