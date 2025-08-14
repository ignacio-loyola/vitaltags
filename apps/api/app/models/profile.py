from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, JSON


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    # Basic Info
    alias: str = Field(max_length=100)
    yob: Optional[int] = Field(default=None, ge=1900, le=2024)
    
    # Blood Info
    blood_type: Optional[str] = Field(default=None, max_length=3)  # A, B, AB, O
    rh_factor: Optional[str] = Field(default=None, max_length=1)   # +, -
    donor_status: Optional[bool] = Field(default=None)
    
    # Languages (ISO 639-1 codes)
    primary_langs: List[str] = Field(default=[], sa_column=Column(JSON))
    
    # Emergency Contact
    ice_name: Optional[str] = Field(default=None, max_length=200)
    ice_phone: Optional[str] = Field(default=None, max_length=50)
    ice_relationship: Optional[str] = Field(default=None, max_length=100)
    
    # Privacy Settings
    public_alias: bool = Field(default=True)
    public_yob: bool = Field(default=True)
    public_blood: bool = Field(default=True)
    public_languages: bool = Field(default=True)
    public_ice: bool = Field(default=False)
    
    # Metadata
    last_updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)