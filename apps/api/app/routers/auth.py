from typing import Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from ..db import get_session
from ..models.user import User
from ..models.profile import Profile
from ..security import create_access_token, create_magic_link_token, verify_magic_link_token
from ..rate_limit import check_rate_limit
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class MagicLinkRequest(BaseModel):
    email: EmailStr


class MagicLinkVerify(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int


async def send_magic_link_email(email: str, token: str):
    """
    Send magic link email (placeholder - implement with your email service)
    In production, integrate with SendGrid, AWS SES, or similar
    """
    from ..config import settings
    
    magic_url = f"{settings.MAGICLINK_BASE_URL}/auth/verify?token={token}"
    
    # Placeholder - log the magic link for development
    logger.info(f"Magic link for {email}: {magic_url}")
    
    # TODO: Implement actual email sending
    # email_service.send(
    #     to=email,
    #     from_email=settings.MAGICLINK_FROM,
    #     subject="Your Vital Tags login link",
    #     template="magic_link",
    #     context={"magic_url": magic_url}
    # )


@router.post("/magic-link", summary="Request magic link")
async def request_magic_link(
    request: Request,
    magic_request: MagicLinkRequest,
    background_tasks: BackgroundTasks,
    session: Annotated[Session, Depends(get_session)]
):
    """Send magic link to user's email"""
    # Rate limiting: max 3 requests per 5 minutes
    check_rate_limit(request, "magic_link", max_requests=3, window_seconds=300)
    
    email = magic_request.email.lower()
    
    # Check if user exists, create if not
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        user = User(email=email, gdpr_consent_at=datetime.utcnow())
        session.add(user)
        session.commit()
        session.refresh(user)
        
        # Create default profile
        profile = Profile(
            user_id=user.id,
            alias="Anonymous",
            primary_langs=["en"]
        )
        session.add(profile)
        session.commit()
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Generate magic link token
    token = create_magic_link_token(email)
    
    # Send email in background
    background_tasks.add_task(send_magic_link_email, email, token)
    
    return {"message": "Magic link sent to your email"}


@router.post("/verify", response_model=AuthResponse, summary="Verify magic link")
async def verify_magic_link(
    request: Request,
    verify_request: MagicLinkVerify,
    session: Annotated[Session, Depends(get_session)]
):
    """Verify magic link token and return JWT"""
    # Rate limiting: max 5 attempts per minute
    check_rate_limit(request, "verify_magic", max_requests=5, window_seconds=60)
    
    # Verify token
    email = verify_magic_link_token(verify_request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Find user
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    session.add(user)
    session.commit()
    
    # Create JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user_id=user.id
    )


@router.post("/logout", summary="Logout user")
async def logout():
    """
    Logout endpoint (JWT tokens are stateless, so this is mainly for client cleanup)
    In a production app, you might maintain a token blacklist in Redis
    """
    return {"message": "Logged out successfully"}


@router.delete("/account", summary="Delete account (GDPR)")
async def delete_account(
    current_user: Annotated[User, Depends(lambda: None)],  # Will implement dependency
    session: Annotated[Session, Depends(get_session)]
):
    """
    Delete user account and all associated data (GDPR Right to Erasure)
    This is a placeholder - full implementation needed
    """
    # TODO: Implement full cascade deletion:
    # 1. Delete all profiles
    # 2. Delete all tags  
    # 3. Delete all medical records
    # 4. Delete scan logs (or anonymize)
    # 5. Delete user
    
    return {"message": "Account deletion initiated"}