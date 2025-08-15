from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from ..db import get_session
from ..services.terminology import TerminologyService

router = APIRouter()


class TerminologySearchResult(BaseModel):
    code_system: str
    code: str
    display: str
    display_en: str
    coded: bool


class TerminologySearchResponse(BaseModel):
    query: str
    results: List[TerminologySearchResult]
    total_count: int
    systems_searched: List[str]


@router.get("/terminology/search", response_model=TerminologySearchResponse, summary="Search medical terminology")
async def search_terminology(
    q: str = Query(..., description="Search query", min_length=2),
    systems: Optional[List[str]] = Query(None, description="Code systems to search (ICD-10, ATC, INN)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results to return"),
    lang: str = Query("en", description="Language for localized display names", pattern="^[a-z]{2}$"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """
    Search medical terminology codes and descriptions.
    
    This endpoint searches across ICD-10, ATC, and INN code systems for:
    - Exact code matches
    - Display name matches (English and localized)
    - Partial text matches
    
    Results are ranked by relevance and limited to the specified count.
    """
    # Validate systems parameter
    valid_systems = {'ICD-10', 'ATC', 'INN'}
    if systems:
        invalid_systems = set(systems) - valid_systems
        if invalid_systems:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid code systems: {invalid_systems}. Valid systems: {valid_systems}"
            )
    
    with TerminologyService() as service:
        results = service.search_terms(
            query=q,
            code_systems=systems,
            limit=limit,
            lang=lang
        )
        
        # Convert to response format
        search_results = [
            TerminologySearchResult(**result) for result in results
        ]
        
        return TerminologySearchResponse(
            query=q,
            results=search_results,
            total_count=len(search_results),
            systems_searched=systems or ['ICD-10', 'ATC', 'INN']
        )


@router.get("/terminology/systems", summary="Get available code systems")
async def get_terminology_systems():
    """Get list of available medical terminology code systems"""
    return {
        "systems": [
            {
                "code": "ICD-10",
                "name": "International Classification of Diseases, 10th Revision",
                "description": "WHO classification for diseases and health conditions",
                "use_case": "Medical conditions, diagnoses"
            },
            {
                "code": "ATC", 
                "name": "Anatomical Therapeutic Chemical Classification",
                "description": "WHO classification for pharmaceutical substances",
                "use_case": "Medications, drugs"
            },
            {
                "code": "INN",
                "name": "International Nonproprietary Names",
                "description": "WHO names for pharmaceutical substances",
                "use_case": "Drug substances, allergens"
            }
        ]
    }


@router.get("/terminology/{system}/{code}", response_model=TerminologySearchResult, summary="Get specific term")
async def get_terminology_term(
    system: str,
    code: str,
    lang: str = Query("en", description="Language for localized display", pattern="^[a-z]{2}$"),
    session: Annotated[Session, Depends(get_session)] = None,
):
    """Get a specific medical terminology term by system and code"""
    valid_systems = {'ICD-10', 'ATC', 'INN'}
    if system not in valid_systems:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid code system: {system}. Valid systems: {valid_systems}"
        )
    
    with TerminologyService() as service:
        result = service.get_term(system, code, lang)
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Term not found: {system}:{code}"
            )
        
        return TerminologySearchResult(**result)


@router.get("/terminology/stats", summary="Get terminology statistics")
async def get_terminology_stats(session: Annotated[Session, Depends(get_session)] = None):
    """Get statistics about the terminology database"""
    with TerminologyService() as service:
        stats = service.get_stats()
        return {
            "terminology_stats": stats,
            "last_updated": "2024-08-14T00:00:00Z",  # Would be dynamic in real implementation
            "data_sources": {
                "ICD-10": "WHO International Classification of Diseases",
                "ATC": "WHO Collaborating Centre for Drug Statistics Methodology", 
                "INN": "WHO International Nonproprietary Names"
            }
        }


@router.post("/terminology/validate", summary="Validate medical codes")
async def validate_terminology_codes(
    codes: List[dict],
    session: Annotated[Session, Depends(get_session)] = None,
):
    """
    Validate a list of medical codes.
    
    Request body should contain a list of objects with:
    - system: Code system (ICD-10, ATC, INN)  
    - code: The code to validate
    
    Returns validation results for each code.
    """
    results = []
    
    with TerminologyService() as service:
        for item in codes:
            system = item.get('system')
            code = item.get('code')
            
            if not system or not code:
                results.append({
                    'system': system,
                    'code': code,
                    'valid': False,
                    'error': 'Missing system or code'
                })
                continue
            
            term = service.get_term(system, code)
            results.append({
                'system': system,
                'code': code,
                'valid': term is not None,
                'display': term['display'] if term else None,
                'error': None if term else f'Code not found in {system}'
            })
    
    return {'validation_results': results}


# Suggestions for common medical conditions (for autocomplete)
COMMON_CONDITIONS = [
    "Diabetes", "Hypertension", "Asthma", "COPD", "Heart disease",
    "Arthritis", "Depression", "Anxiety", "Migraine", "Epilepsy"
]

COMMON_ALLERGIES = [
    "Penicillin", "Peanuts", "Shellfish", "Latex", "Dust mites",
    "Pollen", "Iodine", "Eggs", "Milk", "Soy", "NSAIDs"
]

COMMON_MEDICATIONS = [
    "Aspirin", "Metformin", "Lisinopril", "Metoprolol", "Simvastatin",
    "Omeprazole", "Levothyroxine", "Albuterol", "Insulin", "Warfarin"
]


@router.get("/terminology/suggestions/{category}", summary="Get common term suggestions")
async def get_terminology_suggestions(
    category: str,
    lang: str = Query("en", description="Language for suggestions", pattern="^[a-z]{2}$"),
):
    """
    Get common terminology suggestions for autocomplete.
    
    Categories:
    - conditions: Common medical conditions
    - allergies: Common allergens 
    - medications: Common medications
    """
    suggestions_map = {
        'conditions': COMMON_CONDITIONS,
        'allergies': COMMON_ALLERGIES,
        'medications': COMMON_MEDICATIONS,
    }
    
    if category not in suggestions_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Valid categories: {list(suggestions_map.keys())}"
        )
    
    suggestions = suggestions_map[category]
    
    # In a real implementation, you'd localize these suggestions
    # For now, just return English terms
    return {
        'category': category,
        'language': lang,
        'suggestions': [
            {'display': term, 'coded': False} for term in suggestions
        ]
    }