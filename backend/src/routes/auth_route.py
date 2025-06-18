from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from tortoise.exceptions import DoesNotExist
from models import Account, Folder
from utils.security import verify_password, get_password_hash
from utils.jwt import create_access_token, get_current_user
import config
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register_user(request: RegisterRequest):
    if await Account.exists(email=request.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await Account.create(
        username=request.username,
        email=request.email,
        password_hash=get_password_hash(request.password)
    )

    # Create user-specific folder in the drive
    user_folder_path = os.path.join(config.drive_location, str(user.id))
    os.makedirs(user_folder_path, exist_ok=True)

    return {"message": "User created successfully", "user_id": user.id}


@router.post("/login")
async def login_user(request: LoginRequest):
    try:
        user = await Account.get(email=request.email)
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate a JWT token
        access_token = create_access_token(data={"sub": user.id})

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer"
        }
    except DoesNotExist:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
@router.get("/profile")
async def get_profile(current_user: Account = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }