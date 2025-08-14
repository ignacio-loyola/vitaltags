from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer
from sqlmodel import Session, select
from jose import JWTError, jwt
from .db import get_session
from .models.user import User
from .config import settings

security = HTTPBearer(auto_error=False)


def get_current_user_id(
    session: Annotated[Session, Depends(get_session)],
    authorization: Annotated[Optional[str], Header()] = None,
) -> int:
    """Extract user ID from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )
    
    return int(user_id)


def get_current_user(
    session: Annotated[Session, Depends(get_session)],
    user_id: Annotated[int, Depends(get_current_user_id)]
) -> User:
    """Get current authenticated user"""
    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    return user


def get_optional_user_id(
    authorization: Annotated[Optional[str], Header()] = None,
) -> Optional[int]:
    """Extract user ID from JWT token, return None if not present/invalid"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: Optional[int] = payload.get("sub")
        return int(user_id) if user_id else None
    except JWTError:
        return None