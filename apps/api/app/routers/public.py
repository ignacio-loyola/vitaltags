from typing import Annotated, Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Query, Depends
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from pydantic import BaseModel
import logging
import hashlib
from ..db import get_session
from ..models.tag import Tag
from ..models.profile import Profile
from ..models.medical import Condition, Allergy, Medication
from ..models.scan import ScanLog
from ..rate_limit import check_rate_limit, hash_ip, get_client_ip
import user_agents
import pycountry

router = APIRouter()
logger = logging.getLogger(__name__)


class EmergencyInfoResponse(BaseModel):
    # Profile info (filtered by privacy settings)
    alias: Optional[str] = None
    yob: Optional[int] = None
    languages: Optional[List[str]] = None
    blood_type: Optional[str] = None
    rh_factor: Optional[str] = None
    
    # Emergency contact (if public)
    ice_name: Optional[str] = None
    ice_phone: Optional[str] = None
    ice_relationship: Optional[str] = None
    
    # Medical information (only public records)
    conditions: List[Dict[str, Any]] = []
    allergies: List[Dict[str, Any]] = []
    medications: List[Dict[str, Any]] = []
    
    # Metadata
    last_updated: datetime
    scan_id: Optional[int] = None


def get_country_from_request(request: Request) -> Optional[str]:
    """Extract country from request headers (if behind proxy/CDN)"""
    # Check CloudFlare header
    country = request.headers.get("CF-IPCountry")
    if country and country != "XX":
        return country.upper()
    
    # Check other common headers
    country = request.headers.get("X-Country-Code")
    if country:
        return country.upper()
    
    # In production, you might use GeoIP lookup here
    return None


def log_scan(
    request: Request,
    tag: Tag,
    session: Session
) -> Optional[int]:
    """Log emergency page scan for analytics"""
    try:
        # Get client info
        ip = get_client_ip(request)
        ip_hash = hash_ip(ip) if ip else None
        
        user_agent = request.headers.get("User-Agent", "")
        user_agent_hash = hashlib.sha256(user_agent.encode()).hexdigest()[:16] if user_agent else None
        
        country = get_country_from_request(request)
        
        # Extract domain from referer for privacy
        referer = request.headers.get("Referer", "")
        referer_domain = None
        if referer:
            try:
                from urllib.parse import urlparse
                parsed = urlparse(referer)
                referer_domain = parsed.netloc if parsed.netloc else None
            except:
                pass
        
        # Create scan log
        scan_log = ScanLog(
            tag_id=tag.id,
            country=country,
            user_agent_hash=user_agent_hash,
            referer_domain=referer_domain,
            scan_method="web",
            ip_hash=ip_hash
        )
        
        session.add(scan_log)
        
        # Update tag scan count
        tag.scan_count += 1
        tag.last_scanned_at = datetime.utcnow()
        session.add(tag)
        
        session.commit()
        session.refresh(scan_log)
        
        return scan_log.id
        
    except Exception as e:
        logger.error(f"Error logging scan for tag {tag.short_id}: {e}")
        # Don't fail the emergency request due to logging errors
        return None


@router.get("/e/{short_id}", 
           response_model=EmergencyInfoResponse,
           summary="Get emergency information",
           description="Public endpoint to access emergency medical information")
async def get_emergency_info(
    short_id: str,
    request: Request,
    session: Annotated[Session, Depends(get_session)],
    lang: Optional[str] = Query(None, description="Language preference (ISO 639-1)", regex="^[a-z]{2}$"),
    format: Optional[str] = Query("json", description="Response format", regex="^(json|minimal)$"),
    no_log: bool = Query(False, description="Skip scan logging (for testing)")
):
    """
    Get emergency medical information for a tag.
    
    This endpoint is designed to be:
    - Fast (<500ms response time)
    - Cacheable at the edge
    - Privacy-preserving (no PII in logs beyond hashed IPs)
    - Accessible without authentication
    """
    
    # Rate limiting: generous limits for emergency use
    # 60 requests per minute per IP should handle most emergency scenarios
    check_rate_limit(request, "emergency_access", max_requests=60, window_seconds=60)
    
    # Find the tag
    tag = session.exec(
        select(Tag).where(
            Tag.short_id == short_id,
            Tag.status == "active"
        )
    ).first()
    
    if not tag:
        # Log attempt for security monitoring
        logger.warning(f"Access attempt for invalid/revoked tag: {short_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency tag not found or has been disabled"
        )
    
    # Get profile
    profile = session.get(Profile, tag.profile_id)
    if not profile:
        logger.error(f"Profile not found for tag {short_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile information unavailable"
        )
    
    # Log the scan (unless disabled)
    scan_id = None
    if not no_log:
        scan_id = log_scan(request, tag, session)
    
    # Build response based on privacy settings
    response = EmergencyInfoResponse(
        last_updated=profile.last_updated_at,
        scan_id=scan_id
    )
    
    # Add profile information based on privacy settings
    if profile.public_alias:
        response.alias = profile.alias
    
    if profile.public_yob:
        response.yob = profile.yob
    
    if profile.public_languages:
        response.languages = profile.primary_langs
    
    if profile.public_blood:
        response.blood_type = profile.blood_type
        response.rh_factor = profile.rh_factor
    
    if profile.public_ice:
        response.ice_name = profile.ice_name
        response.ice_phone = profile.ice_phone
        response.ice_relationship = profile.ice_relationship
    
    # Get medical information (only public records)
    
    # Conditions
    conditions = session.exec(
        select(Condition).where(
            Condition.profile_id == profile.id,
            Condition.is_public == True
        ).order_by(Condition.created_at.desc())
    ).all()
    
    response.conditions = [
        {
            "display": condition.display,
            "severity": condition.severity,
            "coded": condition.coded,
            "code": condition.code if condition.coded else None,
            "system": condition.code_system if condition.coded else None,
            "notes": condition.notes if len(condition.notes or "") < 100 else None  # Limit notes length
        }
        for condition in conditions
    ]
    
    # Allergies (critical for emergency care)
    allergies = session.exec(
        select(Allergy).where(
            Allergy.profile_id == profile.id,
            Allergy.is_public == True
        ).order_by(Allergy.severity.desc(), Allergy.created_at.desc())  # Severe first
    ).all()
    
    response.allergies = [
        {
            "display": allergy.display,
            "reaction": allergy.reaction,
            "severity": allergy.severity,
            "onset": allergy.onset,
            "coded": allergy.coded,
            "code": allergy.substance_code if allergy.coded else None,
            "system": allergy.substance_system if allergy.coded else None
        }
        for allergy in allergies
    ]
    
    # Medications (only active)
    medications = session.exec(
        select(Medication).where(
            Medication.profile_id == profile.id,
            Medication.is_public == True,
            Medication.status == "active"
        ).order_by(Medication.created_at.desc())
    ).all()
    
    response.medications = [
        {
            "display": medication.display,
            "dose": medication.dose,
            "route": medication.route,
            "frequency": medication.frequency,
            "coded": medication.coded,
            "code": medication.drug_code if medication.coded else None,
            "system": medication.drug_system if medication.coded else None
        }
        for medication in medications
    ]
    
    # Handle different response formats
    if format == "minimal":
        # Minimal format for basic emergency info
        minimal_response = {
            "alias": response.alias,
            "yob": response.yob,
            "blood_type": f"{response.blood_type}{response.rh_factor}" if response.blood_type else None,
            "critical_allergies": [
                a["display"] for a in response.allergies 
                if a.get("severity") in ["severe", "fatal"]
            ][:3],  # Top 3 critical allergies
            "languages": response.languages
        }
        return JSONResponse(content=minimal_response)
    
    return response


@router.get("/e/{short_id}/qr", summary="Get QR code for tag")
async def get_tag_qr(
    short_id: str,
    request: Request,
    session: Annotated[Session, Depends(get_session)],
    format: str = Query("png", regex="^(png|svg)$")
):
    """Get QR code image for a tag"""
    # Basic rate limiting
    check_rate_limit(request, "qr_access", max_requests=30, window_seconds=60)
    
    # Find the tag
    tag = session.exec(
        select(Tag).where(
            Tag.short_id == short_id,
            Tag.status == "active"
        )
    ).first()
    
    if not tag or not tag.qr_generated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="QR code not found"
        )
    
    from ..config import settings
    
    if format == "png":
        qr_url = f"{settings.S3_PUBLIC_BASE}/qr/{short_id}.png"
    else:
        qr_url = f"{settings.S3_PUBLIC_BASE}/qr/{short_id}.svg"
    
    # Return redirect to S3 URL (let CDN/S3 handle caching)
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=qr_url, status_code=302)


@router.get("/e/{short_id}/pdf", summary="Get PDF for tag")
async def get_tag_pdf(
    short_id: str,
    request: Request,
    session: Annotated[Session, Depends(get_session)]
):
    """Get PDF file for a tag"""
    # Basic rate limiting
    check_rate_limit(request, "pdf_access", max_requests=10, window_seconds=60)
    
    # Find the tag
    tag = session.exec(
        select(Tag).where(
            Tag.short_id == short_id,
            Tag.status == "active"
        )
    ).first()
    
    if not tag or not tag.pdf_generated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF not found"
        )
    
    from ..config import settings
    pdf_url = f"{settings.S3_PUBLIC_BASE}/pdf/{short_id}.pdf"
    
    # Return redirect to S3 URL
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=pdf_url, status_code=302)


@router.get("/health", summary="Health check")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "vital-tags-api"
    }


@router.get("/stats", summary="Public statistics")
async def public_stats(
    session: Annotated[Session, Depends(get_session)]
):
    """Get anonymized public statistics"""
    try:
        # Count active tags
        active_tags = len(session.exec(
            select(Tag).where(Tag.status == "active")
        ).all())
        
        # Count total scans (privacy-preserving)
        total_scans = session.exec(
            select(ScanLog)
        ).all()
        scan_count = len(total_scans)
        
        # Count countries seen (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_scans = session.exec(
            select(ScanLog).where(ScanLog.ts >= thirty_days_ago)
        ).all()
        
        countries = set(scan.country for scan in recent_scans if scan.country)
        
        return {
            "active_tags": active_tags,
            "total_scans": scan_count,
            "countries_reached": len(countries),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating public stats: {e}")
        return {
            "active_tags": 0,
            "total_scans": 0,
            "countries_reached": 0,
            "last_updated": datetime.utcnow().isoformat()
        }