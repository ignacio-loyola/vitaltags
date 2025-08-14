from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON


class TerminologyTerm(SQLModel, table=True):
    __tablename__ = "terminology_terms"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Coding system identification
    code_system: str = Field(index=True, max_length=50)  # ICD-10, ATC, INN, SNOMED, etc.
    code: str = Field(index=True, max_length=50)
    
    # Default English display
    display_en: str = Field(max_length=500)
    
    # Localized displays {"es": "...", "fr": "...", etc.}
    displays: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Additional metadata
    description: Optional[str] = Field(default=None, max_length=1000)
    parent_code: Optional[str] = Field(default=None, max_length=50, index=True)
    is_active: bool = Field(default=True)
    
    # Search optimization
    search_terms: Optional[str] = Field(default=None)  # Concatenated terms for FTS


class TerminologyMap(SQLModel, table=True):
    __tablename__ = "terminology_mappings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Source system
    from_system: str = Field(index=True, max_length=50)
    from_code: str = Field(index=True, max_length=50)
    
    # Target system  
    to_system: str = Field(index=True, max_length=50)
    to_code: str = Field(index=True, max_length=50)
    
    # Mapping metadata
    equivalence: str = Field(default="equivalent", max_length=20)  # equivalent, wider, narrower, inexact
    mapping_source: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)