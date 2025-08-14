from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
import secrets
import string


def generate_short_id() -> str:
    """Generate a URL-safe short ID for tags"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(8))


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id", index=True)
    
    # Public identifier - no PII
    short_id: str = Field(
        default_factory=generate_short_id,
        index=True,
        unique=True,
        max_length=32
    )
    
    # Tag metadata
    tag_type: str = Field(default="qr", max_length=20)  # qr, nfc, card
    physical_id: Optional[str] = Field(default=None, max_length=100)  # NFC UID, card serial
    
    # Status and lifecycle
    status: str = Field(default="active", max_length=20)  # active, revoked, suspended
    
    # QR/PDF generation
    qr_generated: bool = Field(default=False)
    qr_s3_key: Optional[str] = Field(default=None)
    pdf_generated: bool = Field(default=False) 
    pdf_s3_key: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    activated_at: Optional[datetime] = Field(default=None)
    revoked_at: Optional[datetime] = Field(default=None)
    
    # Usage tracking
    scan_count: int = Field(default=0)
    last_scanned_at: Optional[datetime] = Field(default=None)