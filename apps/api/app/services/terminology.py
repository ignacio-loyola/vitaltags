#!/usr/bin/env python3
"""
Medical terminology service for seeding and searching medical codes.

This service handles:
- ICD-10 (International Classification of Diseases)
- ATC (Anatomical Therapeutic Chemical Classification)
- INN (International Nonproprietary Names)
- UNII (Unique Ingredient Identifier)

Data sources:
- ICD-10: WHO ICD-10 classification
- ATC: WHO Collaborating Centre for Drug Statistics Methodology
- INN: WHO International Nonproprietary Names
- UNII: FDA Global Substance Registration System
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from ..db import engine
from ..models.terminology import TerminologyTerm

logger = logging.getLogger(__name__)

# Sample ICD-10 codes for common emergency conditions
ICD10_SAMPLE_DATA = [
    # Cardiovascular
    {"code": "I21.9", "display_en": "Acute myocardial infarction, unspecified", "displays": {"es": "Infarto agudo de miocardio, no especificado"}},
    {"code": "I46.9", "display_en": "Cardiac arrest, unspecified", "displays": {"es": "Paro cardíaco, no especificado"}},
    {"code": "I20.9", "display_en": "Angina pectoris, unspecified", "displays": {"es": "Angina de pecho, no especificada"}},
    {"code": "I48.91", "display_en": "Unspecified atrial fibrillation", "displays": {"es": "Fibrilación auricular no especificada"}},
    
    # Respiratory
    {"code": "J44.1", "display_en": "Chronic obstructive pulmonary disease with acute exacerbation", "displays": {"es": "Enfermedad pulmonar obstructiva crónica con exacerbación aguda"}},
    {"code": "J45.9", "display_en": "Asthma, unspecified", "displays": {"es": "Asma, no especificado"}},
    {"code": "J18.9", "display_en": "Pneumonia, unspecified organism", "displays": {"es": "Neumonía, organismo no especificado"}},
    
    # Neurological
    {"code": "G93.1", "display_en": "Anoxic brain damage, not elsewhere classified", "displays": {"es": "Daño cerebral anóxico, no clasificado en otra parte"}},
    {"code": "G40.9", "display_en": "Epilepsy, unspecified", "displays": {"es": "Epilepsia, no especificada"}},
    {"code": "I63.9", "display_en": "Cerebral infarction, unspecified", "displays": {"es": "Infarto cerebral, no especificado"}},
    
    # Endocrine
    {"code": "E10.9", "display_en": "Type 1 diabetes mellitus without complications", "displays": {"es": "Diabetes mellitus tipo 1 sin complicaciones"}},
    {"code": "E11.9", "display_en": "Type 2 diabetes mellitus without complications", "displays": {"es": "Diabetes mellitus tipo 2 sin complicaciones"}},
    {"code": "E16.2", "display_en": "Hypoglycemia, unspecified", "displays": {"es": "Hipoglucemia, no especificada"}},
    
    # Allergic reactions
    {"code": "T78.2", "display_en": "Anaphylactic shock, unspecified", "displays": {"es": "Shock anafiláctico, no especificado"}},
    {"code": "T78.40", "display_en": "Allergy, unspecified", "displays": {"es": "Alergia, no especificada"}},
    {"code": "L20.9", "display_en": "Atopic dermatitis, unspecified", "displays": {"es": "Dermatitis atópica, no especificada"}},
    
    # Mental health (common emergency conditions)
    {"code": "F32.9", "display_en": "Major depressive disorder, single episode, unspecified", "displays": {"es": "Trastorno depresivo mayor, episodio único, no especificado"}},
    {"code": "F41.9", "display_en": "Anxiety disorder, unspecified", "displays": {"es": "Trastorno de ansiedad, no especificado"}},
    {"code": "F43.10", "display_en": "Post-traumatic stress disorder, unspecified", "displays": {"es": "Trastorno de estrés postraumático, no especificado"}},
]

# Sample ATC codes for common medications
ATC_SAMPLE_DATA = [
    # Cardiovascular
    {"code": "C07AB02", "display_en": "Metoprolol", "displays": {"es": "Metoprolol"}},
    {"code": "C09AA02", "display_en": "Enalapril", "displays": {"es": "Enalapril"}},
    {"code": "C10AA01", "display_en": "Simvastatin", "displays": {"es": "Simvastatina"}},
    {"code": "B01AC06", "display_en": "Acetylsalicylic acid", "displays": {"es": "Ácido acetilsalicílico"}},
    
    # Respiratory
    {"code": "R03AC02", "display_en": "Salbutamol", "displays": {"es": "Salbutamol"}},
    {"code": "R03BA02", "display_en": "Budesonide", "displays": {"es": "Budesonida"}},
    {"code": "R06AE07", "display_en": "Cetirizine", "displays": {"es": "Cetirizina"}},
    
    # Nervous system
    {"code": "N02BA01", "display_en": "Acetylsalicylic acid", "displays": {"es": "Ácido acetilsalicílico"}},
    {"code": "N02BE01", "display_en": "Paracetamol", "displays": {"es": "Paracetamol"}},
    {"code": "N03AX09", "display_en": "Lamotrigine", "displays": {"es": "Lamotrigina"}},
    {"code": "N05BA04", "display_en": "Oxazepam", "displays": {"es": "Oxazepam"}},
    
    # Endocrine
    {"code": "A10AB01", "display_en": "Insulin (human)", "displays": {"es": "Insulina (humana)"}},
    {"code": "A10BA02", "display_en": "Metformin", "displays": {"es": "Metformina"}},
    {"code": "H03AA01", "display_en": "Levothyroxine sodium", "displays": {"es": "Levotiroxina sódica"}},
    
    # Antibiotics (common emergency medications)
    {"code": "J01CA04", "display_en": "Amoxicillin", "displays": {"es": "Amoxicilina"}},
    {"code": "J01MA02", "display_en": "Ciprofloxacin", "displays": {"es": "Ciprofloxacino"}},
    {"code": "J01AA02", "display_en": "Doxycycline", "displays": {"es": "Doxiciclina"}},
]

# Sample INN (International Nonproprietary Names) for substances
INN_SAMPLE_DATA = [
    # Common allergens and substances
    {"code": "INN-001", "display_en": "Penicillin", "displays": {"es": "Penicilina"}},
    {"code": "INN-002", "display_en": "Peanut", "displays": {"es": "Cacahuete"}},
    {"code": "INN-003", "display_en": "Shellfish", "displays": {"es": "Mariscos"}},
    {"code": "INN-004", "display_en": "Latex", "displays": {"es": "Látex"}},
    {"code": "INN-005", "display_en": "Dust mite", "displays": {"es": "Ácaro del polvo"}},
    {"code": "INN-006", "display_en": "Pollen", "displays": {"es": "Polen"}},
    {"code": "INN-007", "display_en": "Iodine", "displays": {"es": "Yodo"}},
    {"code": "INN-008", "display_en": "Morphine", "displays": {"es": "Morfina"}},
    {"code": "INN-009", "display_en": "Codeine", "displays": {"es": "Codeína"}},
    {"code": "INN-010", "display_en": "Lidocaine", "displays": {"es": "Lidocaína"}},
    {"code": "INN-011", "display_en": "Egg", "displays": {"es": "Huevo"}},
    {"code": "INN-012", "display_en": "Milk", "displays": {"es": "Leche"}},
    {"code": "INN-013", "display_en": "Soy", "displays": {"es": "Soja"}},
    {"code": "INN-014", "display_en": "Wheat", "displays": {"es": "Trigo"}},
    {"code": "INN-015", "display_en": "Tree nuts", "displays": {"es": "Frutos secos"}},
    {"code": "INN-016", "display_en": "Fish", "displays": {"es": "Pescado"}},
    {"code": "INN-017", "display_en": "Sulfonamides", "displays": {"es": "Sulfonamidas"}},
    {"code": "INN-018", "display_en": "NSAIDs", "displays": {"es": "AINE"}},
    {"code": "INN-019", "display_en": "Contrast media", "displays": {"es": "Medios de contraste"}},
    {"code": "INN-020", "display_en": "Bee venom", "displays": {"es": "Veneno de abeja"}},
]


class TerminologyService:
    """Service for managing medical terminology data"""
    
    def __init__(self):
        self.session = Session(engine)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.session.close()
    
    def seed_terminology(self, force: bool = False) -> Dict[str, int]:
        """
        Seed the database with sample medical terminology data
        
        Args:
            force: If True, delete existing data and reseed
            
        Returns:
            Dictionary with counts of seeded terms by system
        """
        logger.info("Starting terminology seeding...")
        
        if force:
            logger.info("Force flag set, clearing existing terminology data...")
            self.session.query(TerminologyTerm).delete()
            self.session.commit()
        
        counts = {}
        
        # Seed ICD-10 codes
        counts['ICD-10'] = self._seed_system('ICD-10', ICD10_SAMPLE_DATA)
        
        # Seed ATC codes
        counts['ATC'] = self._seed_system('ATC', ATC_SAMPLE_DATA)
        
        # Seed INN codes
        counts['INN'] = self._seed_system('INN', INN_SAMPLE_DATA)
        
        self.session.commit()
        
        total_count = sum(counts.values())
        logger.info(f"Seeding completed. Total terms seeded: {total_count}")
        logger.info(f"Breakdown: {counts}")
        
        return counts
    
    def _seed_system(self, code_system: str, data: List[Dict[str, Any]]) -> int:
        """Seed terminology for a specific code system"""
        count = 0
        
        for item in data:
            # Check if term already exists
            existing = self.session.exec(
                select(TerminologyTerm).where(
                    TerminologyTerm.code_system == code_system,
                    TerminologyTerm.code == item['code']
                )
            ).first()
            
            if existing:
                logger.debug(f"Term {code_system}:{item['code']} already exists, skipping...")
                continue
            
            # Create search terms for full-text search
            search_terms = [
                item['display_en'].lower(),
                item['code'].lower()
            ]
            
            if item.get('displays'):
                search_terms.extend([
                    display.lower() 
                    for display in item['displays'].values()
                ])
            
            term = TerminologyTerm(
                code_system=code_system,
                code=item['code'],
                display_en=item['display_en'],
                displays=item.get('displays'),
                search_terms=' '.join(search_terms),
                is_active=True
            )
            
            self.session.add(term)
            count += 1
            
            logger.debug(f"Added {code_system} term: {item['code']} - {item['display_en']}")
        
        return count
    
    def search_terms(
        self, 
        query: str, 
        code_systems: Optional[List[str]] = None,
        limit: int = 20,
        lang: str = 'en'
    ) -> List[Dict[str, Any]]:
        """
        Search terminology terms
        
        Args:
            query: Search query string
            code_systems: Filter by specific code systems (ICD-10, ATC, INN)
            limit: Maximum number of results to return
            lang: Language for localized display names
            
        Returns:
            List of matching terms
        """
        query_lower = query.lower()
        
        # Build query
        stmt = select(TerminologyTerm).where(TerminologyTerm.is_active == True)
        
        if code_systems:
            stmt = stmt.where(TerminologyTerm.code_system.in_(code_systems))
        
        # Search in code, display_en, and search_terms
        search_condition = (
            TerminologyTerm.code.ilike(f'%{query_lower}%') |
            TerminologyTerm.display_en.ilike(f'%{query_lower}%') |
            TerminologyTerm.search_terms.ilike(f'%{query_lower}%')
        )
        
        stmt = stmt.where(search_condition).limit(limit)
        
        results = self.session.exec(stmt).all()
        
        # Format results
        formatted_results = []
        for term in results:
            # Get localized display name
            display = term.display_en
            if lang != 'en' and term.displays and lang in term.displays:
                display = term.displays[lang]
            
            formatted_results.append({
                'code_system': term.code_system,
                'code': term.code,
                'display': display,
                'display_en': term.display_en,
                'coded': True,
            })
        
        return formatted_results
    
    def get_term(self, code_system: str, code: str, lang: str = 'en') -> Optional[Dict[str, Any]]:
        """Get a specific terminology term"""
        term = self.session.exec(
            select(TerminologyTerm).where(
                TerminologyTerm.code_system == code_system,
                TerminologyTerm.code == code,
                TerminologyTerm.is_active == True
            )
        ).first()
        
        if not term:
            return None
        
        # Get localized display name
        display = term.display_en
        if lang != 'en' and term.displays and lang in term.displays:
            display = term.displays[lang]
        
        return {
            'code_system': term.code_system,
            'code': term.code,
            'display': display,
            'display_en': term.display_en,
            'coded': True,
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get terminology database statistics"""
        total_terms = len(self.session.exec(select(TerminologyTerm)).all())
        
        # Count by system
        system_counts = {}
        for system in ['ICD-10', 'ATC', 'INN']:
            count = len(self.session.exec(
                select(TerminologyTerm).where(TerminologyTerm.code_system == system)
            ).all())
            system_counts[system] = count
        
        return {
            'total_terms': total_terms,
            'by_system': system_counts,
            'active_terms': len(self.session.exec(
                select(TerminologyTerm).where(TerminologyTerm.is_active == True)
            ).all()),
        }


def main():
    """CLI entry point for terminology management"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Medical terminology management')
    parser.add_argument('--seed', action='store_true', help='Seed terminology database')
    parser.add_argument('--force', action='store_true', help='Force reseed (delete existing data)')
    parser.add_argument('--stats', action='store_true', help='Show terminology statistics')
    parser.add_argument('--search', type=str, help='Search terminology terms')
    parser.add_argument('--system', type=str, choices=['ICD-10', 'ATC', 'INN'], help='Filter by code system')
    
    args = parser.parse_args()
    
    with TerminologyService() as service:
        if args.seed:
            counts = service.seed_terminology(force=args.force)
            print(f"Terminology seeding completed: {counts}")
        
        elif args.stats:
            stats = service.get_stats()
            print(f"Terminology Statistics:")
            print(f"  Total terms: {stats['total_terms']}")
            print(f"  Active terms: {stats['active_terms']}")
            print(f"  By system:")
            for system, count in stats['by_system'].items():
                print(f"    {system}: {count}")
        
        elif args.search:
            systems = [args.system] if args.system else None
            results = service.search_terms(args.search, code_systems=systems)
            print(f"Search results for '{args.search}':")
            for result in results:
                print(f"  {result['code_system']}:{result['code']} - {result['display']}")
        
        else:
            parser.print_help()


if __name__ == '__main__':
    main()