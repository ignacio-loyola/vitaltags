from typing import Annotated, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, Field
from ..db import get_session
from ..deps import get_current_user_id
from ..models.profile import Profile

router = APIRouter()


class ProfileUpdate(BaseModel):
    alias: Optional[str] = Field(None, min_length=1, max_length=100)
    yob: Optional[int] = Field(None, ge=1900, le=2024)
    blood_type: Optional[str] = Field(None, regex="^(A|B|AB|O)$")
    rh_factor: Optional[str] = Field(None, regex="^(\+|\-)$")
    donor_status: Optional[bool] = None
    primary_langs: Optional[List[str]] = None
    ice_name: Optional[str] = Field(None, max_length=200)
    ice_phone: Optional[str] = Field(None, max_length=50)
    ice_relationship: Optional[str] = Field(None, max_length=100)
    
    # Privacy settings
    public_alias: Optional[bool] = None
    public_yob: Optional[bool] = None
    public_blood: Optional[bool] = None
    public_languages: Optional[bool] = None
    public_ice: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    alias: str
    yob: Optional[int]
    blood_type: Optional[str]
    rh_factor: Optional[str]
    donor_status: Optional[bool]
    primary_langs: List[str]
    ice_name: Optional[str]
    ice_phone: Optional[str]
    ice_relationship: Optional[str]
    public_alias: bool
    public_yob: bool
    public_blood: bool
    public_languages: bool
    public_ice: bool
    last_updated_at: datetime
    created_at: datetime


@router.get("/profile", response_model=ProfileResponse, summary="Get user profile")
async def get_profile(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get the authenticated user's profile"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == user_id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.put("/profile", response_model=ProfileResponse, summary="Update user profile")
async def update_profile(
    profile_update: ProfileUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update the authenticated user's profile"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == user_id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update fields that were provided
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    profile.last_updated_at = datetime.utcnow()
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    
    return profile


@router.get("/profile/privacy", summary="Get privacy settings summary")
async def get_privacy_settings(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get summary of what information is public"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == user_id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    public_fields = []
    if profile.public_alias:
        public_fields.append("alias")
    if profile.public_yob:
        public_fields.append("year_of_birth")
    if profile.public_blood:
        public_fields.append("blood_type")
    if profile.public_languages:
        public_fields.append("languages")
    if profile.public_ice:
        public_fields.append("emergency_contact")
    
    return {
        "public_fields": public_fields,
        "total_public_fields": len(public_fields),
        "privacy_level": "high" if len(public_fields) <= 2 else "medium" if len(public_fields) <= 4 else "low"
    }