from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Condition(SQLModel, table=True):
    __tablename__ = "conditions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id", index=True)
    
    # Medical coding
    code_system: Optional[str] = Field(default=None, max_length=50)  # ICD-10, SNOMED, etc.
    code: Optional[str] = Field(default=None, max_length=50)
    display: str = Field(max_length=500)  # Human-readable description
    
    # Additional info
    notes: Optional[str] = Field(default=None, max_length=1000)
    severity: Optional[str] = Field(default=None, max_length=20)  # mild, moderate, severe
    
    # Privacy and coding status
    is_public: bool = Field(default=True)
    coded: bool = Field(default=False)  # True if has valid code_system + code
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Allergy(SQLModel, table=True):
    __tablename__ = "allergies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id", index=True)
    
    # Substance coding
    substance_system: Optional[str] = Field(default=None, max_length=50)
    substance_code: Optional[str] = Field(default=None, max_length=50)
    display: str = Field(max_length=500)
    
    # Reaction details
    reaction: Optional[str] = Field(default=None, max_length=500)
    severity: Optional[str] = Field(default=None, max_length=20)  # mild, moderate, severe, fatal
    onset: Optional[str] = Field(default=None, max_length=20)  # immediate, delayed
    
    # Privacy and coding
    is_public: bool = Field(default=True)
    coded: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Medication(SQLModel, table=True):
    __tablename__ = "medications"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="profiles.id", index=True)
    
    # Drug coding
    drug_system: Optional[str] = Field(default=None, max_length=50)  # ATC, INN, RxNorm, etc.
    drug_code: Optional[str] = Field(default=None, max_length=50)
    display: str = Field(max_length=500)
    
    # Dosage information
    dose: Optional[str] = Field(default=None, max_length=100)  # "5mg", "1 tablet"
    route: Optional[str] = Field(default=None, max_length=50)   # oral, IV, topical, etc.
    frequency: Optional[str] = Field(default=None, max_length=100)  # "twice daily", "as needed"
    
    # Status
    status: str = Field(default="active", max_length=20)  # active, discontinued, paused
    
    # Privacy and coding
    is_public: bool = Field(default=True)
    coded: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)