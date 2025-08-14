import { describe, it, expect } from 'vitest';
import { searchTerms, COMMON_CONDITIONS, COMMON_ALLERGIES, COMMON_MEDICATIONS } from './seed-terms';

describe('seed-terms', () => {
  describe('searchTerms', () => {
    it('returns empty array for short queries', () => {
      expect(searchTerms('a', 'condition')).toEqual([]);
      expect(searchTerms('', 'condition')).toEqual([]);
    });

    it('finds conditions by partial match', () => {
      const results = searchTerms('asth', 'condition');
      expect(results).toHaveLength(1);
      expect(results[0].name_en).toBe('Asthma');
      expect(results[0].slug).toBe('asthma');
    });

    it('finds allergies by partial match', () => {
      const results = searchTerms('pean', 'allergy');
      expect(results).toHaveLength(1);
      expect(results[0].name_en).toBe('Peanuts');
    });

    it('finds medications by partial match', () => {
      const results = searchTerms('metf', 'medication');
      expect(results).toHaveLength(1);
      expect(results[0].name_en).toBe('Metformin');
    });

    it('is case insensitive', () => {
      const results = searchTerms('ASTH', 'condition');
      expect(results).toHaveLength(1);
      expect(results[0].name_en).toBe('Asthma');
    });

    it('limits results to 10 items', () => {
      const results = searchTerms('a', 'allergy');
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('finds multiple matches', () => {
      const results = searchTerms('blood', 'condition');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name_en.includes('blood'))).toBe(true);
    });
  });

  describe('seed data integrity', () => {
    it('has valid condition data', () => {
      expect(COMMON_CONDITIONS.length).toBeGreaterThan(20);
      COMMON_CONDITIONS.forEach(condition => {
        expect(condition.name_en).toBeTruthy();
        expect(condition.slug).toBeTruthy();
        expect(condition.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('has valid allergy data', () => {
      expect(COMMON_ALLERGIES.length).toBeGreaterThan(20);
      COMMON_ALLERGIES.forEach(allergy => {
        expect(allergy.name_en).toBeTruthy();
        expect(allergy.slug).toBeTruthy();
        expect(allergy.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('has valid medication data', () => {
      expect(COMMON_MEDICATIONS.length).toBeGreaterThan(20);
      COMMON_MEDICATIONS.forEach(medication => {
        expect(medication.name_en).toBeTruthy();
        expect(medication.slug).toBeTruthy();
        expect(medication.slug).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it('has unique slugs within each category', () => {
      const conditionSlugs = COMMON_CONDITIONS.map(c => c.slug);
      const allergySlugs = COMMON_ALLERGIES.map(a => a.slug);
      const medicationSlugs = COMMON_MEDICATIONS.map(m => m.slug);

      expect(new Set(conditionSlugs).size).toBe(conditionSlugs.length);
      expect(new Set(allergySlugs).size).toBe(allergySlugs.length);
      expect(new Set(medicationSlugs).size).toBe(medicationSlugs.length);
    });
  });
});