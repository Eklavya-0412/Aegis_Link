"""
Supabase JWT validation logic.

Provides a reusable dependency that extracts the Bearer token from the
``Authorization`` header, verifies it against the Supabase JWT secret,
and returns the decoded payload including the user's ``sub`` (user ID)
and any custom ``app_metadata`` / ``user_metadata`` claims.
"""

from __future__ import annotations

from typing import Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import Settings, get_settings

# FastAPI security scheme – extracts the Bearer token automatically.
_bearer_scheme = HTTPBearer()


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> Dict[str, Any]:
    """
    Validate the Supabase-issued JWT and return the decoded claims.

    Raises:
        HTTPException 401: If the token is missing, expired, or the
            signature cannot be verified.

    Returns:
        The full decoded JWT payload dict, which typically contains::

            {
                "sub": "<user-uuid>",
                "email": "...",
                "role": "authenticated",
                "app_metadata": {"role": "patient"},
                "user_metadata": {...},
                "exp": ...,
                ...
            }
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure the token carries a subject (user ID).
    if not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing 'sub' claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload
