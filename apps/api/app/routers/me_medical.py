from typing import Annotated, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_
from pydantic import BaseModel, Field
from ..db import get_session
from ..deps import get_current_user_id
from ..models.profile import Profile
from ..models.medical import Condition, Allergy, Medication

router = APIRouter()


# Request/Response models
class ConditionCreate(BaseModel):
    code_system: Optional[str] = None
    code: Optional[str] = None
    display: str = Field(min_length=1, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe)$")
    is_public: bool = True


class ConditionUpdate(BaseModel):
    code_system: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = Field(None, min_length=1, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe)$")
    is_public: Optional[bool] = None


class ConditionResponse(BaseModel):
    id: int
    profile_id: int
    code_system: Optional[str]
    code: Optional[str]
    display: str
    notes: Optional[str]
    severity: Optional[str]
    is_public: bool
    coded: bool
    created_at: datetime
    updated_at: datetime


class AllergyCreate(BaseModel):
    substance_system: Optional[str] = None
    substance_code: Optional[str] = None
    display: str = Field(min_length=1, max_length=500)
    reaction: Optional[str] = Field(None, max_length=500)
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe|fatal)$")
    onset: Optional[str] = Field(None, pattern="^(immediate|delayed)$")
    is_public: bool = True


class AllergyUpdate(BaseModel):
    substance_system: Optional[str] = None
    substance_code: Optional[str] = None
    display: Optional[str] = Field(None, min_length=1, max_length=500)
    reaction: Optional[str] = Field(None, max_length=500)
    severity: Optional[str] = Field(None, pattern="^(mild|moderate|severe|fatal)$")
    onset: Optional[str] = Field(None, pattern="^(immediate|delayed)$")
    is_public: Optional[bool] = None


class AllergyResponse(BaseModel):
    id: int
    profile_id: int
    substance_system: Optional[str]
    substance_code: Optional[str]
    display: str
    reaction: Optional[str]
    severity: Optional[str]
    onset: Optional[str]
    is_public: bool
    coded: bool
    created_at: datetime
    updated_at: datetime


class MedicationCreate(BaseModel):
    drug_system: Optional[str] = None
    drug_code: Optional[str] = None
    display: str = Field(min_length=1, max_length=500)
    dose: Optional[str] = Field(None, max_length=100)
    route: Optional[str] = Field(None, max_length=50)
    frequency: Optional[str] = Field(None, max_length=100)
    status: str = Field("active", pattern="^(active|discontinued|paused)$")
    is_public: bool = True


class MedicationUpdate(BaseModel):
    drug_system: Optional[str] = None
    drug_code: Optional[str] = None
    display: Optional[str] = Field(None, min_length=1, max_length=500)
    dose: Optional[str] = Field(None, max_length=100)
    route: Optional[str] = Field(None, max_length=50)
    frequency: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, pattern="^(active|discontinued|paused)$")
    is_public: Optional[bool] = None


class MedicationResponse(BaseModel):
    id: int
    profile_id: int
    drug_system: Optional[str]
    drug_code: Optional[str]
    display: str
    dose: Optional[str]
    route: Optional[str]
    frequency: Optional[str]
    status: str
    is_public: bool
    coded: bool
    created_at: datetime
    updated_at: datetime


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


# CONDITIONS ENDPOINTS
@router.get("/conditions", response_model=List[ConditionResponse], summary="Get user conditions")
async def get_conditions(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)],
    include_private: bool = Query(True, description="Include private conditions")
):
    """Get all conditions for the authenticated user"""
    profile_id = await get_profile_id(user_id, session)
    
    query = select(Condition).where(Condition.profile_id == profile_id)
    if not include_private:
        query = query.where(Condition.is_public == True)
    
    conditions = session.exec(query.order_by(Condition.created_at.desc())).all()
    return conditions


@router.post("/conditions", response_model=ConditionResponse, summary="Create condition")
async def create_condition(
    condition_data: ConditionCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Create a new condition"""
    profile_id = await get_profile_id(user_id, session)
    
    condition = Condition(
        profile_id=profile_id,
        **condition_data.dict(),
        coded=bool(condition_data.code_system and condition_data.code)
    )
    
    session.add(condition)
    session.commit()
    session.refresh(condition)
    return condition


@router.put("/conditions/{condition_id}", response_model=ConditionResponse, summary="Update condition")
async def update_condition(
    condition_id: int,
    condition_update: ConditionUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update a condition"""
    profile_id = await get_profile_id(user_id, session)
    
    condition = session.exec(
        select(Condition).where(
            Condition.id == condition_id,
            Condition.profile_id == profile_id
        )
    ).first()
    
    if not condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Condition not found"
        )
    
    update_data = condition_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(condition, field, value)
    
    condition.coded = bool(condition.code_system and condition.code)
    condition.updated_at = datetime.utcnow()
    
    session.add(condition)
    session.commit()
    session.refresh(condition)
    return condition


@router.delete("/conditions/{condition_id}", summary="Delete condition")
async def delete_condition(
    condition_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Delete a condition"""
    profile_id = await get_profile_id(user_id, session)
    
    condition = session.exec(
        select(Condition).where(
            Condition.id == condition_id,
            Condition.profile_id == profile_id
        )
    ).first()
    
    if not condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Condition not found"
        )
    
    session.delete(condition)
    session.commit()
    return {"message": "Condition deleted"}


# ALLERGIES ENDPOINTS
@router.get("/allergies", response_model=List[AllergyResponse], summary="Get user allergies")
async def get_allergies(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)],
    include_private: bool = Query(True, description="Include private allergies")
):
    """Get all allergies for the authenticated user"""
    profile_id = await get_profile_id(user_id, session)
    
    query = select(Allergy).where(Allergy.profile_id == profile_id)
    if not include_private:
        query = query.where(Allergy.is_public == True)
    
    allergies = session.exec(query.order_by(Allergy.created_at.desc())).all()
    return allergies


@router.post("/allergies", response_model=AllergyResponse, summary="Create allergy")
async def create_allergy(
    allergy_data: AllergyCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Create a new allergy"""
    profile_id = await get_profile_id(user_id, session)
    
    allergy = Allergy(
        profile_id=profile_id,
        **allergy_data.dict(),
        coded=bool(allergy_data.substance_system and allergy_data.substance_code)
    )
    
    session.add(allergy)
    session.commit()
    session.refresh(allergy)
    return allergy


@router.put("/allergies/{allergy_id}", response_model=AllergyResponse, summary="Update allergy")
async def update_allergy(
    allergy_id: int,
    allergy_update: AllergyUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update an allergy"""
    profile_id = await get_profile_id(user_id, session)
    
    allergy = session.exec(
        select(Allergy).where(
            Allergy.id == allergy_id,
            Allergy.profile_id == profile_id
        )
    ).first()
    
    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )
    
    update_data = allergy_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(allergy, field, value)
    
    allergy.coded = bool(allergy.substance_system and allergy.substance_code)
    allergy.updated_at = datetime.utcnow()
    
    session.add(allergy)
    session.commit()
    session.refresh(allergy)
    return allergy


@router.delete("/allergies/{allergy_id}", summary="Delete allergy")
async def delete_allergy(
    allergy_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Delete an allergy"""
    profile_id = await get_profile_id(user_id, session)
    
    allergy = session.exec(
        select(Allergy).where(
            Allergy.id == allergy_id,
            Allergy.profile_id == profile_id
        )
    ).first()
    
    if not allergy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Allergy not found"
        )
    
    session.delete(allergy)
    session.commit()
    return {"message": "Allergy deleted"}


# MEDICATIONS ENDPOINTS
@router.get("/medications", response_model=List[MedicationResponse], summary="Get user medications")
async def get_medications(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)],
    include_private: bool = Query(True, description="Include private medications"),
    status_filter: Optional[str] = Query(None, pattern="^(active|discontinued|paused)$")
):
    """Get all medications for the authenticated user"""
    profile_id = await get_profile_id(user_id, session)
    
    query = select(Medication).where(Medication.profile_id == profile_id)
    if not include_private:
        query = query.where(Medication.is_public == True)
    if status_filter:
        query = query.where(Medication.status == status_filter)
    
    medications = session.exec(query.order_by(Medication.created_at.desc())).all()
    return medications


@router.post("/medications", response_model=MedicationResponse, summary="Create medication")
async def create_medication(
    medication_data: MedicationCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Create a new medication"""
    profile_id = await get_profile_id(user_id, session)
    
    medication = Medication(
        profile_id=profile_id,
        **medication_data.dict(),
        coded=bool(medication_data.drug_system and medication_data.drug_code)
    )
    
    session.add(medication)
    session.commit()
    session.refresh(medication)
    return medication


@router.put("/medications/{medication_id}", response_model=MedicationResponse, summary="Update medication")
async def update_medication(
    medication_id: int,
    medication_update: MedicationUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update a medication"""
    profile_id = await get_profile_id(user_id, session)
    
    medication = session.exec(
        select(Medication).where(
            Medication.id == medication_id,
            Medication.profile_id == profile_id
        )
    ).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    update_data = medication_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(medication, field, value)
    
    medication.coded = bool(medication.drug_system and medication.drug_code)
    medication.updated_at = datetime.utcnow()
    
    session.add(medication)
    session.commit()
    session.refresh(medication)
    return medication


@router.delete("/medications/{medication_id}", summary="Delete medication")
async def delete_medication(
    medication_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Delete a medication"""
    profile_id = await get_profile_id(user_id, session)
    
    medication = session.exec(
        select(Medication).where(
            Medication.id == medication_id,
            Medication.profile_id == profile_id
        )
    ).first()
    
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    session.delete(medication)
    session.commit()
    return {"message": "Medication deleted"}


# SUMMARY ENDPOINT
@router.get("/summary", summary="Get medical data summary")
async def get_medical_summary(
    user_id: Annotated[int, Depends(get_current_user_id)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get summary count of medical data"""
    profile_id = await get_profile_id(user_id, session)
    
    conditions_count = len(session.exec(
        select(Condition).where(Condition.profile_id == profile_id)
    ).all())
    
    allergies_count = len(session.exec(
        select(Allergy).where(Allergy.profile_id == profile_id)
    ).all())
    
    medications_count = len(session.exec(
        select(Medication).where(
            Medication.profile_id == profile_id,
            Medication.status == "active"
        )
    ).all())
    
    return {
        "conditions_count": conditions_count,
        "allergies_count": allergies_count,
        "active_medications_count": medications_count,
        "total_entries": conditions_count + allergies_count + medications_count
    }