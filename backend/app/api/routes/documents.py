"""
Document Vault API routes with server-side AES-256 encryption.
"""

from __future__ import annotations

import base64
import hashlib
import os
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Form, HTTPException, Response, UploadFile, File, status
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.models.schemas import DocumentResponse, DocumentUploadResponse
from app.services import supabase_client as db

router = APIRouter(prefix="/documents", tags=["Document Vault"])


def _encrypt_bytes(data: bytes, secret_key: str) -> str:
    """Encrypt raw bytes using AES-256-GCM and return base64 string."""
    key_bytes = hashlib.sha256(secret_key.encode()).digest()
    aesgcm = AESGCM(key_bytes)
    nonce = os.urandom(12)
    encrypted = aesgcm.encrypt(nonce, data, None)
    return base64.b64encode(nonce + encrypted).decode("utf-8")


def _decrypt_bytes(b64_data: str, secret_key: str) -> bytes:
    """Decrypt base64-encoded AES-256-GCM string into raw bytes."""
    raw = base64.b64decode(b64_data.encode("utf-8"))
    key_bytes = hashlib.sha256(secret_key.encode()).digest()
    aesgcm = AESGCM(key_bytes)
    nonce = raw[:12]
    ciphertext = raw[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and server-side encrypt a document",
)
async def upload_document(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """Upload a document file, encrypt it with AES-256 server-side, and save record."""
    target_patient = patient_id or current_user["user_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "documents")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'documents'",
            )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")

    settings = get_settings()
    encrypted_blob_ref = _encrypt_bytes(contents, settings.document_encryption_key)

    doc = await db.create_document(
        patient_id=target_patient,
        filename=file.filename or "document.bin",
        encrypted_blob_ref=encrypted_blob_ref,
        uploaded_by=current_user["user_id"],
    )

    return {
        "document_id": doc["id"],
        "filename": doc["filename"],
        "uploaded_at": doc["uploaded_at"],
    }


@router.get(
    "/{document_id}",
    summary="Decrypt and stream document after consent check",
)
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Response:
    """Fetch, check access consent, decrypt AES-256 ciphertext, and stream file."""
    doc = await db.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    target_patient = doc["patient_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "documents")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent to view this document",
            )

    settings = get_settings()
    try:
        decrypted_bytes = _decrypt_bytes(doc["encrypted_blob_ref"], settings.document_encryption_key)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decrypt document: {exc}",
        )

    await db.log_audit(
        actor_id=current_user["user_id"],
        action="DOWNLOAD_DOCUMENT",
        target_type="document",
        target_id=document_id,
        metadata={"filename": doc["filename"]},
    )

    return Response(
        content=decrypted_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{doc["filename"]}"'},
    )


@router.get(
    "/",
    response_model=List[DocumentResponse],
    summary="List metadata for all documents belonging to a patient",
)
async def list_documents(
    patient_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """List document metadata for a patient."""
    target_patient = patient_id or current_user["user_id"]
    if target_patient != current_user["user_id"]:
        allowed = await db.check_consent(target_patient, current_user["user_id"], "documents")
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: missing consent for scope 'documents'",
            )
    return await db.get_documents_by_patient(target_patient)
