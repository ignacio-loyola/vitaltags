'use client';

import { useState } from 'react';
import { AutocompleteInput } from './AutocompleteInput';
import type { SeedTerm } from '../data/seed-terms';

export function AutocompleteDemo() {
  const [conditionValue, setConditionValue] = useState('');
  const [allergyValue, setAllergyValue] = useState('');
  const [medicationValue, setMedicationValue] = useState('');
  const [selectedItems, setSelectedItems] = useState<{
    conditions: SeedTerm[];
    allergies: SeedTerm[];
    medications: SeedTerm[];
  }>({
    conditions: [],
    allergies: [],
    medications: []
  });

  const handleConditionSelect = (term: SeedTerm) => {
    if (!selectedItems.conditions.find(c => c.slug === term.slug)) {
      setSelectedItems(prev => ({
        ...prev,
        conditions: [...prev.conditions, term]
      }));
    }
    setConditionValue('');
  };

  const handleAllergySelect = (term: SeedTerm) => {
    if (!selectedItems.allergies.find(a => a.slug === term.slug)) {
      setSelectedItems(prev => ({
        ...prev,
        allergies: [...prev.allergies, term]
      }));
    }
    setAllergyValue('');
  };

  const handleMedicationSelect = (term: SeedTerm) => {
    if (!selectedItems.medications.find(m => m.slug === term.slug)) {
      setSelectedItems(prev => ({
        ...prev,
        medications: [...prev.medications, term]
      }));
    }
    setMedicationValue('');
  };

  const removeItem = (category: 'conditions' | 'allergies' | 'medications', slug: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.slug !== slug)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Autocomplete Demo</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="condition-input" className="block text-sm font-medium mb-2">
            Medical Conditions
          </label>
          <AutocompleteInput
            id="condition-input"
            category="condition"
            value={conditionValue}
            onChange={setConditionValue}
            onSelect={handleConditionSelect}
            placeholder="Type to search conditions (e.g., 'asth' for Asthma)"
            aria-label="Search medical conditions"
          />
          {selectedItems.conditions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedItems.conditions.map(condition => (
                <span
                  key={condition.slug}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {condition.name_en}
                  <button
                    onClick={() => removeItem('conditions', condition.slug)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${condition.name_en}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="allergy-input" className="block text-sm font-medium mb-2">
            Allergies
          </label>
          <AutocompleteInput
            id="allergy-input"
            category="allergy"
            value={allergyValue}
            onChange={setAllergyValue}
            onSelect={handleAllergySelect}
            placeholder="Type to search allergies (e.g., 'pean' for Peanuts)"
            aria-label="Search allergies"
          />
          {selectedItems.allergies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedItems.allergies.map(allergy => (
                <span
                  key={allergy.slug}
                  className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                >
                  {allergy.name_en}
                  <button
                    onClick={() => removeItem('allergies', allergy.slug)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    aria-label={`Remove ${allergy.name_en}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="medication-input" className="block text-sm font-medium mb-2">
            Medications
          </label>
          <AutocompleteInput
            id="medication-input"
            category="medication"
            value={medicationValue}
            onChange={setMedicationValue}
            onSelect={handleMedicationSelect}
            placeholder="Type to search medications (e.g., 'metf' for Metformin)"
            aria-label="Search medications"
          />
          {selectedItems.medications.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedItems.medications.map(medication => (
                <span
                  key={medication.slug}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {medication.name_en}
                  <button
                    onClick={() => removeItem('medications', medication.slug)}
                    className="ml-2 text-green-600 hover:text-green-800"
                    aria-label={`Remove ${medication.name_en}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Test Instructions:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Type "asth" in conditions to see "Asthma"</li>
          <li>• Type "pean" in allergies to see "Peanuts"</li>
          <li>• Type "metf" in medications to see "Metformin"</li>
          <li>• Use arrow keys to navigate suggestions</li>
          <li>• Press Enter to select or click on suggestions</li>
          <li>• Free-text input works when no suggestions match</li>
        </ul>
      </div>
    </div>
  );
}