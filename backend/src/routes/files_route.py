from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException, Path
from fastapi.responses import FileResponse
from pathlib import Path
from utils.jwt import get_current_user
from models import Account, File
import config
import mimetypes
from typing import List
import os


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
            "encryptionStatus": "unencrypted",  # or "encrypted"
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
    # Create user-specific directory if not exists
    user_folder = Path(config.drive_location) / str(user.id)
    user_folder.mkdir(parents=True, exist_ok=True)

    new_files_data = []

    for file in files:
        content = await file.read()
        file_path = user_folder / file.filename

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Get MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        mime_type = mime_type or "application/octet-stream"

        # Save metadata to the database
        db_file = await File.create(
            name=file.filename,
            path=str(file_path),
            owner=user,
            size=len(content),
            mime_type=mime_type,
            encryption_status="unencrypted",
            quantum_key_id="",
            ai_suggestions=[],
            share_links=[],
        )

        new_files_data.append({
            "id": str(db_file.id),
            "name": db_file.name,
            "type": "file",
            "size": db_file.size,
            "mimeType": db_file.mime_type,
            "createdAt": db_file.created_at.isoformat(),
            "modifiedAt": db_file.updated_at.isoformat() if hasattr(db_file, "updated_at") else db_file.created_at.isoformat(),
            "isStarred": False,
            "isShared": False,
            "owner": user.email,
            "path": db_file.path,
            "version": 1,
            "encryptionStatus": db_file.encryption_status,
            "quantumKeyId": db_file.quantum_key_id,
            "aiSuggestions": db_file.ai_suggestions,
            "shareLinks": db_file.share_links,
        })

    return {
        "message": "Files uploaded successfully",
        "newFiles": new_files_data
    }

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