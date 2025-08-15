from typing import Annotated, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from ..db import get_session
from ..deps import get_current_user_id
from ..models.profile import Profile
from ..models.tag import Tag
from ..services.qr import store_qr_code, delete_qr_code
from ..services.pdf import generate_single_tag_pdf, store_pdf, delete_pdf
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class TagCreate(BaseModel):
    tag_type: str = "qr"  # qr, nfc, card
    physical_id: Optional[str] = None


class TagResponse(BaseModel):
    id: int
    profile_id: int
    short_id: str
    tag_type: str
    physical_id: Optional[str]
    status: str
    qr_generated: bool
    qr_s3_key: Optional[str]
    pdf_generated: bool
    pdf_s3_key: Optional[str]
    created_at: datetime
    activated_at: Optional[datetime]
    revoked_at: Optional[datetime]
    scan_count: int
    last_scanned_at: Optional[datetime]
    
    # Computed fields
    qr_url: Optional[str] = None
    pdf_url: Optional[str] = None
    emergency_url: str


class TagStats(BaseModel):
    total_scans: int
    last_scan: Optional[datetime]
    active_tags: int
    revoked_tags: int


async def get_profile_id(user_id: int, session: Session) -> int:
    """Helper to get profile ID from user ID"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == user_id)
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    return profile.id


async def generate_tag_assets(tag_id: int, session: Session):
    """Background task to generate QR code and PDF"""
    try:
        tag = session.get(Tag, tag_id)
        if not tag:
            logger.error(f"Tag {tag_id} not found for asset generation")
            return
        
        profile = session.get(Profile, tag.profile_id)
        if not profile:
            logger.error(f"Profile {tag.profile_id} not found for tag {tag_id}")
            return
        
        # Generate QR code
        try:
            qr_results = store_qr_code(tag.short_id, formats=["png"])
            if qr_results.get("png"):
                tag.qr_generated = True
                tag.qr_s3_key = f"qr/{tag.short_id}.png"
        except Exception as e:
            logger.error(f"Error generating QR code for tag {tag_id}: {e}")
        
        # Generate PDF
        try:
            pdf_bytes = generate_single_tag_pdf(tag.short_id, profile.alias)
            pdf_url = store_pdf(tag.short_id, pdf_bytes)
            tag.pdf_generated = True
            tag.pdf_s3_key = f"pdf/{tag.short_id}.pdf"
        except Exception as e:
            logger.error(f"Error generating PDF for tag {tag_id}: {e}")
        
        session.add(tag)
        session.commit()
        
    except Exception as e:
        logger.error(f"Error in generate_tag_assets for tag {tag_id}: {e}")


@router.get("/tags", response_model=List[TagResponse], summary="Get user tags")
async def get_tags(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)],
    status_filter: Optional[str] = Query(None, pattern="^(active|revoked|suspended)$"),
    tag_type: Optional[str] = Query(None, pattern="^(qr|nfc|card)$")
):
    """Get all tags for the authenticated user"""
    profile_id = await get_profile_id(user_id, session)
    
    query = select(Tag).where(Tag.profile_id == profile_id)
    if status_filter:
        query = query.where(Tag.status == status_filter)
    if tag_type:
        query = query.where(Tag.tag_type == tag_type)
    
    tags = session.exec(query.order_by(Tag.created_at.desc())).all()
    
    # Enhance with computed fields
    from ..config import settings
    for tag in tags:
        tag.emergency_url = f"{settings.PUBLIC_CDN_BASE}/e/{tag.short_id}"
        if tag.qr_generated and tag.qr_s3_key:
            tag.qr_url = f"{settings.S3_PUBLIC_BASE}/{tag.qr_s3_key}"
        if tag.pdf_generated and tag.pdf_s3_key:
            tag.pdf_url = f"{settings.S3_PUBLIC_BASE}/{tag.pdf_s3_key}"
    
    return tags


@router.post("/tags", response_model=TagResponse, summary="Create new tag")
async def create_tag(
    tag_data: TagCreate,
    background_tasks: BackgroundTasks,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Create a new emergency tag"""
    profile_id = await get_profile_id(user_id, session)
    
    # Check tag limits (free tier: max 3 tags)
    existing_tags = session.exec(
        select(Tag).where(
            Tag.profile_id == profile_id,
            Tag.status == "active"
        )
    ).all()
    
    if len(existing_tags) >= 3:  # TODO: Make this configurable based on user plan
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tag limit reached. Revoke unused tags or upgrade your plan."
        )
    
    # Create tag
    tag = Tag(
        profile_id=profile_id,
        tag_type=tag_data.tag_type,
        physical_id=tag_data.physical_id,
        activated_at=datetime.utcnow()
    )
    
    session.add(tag)
    session.commit()
    session.refresh(tag)
    
    # Generate QR code and PDF in background
    background_tasks.add_task(generate_tag_assets, tag.id, session)
    
    # Return response with computed fields
    from ..config import settings
    tag.emergency_url = f"{settings.PUBLIC_CDN_BASE}/e/{tag.short_id}"
    
    return tag


@router.get("/tags/{tag_id}", response_model=TagResponse, summary="Get single tag")
async def get_tag(
    tag_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get a specific tag"""
    profile_id = await get_profile_id(user_id, session)
    
    tag = session.exec(
        select(Tag).where(
            Tag.id == tag_id,
            Tag.profile_id == profile_id
        )
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Add computed fields
    from ..config import settings
    tag.emergency_url = f"{settings.PUBLIC_CDN_BASE}/e/{tag.short_id}"
    if tag.qr_generated and tag.qr_s3_key:
        tag.qr_url = f"{settings.S3_PUBLIC_BASE}/{tag.qr_s3_key}"
    if tag.pdf_generated and tag.pdf_s3_key:
        tag.pdf_url = f"{settings.S3_PUBLIC_BASE}/{tag.pdf_s3_key}"
    
    return tag


@router.put("/tags/{tag_id}/revoke", summary="Revoke tag")
async def revoke_tag(
    tag_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Revoke a tag (makes it inaccessible)"""
    profile_id = await get_profile_id(user_id, session)
    
    tag = session.exec(
        select(Tag).where(
            Tag.id == tag_id,
            Tag.profile_id == profile_id
        )
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    if tag.status == "revoked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag is already revoked"
        )
    
    tag.status = "revoked"
    tag.revoked_at = datetime.utcnow()
    
    session.add(tag)
    session.commit()
    
    return {"message": "Tag revoked successfully"}


@router.put("/tags/{tag_id}/reactivate", summary="Reactivate tag")
async def reactivate_tag(
    tag_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Reactivate a revoked tag"""
    profile_id = await get_profile_id(user_id, session)
    
    tag = session.exec(
        select(Tag).where(
            Tag.id == tag_id,
            Tag.profile_id == profile_id
        )
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    if tag.status != "revoked":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag is not revoked"
        )
    
    tag.status = "active"
    tag.revoked_at = None
    
    session.add(tag)
    session.commit()
    
    return {"message": "Tag reactivated successfully"}


@router.delete("/tags/{tag_id}", summary="Delete tag permanently")
async def delete_tag(
    tag_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Permanently delete a tag and all associated assets"""
    profile_id = await get_profile_id(user_id, session)
    
    tag = session.exec(
        select(Tag).where(
            Tag.id == tag_id,
            Tag.profile_id == profile_id
        )
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Delete associated files from S3
    try:
        delete_qr_code(tag.short_id)
        delete_pdf(tag.short_id)
    except Exception as e:
        logger.warning(f"Error deleting assets for tag {tag.short_id}: {e}")
    
    # Delete tag from database
    session.delete(tag)
    session.commit()
    
    return {"message": "Tag deleted permanently"}


@router.post("/tags/{tag_id}/regenerate", summary="Regenerate tag assets")
async def regenerate_tag_assets(
    tag_id: int,
    background_tasks: BackgroundTasks,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Regenerate QR code and PDF for a tag"""
    profile_id = await get_profile_id(user_id, session)
    
    tag = session.exec(
        select(Tag).where(
            Tag.id == tag_id,
            Tag.profile_id == profile_id
        )
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Reset generation flags
    tag.qr_generated = False
    tag.pdf_generated = False
    tag.qr_s3_key = None
    tag.pdf_s3_key = None
    
    session.add(tag)
    session.commit()
    
    # Regenerate assets in background
    background_tasks.add_task(generate_tag_assets, tag.id, session)
    
    return {"message": "Tag asset regeneration started"}


@router.get("/tags/stats", response_model=TagStats, summary="Get tag statistics")
async def get_tag_stats(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get usage statistics for user's tags"""
    profile_id = await get_profile_id(user_id, session)
    
    tags = session.exec(
        select(Tag).where(Tag.profile_id == profile_id)
    ).all()
    
    total_scans = sum(tag.scan_count for tag in tags)
    last_scan = max((tag.last_scanned_at for tag in tags if tag.last_scanned_at), default=None)
    active_tags = len([tag for tag in tags if tag.status == "active"])
    revoked_tags = len([tag for tag in tags if tag.status == "revoked"])
    
    return TagStats(
        total_scans=total_scans,
        last_scan=last_scan,
        active_tags=active_tags,
        revoked_tags=revoked_tags
    )