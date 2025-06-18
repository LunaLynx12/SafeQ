from datetime import datetime, timedelta
from jose import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException, status
from models import Account
import config

bearer_security = HTTPBearer()
verbose_check = config.server_verbose

def create_access_token(data: dict):
    to_encode = data.copy()

    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    expire = datetime.utcnow() + timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM
    )
    if verbose_check:
        print(f"[DEBUG] Created JWT: {encoded_jwt}")
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_security)
):
    token = credentials.credentials
    if verbose_check:
        print(f"[DEBUG] Received JWT: {token}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET_KEY,
            algorithms=[config.JWT_ALGORITHM]
        )
        if verbose_check:
            print(f"[DEBUG] Decoded JWT Payload: {payload}")

        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        
        user_id = int(user_id_str)  # Convert back to int for querying the DB
    except Exception as e:
        if verbose_check:
            print(f"[ERROR] JWT Decode Failed: {e}")
        raise credentials_exception

    user = await Account.get_or_none(id=user_id)
    if user is None:
        if verbose_check:
            print(f"[ERROR] User not found with ID: {user_id}")
        raise credentials_exception

    return user