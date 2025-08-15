#!/usr/bin/env python3
"""
Seed or repair the demo emergency profile for Vital Tags.
Idempotent and self-healing — ensures demo is always complete.
"""

from datetime import datetime, date
from sqlmodel import Session, select
from app.db import engine
from app.models.user import User
from app.models.profile import Profile
from app.models.medical import Condition, Allergy, Medication, EmergencyContact
from app.models.tag import Tag
from app.security import get_password_hash


def seed_demo():
    now = datetime.utcnow()
    with Session(engine) as session:
        # 1. User
        email = "demo@vitaltags.com"
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash("demo123"),
                is_active=True,
                email_verified=True,
                gdpr_consent_at=now,
                created_at=now,
                updated_at=now,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"✅ Created demo user: {email}")
        else:
            print(f"ℹ️ Demo user exists: {email}")

        # 2. Profile
        profile = session.exec(select(Profile).where(Profile.user_id == user.id)).first()
        if not profile:
            profile = Profile(
                user_id=user.id,
                alias="Demo Profile",
                first_name="Jane",
                last_name="Doe",
                date_of_birth=date(1985, 3, 15),
                blood_type="A",
                rh_factor="+",
                weight_kg=65.5,
                height_cm=165,
                primary_language="en",
                privacy_emergency_contacts=False,
                privacy_medical_conditions=False,
                privacy_allergies=False,
                privacy_medications=False,
                created_at=now,
                updated_at=now,
            )
            session.add(profile)
            session.commit()
            session.refresh(profile)
            print("✅ Created demo profile")
        else:
            print("ℹ️ Demo profile exists")

        # 3. Tag
        short_id = "demo123"
        tag = session.exec(select(Tag).where(Tag.short_id == short_id)).first()
        if not tag:
            tag = Tag(
                profile_id=profile.id,
                short_id=short_id,
                tag_type="qr",
                status="active",
                privacy_level="public",
                scan_count=247,
                created_at=now,
                updated_at=now,
            )
            session.add(tag)
            session.commit()
            print(f"✅ Created demo tag: {short_id}")
        else:
            print(f"ℹ️ Demo tag exists: {short_id}")

        # 4. Conditions
        if not session.exec(select(Condition).where(Condition.profile_id == profile.id)).first():
            session.add_all([
                Condition(
                    profile_id=profile.id,
                    name="Type 1 Diabetes",
                    icd10_code="E10.9",
                    severity="moderate",
                    diagnosed_date=date(2010, 5, 20),
                    notes="Requires insulin management",
                    created_at=now,
                    updated_at=now,
                ),
                Condition(
                    profile_id=profile.id,
                    name="Asthma",
                    icd10_code="J45.9",
                    severity="mild",
                    diagnosed_date=date(2008, 8, 12),
                    notes="Exercise-induced",
                    created_at=now,
                    updated_at=now,
                )
            ])
            print("✅ Added demo conditions")

        # 5. Allergies
        if not session.exec(select(Allergy).where(Allergy.profile_id == profile.id)).first():
            session.add_all([
                Allergy(
                    profile_id=profile.id,
                    substance="Penicillin",
                    allergen_type="medication",
                    severity="severe",
                    reaction="Anaphylaxis",
                    notes="Carries EpiPen",
                    created_at=now,
                    updated_at=now,
                ),
                Allergy(
                    profile_id=profile.id,
                    substance="Shellfish",
                    allergen_type="food",
                    severity="moderate",
                    reaction="Hives, swelling",
                    notes="Avoids all seafood",
                    created_at=now,
                    updated_at=now,
                )
            ])
            print("✅ Added demo allergies")

        # 6. Medications
        if not session.exec(select(Medication).where(Medication.profile_id == profile.id)).first():
            session.add_all([
                Medication(
                    profile_id=profile.id,
                    name="Insulin (Humalog)",
                    dosage="10 units",
                    frequency="Before meals",
                    route="Subcutaneous injection",
                    status="active",
                    prescribed_date=date(2010, 5, 20),
                    notes="Fast-acting insulin",
                    created_at=now,
                    updated_at=now,
                ),
                Medication(
                    profile_id=profile.id,
                    name="Albuterol Inhaler",
                    dosage="90 mcg",
                    frequency="As needed",
                    route="Inhalation",
                    status="active",
                    prescribed_date=date(2008, 8, 12),
                    notes="For asthma symptoms",
                    created_at=now,
                    updated_at=now,
                )
            ])
            print("✅ Added demo medications")

        # 7. Emergency Contacts
        if not session.exec(select(EmergencyContact).where(EmergencyContact.profile_id == profile.id)).first():
            session.add_all([
                EmergencyContact(
                    profile_id=profile.id,
                    name="John Doe",
                    relationship="Spouse",
                    phone="+1-555-123-4567",
                    priority=1,
                    notes="Primary emergency contact",
                    created_at=now,
                    updated_at=now,
                ),
                EmergencyContact(
                    profile_id=profile.id,
                    name="Dr. Sarah Smith",
                    relationship="Primary Care Physician",
                    phone="+1-555-987-6543",
                    priority=2,
                    notes="Downtown Medical Center",
                    created_at=now,
                    updated_at=now,
                )
            ])
            print("✅ Added demo emergency contacts")

        session.commit()
        print("🎉 Demo seeding/repair complete")
        print("🔗 Access at: http://localhost:8080/e/demo123")


if __name__ == "__main__":
    seed_demo()