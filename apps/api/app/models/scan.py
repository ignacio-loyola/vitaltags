from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
import hashlib


def hash_user_agent(user_agent: str) -> str:
    """Hash user agent for privacy while maintaining analytics capability"""
    return hashlib.sha256(user_agent.encode()).hexdigest()[:16]


class ScanLog(SQLModel, table=True):
    __tablename__ = "scan_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)
    
    # Timestamp
    ts: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Anonymized location data (country level only for privacy)
    country: Optional[str] = Field(default=None, max_length=2)  # ISO 3166-1 alpha-2
    
    # Anonymized user agent (hashed for privacy)
    user_agent_hash: Optional[str] = Field(default=None, max_length=32)
    
    # Request metadata (anonymized)
    referer_domain: Optional[str] = Field(default=None, max_length=100)  # Just domain, not full URL
    
    # Scan context
    scan_method: str = Field(default="web", max_length=20)  # web, app, api
    
    # Rate limiting helper
    ip_hash: Optional[str] = Field(default=None, max_length=32, index=True)  # Hashed IP for rate limiting