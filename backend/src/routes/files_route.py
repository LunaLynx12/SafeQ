from fastapi import APIRouter, Depends, UploadFile, File as FastAPIFile, HTTPException, Path
from fastapi.responses import FileResponse
from pathlib import Path
from models import Account, File
import config
import os


router = APIRouter(prefix="/drive", tags=["Drive"])


#def ensure_path_exists(path: str):
#    path_obj = Path(path)
#    path_obj.parent.mkdir(parents=True, exist_ok=True)


#@router.get("/")
#async def list_files(user: Account):
#    files = await File.filter(owner=user)
#    return [{"id": f.id, "name": f.name, "path": f.path} for f in files]


#@router.get("/{file_id}")
#@router.post("/upload")
#@router.get("/{file_id}/download")
#@router.delete("/{file_id}")

@router.get("/")
async def helloworld():
    return "Hello, world"