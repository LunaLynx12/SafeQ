from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException, Path
from fastapi.responses import FileResponse
from pathlib import Path
from utils.jwt import get_current_user
from models import Account, File
import config
import os


router = APIRouter(prefix="/drive", tags=["Drive"])


@router.get("/get")
async def list_files(user: Account = Depends(get_current_user)):
    # Get all files for the current user
    files = await File.filter(owner=user)
    
    # Return them as a list of dicts
    return [
        {
            "id": f.id,
            "name": f.name,
            "path": f.path
        }
        for f in files
    ]

@router.post("/save")
async def save_file(
    file: UploadFile = FastAPIFile(...),
    user: Account = Depends(get_current_user)
):
    # Create user-specific directory if not exists
    user_folder = Path(config.drive_location) / str(user.id)
    user_folder.mkdir(parents=True, exist_ok=True)

    # Save the file to disk
    file_path = user_folder / file.filename
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Save file metadata to the database
    db_file = await File.create(
        name=file.filename,
        path=str(file_path),
        owner=user
    )

    return {
        "message": "File uploaded successfully",
        "file_id": db_file.id,
        "filename": file.filename
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

    return FileResponse(path=db_file.path, filename=db_file.name)