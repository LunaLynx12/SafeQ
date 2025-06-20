from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from tortoise.exceptions import DoesNotExist
from models import Account, Folder
from utils.security import verify_password, get_password_hash
from utils.jwt import create_access_token, get_current_user
import config
from kyber import generate_kyber_keys
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from encryption import aes_encrypt2
import os
from encryption import aes_decrypt2
from dilithium_py.dilithium import Dilithium2
from dilithium import sign_message, save_key

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


    # Generate Kyber key pair
    public_key, private_key = generate_kyber_keys()

    # Generate Dilithium key pair
    dilithium_sk, dilithium_pk = Dilithium2.keygen()
    
    # Generate random salt for key derivation
    salt = os.urandom(16)
    
    # Derive encryption key from password
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256-bit key for AES-256
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    encryption_key = kdf.derive(request.password.encode())
    
    # Encrypt private key
    encrypted_private_key = aes_encrypt2(encryption_key, private_key)
    encrypted_dilithium_key = aes_encrypt2(encryption_key, dilithium_sk)

    user = await Account.create(
        username=request.username,
        email=request.email,
        password_hash=get_password_hash(request.password),
        kyber_public_key=public_key,
        kyber_private_key_enc=encrypted_private_key,
        dilithium_public_key=dilithium_pk,
        dilithium_private_key_enc=encrypted_dilithium_key,
        kyber_salt=salt
    )

    # Create user-specific folder in the drive
    user_folder_path = os.path.join(config.drive_location, str(user.id))
    os.makedirs(user_folder_path, exist_ok=True)
    

    return {
        "message": "User created successfully",
        "user_id": user.id,
        "kyber_public_key": public_key.hex(),
        "dilithium_public_key": dilithium_pk.hex()
    }


@router.post("/login")
async def login(request: LoginRequest):
    user = await Account.get_or_none(email=request.email)
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Decrypt private keys during login
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=user.kyber_salt,
        iterations=100000,
        backend=default_backend()
    )
    encryption_key = kdf.derive(request.password.encode())

    try:
        kyber_private_key = aes_decrypt2(encryption_key, user.kyber_private_key_enc)
        dilithium_private_key = aes_decrypt2(encryption_key, user.dilithium_private_key_enc)
        user_public_key = user.kyber_public_key
        user_dilithium_pk = user.dilithium_public_key
    except:
        raise HTTPException(status_code=401, detail="Key decryption failed - possibly wrong password")

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "kyber_pk": user_public_key.hex(),
        "dilithium_pk": user_dilithium_pk.hex()
    }
    
@router.get("/profile")
async def get_profile(current_user: Account = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }

@router.get("/get_users")
async def get_users(current_user: Account = Depends(get_current_user)):
    # For now, just fetch all users
    users = await Account.all().values("id", "username", "email")
    return {"users": users}