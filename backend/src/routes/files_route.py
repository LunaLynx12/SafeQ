from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException, Path
from fastapi.responses import FileResponse, Response
from pathlib import Path
from utils.jwt import get_current_user
from models import Account, File
import config
import mimetypes
from typing import List
import os

from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from encryption import aes_encrypt2, aes_decrypt2, derive_key2
import secrets

router = APIRouter(prefix="/drive", tags=["Drive"])


@router.get("/get")
async def list_files(user: Account = Depends(get_current_user)):
    files = await File.filter(owner=user)
    
    return [
        {
            "id": str(f.id),
            "name": f.name,
            "type": "file",  # or "folder" if it's a folder model
            "size": f.size,
            "mimeType": "",  # optional - you can add this if you store it
            "createdAt": f.created_at.isoformat(),
            "modifiedAt": f.updated_at.isoformat() if hasattr(f, "updated_at") else f.created_at.isoformat(),
            "isStarred": False,  # Add this field if you have it in your model
            "isShared": False,   # Add this field if you have it in your model
            "owner": user.email, # or username
            "path": f.path,
            "version": 1,        # Add this if you track versions
            "encryptionStatus": "encrypted",
            "quantumKeyId": "",  # Add this if you use encryption keys
            "aiSuggestions": [], # Optional AI suggestions
            "shareLinks": []     # Optional share links
        }
        for f in files
    ]

@router.post("/save")
async def save_file(
    files: List[UploadFile] = FastAPIFile(...),
    user: Account = Depends(get_current_user)
):
    user_folder = Path(config.drive_location) / str(user.id)
    user_folder.mkdir(parents=True, exist_ok=True)
    new_files_data = []

    for file in files:
        try:
            # 1. Generate random file key
            file_key = secrets.token_bytes(32)  # AES-256 key
            
            # 2. Prepare proper 32-byte encryption key
            aes_key = user.kyber_public_key[:32]
            if len(aes_key) < 32:
                aes_key = aes_key.ljust(32, b'\0')[:32]
            
            # 3. Encrypt the file key
            encrypted_file_key = aes_encrypt2(aes_key, file_key)
            
            # 4. Encrypt the content
            content = await file.read()
            encrypted_content = aes_encrypt2(file_key, content)
            import hashlib
            content_hash = hashlib.sha256(encrypted_content).hexdigest()

            dilithium_signature = secrets.token_bytes(64)
            metadata = f"{user.id}:{file.filename}:{len(content)}".encode()
            metadata_signature = secrets.token_bytes(64)
            
            # Save to disk
            file_path = user_folder / file.filename
            with open(file_path, "wb") as f:
                f.write(encrypted_content)
            
            # Save metadata
            db_file = await File.create(
                name=file.filename,
                path=str(file_path),
                owner=user,
                size=len(content),
                mime_type=mimetypes.guess_type(file.filename)[0] or "application/octet-stream",
                encryption_status="encrypted",
                quantum_key_id=str(user.id),
                encryption_key_ciphertext=encrypted_file_key,
                nonce=encrypted_content[:12],  # First 12 bytes are nonce
                tag=encrypted_content[12:28],   # Next 16 bytes are tag
                content_hash=content_hash,
                content_signature=dilithium_signature,
                metadata_signature=metadata_signature
            )
            
            new_files_data.append({
                "id": str(db_file.id),
                "name": db_file.name,
                "type": "file",
                "size": db_file.size,
                "mimeType": db_file.mime_type,
                "encryptionStatus": "encrypted",
                "contentHash": content_hash
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process file {file.filename}: {str(e)}")

    return {"message": "Files uploaded securely", "newFiles": new_files_data}

@router.get("/download_encrypted/{file_id}")
async def download_file(
    file_id: int,
    user: Account = Depends(get_current_user)
):
    file = await File.get_or_none(id=file_id, owner=user)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # 1. Read encrypted file
        with open(file.path, "rb") as f:
            encrypted_content = f.read()
        
        # 2. Get proper AES key (32 bytes for AES-256)
        # Using first 32 bytes of public key as placeholder
        # Ensure we have exactly 32 bytes
        aes_key = user.kyber_public_key[:32]
        if len(aes_key) < 32:
            aes_key = aes_key.ljust(32, b'\0')[:32]  # Pad with zeros if needed
        
        # 3. Decrypt the file key
        file_key_bytes = aes_decrypt2(
            key=aes_key,
            data=file.encryption_key_ciphertext
        )
        
        # 4. Ensure decrypted file key is 32 bytes
        if len(file_key_bytes) != 32:
            raise ValueError("Decrypted file key is not 32 bytes")
        
        # 5. Decrypt the content
        decrypted_content = aes_decrypt2(
            key=file_key_bytes,
            data=encrypted_content
        )
        
        return Response(
            content=decrypted_content,
            media_type=file.mime_type,
            headers={"Content-Disposition": f"attachment; filename={file.name}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decrypt file: {str(e)}")


@router.post("/delete")
async def delete_file(
    file_id: int,
    user: Account = Depends(get_current_user)
):
    # Find the file in the DB
    db_file = await File.get_or_none(id=file_id, owner=user)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    # Remove from disk
    try:
        os.remove(db_file.path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

    # Delete from DB
    await db_file.delete()

    return {"message": "File deleted successfully"}

@router.get("/download/{file_id}")
async def download_file(
    file_id: int,
    user: Account = Depends(get_current_user)
):
    db_file = await File.get_or_none(id=file_id, owner=user)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=db_file.path,
        filename=db_file.name,
        media_type=db_file.mime_type or "application/octet-stream"
    )