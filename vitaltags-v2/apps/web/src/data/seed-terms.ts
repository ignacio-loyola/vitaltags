export const COMMON_CONDITIONS = [
  { name_en: "Asthma", slug: "asthma" },
  { name_en: "Type 2 diabetes", slug: "type-2-diabetes" },
  { name_en: "Hypertension", slug: "hypertension" },
  { name_en: "High blood pressure", slug: "high-blood-pressure" },
  { name_en: "Heart disease", slug: "heart-disease" },
  { name_en: "Arthritis", slug: "arthritis" },
  { name_en: "Depression", slug: "depression" },
  { name_en: "Anxiety", slug: "anxiety" },
  { name_en: "Migraine", slug: "migraine" },
  { name_en: "Back pain", slug: "back-pain" },
  { name_en: "Kidney disease", slug: "kidney-disease" },
  { name_en: "Liver disease", slug: "liver-disease" },
  { name_en: "Thyroid disorder", slug: "thyroid-disorder" },
  { name_en: "High cholesterol", slug: "high-cholesterol" },
  { name_en: "Sleep apnea", slug: "sleep-apnea" },
  { name_en: "Chronic fatigue", slug: "chronic-fatigue" },
  { name_en: "Fibromyalgia", slug: "fibromyalgia" },
  { name_en: "Epilepsy", slug: "epilepsy" },
  { name_en: "Cancer", slug: "cancer" },
  { name_en: "Stroke", slug: "stroke" },
  { name_en: "Osteoporosis", slug: "osteoporosis" },
  { name_en: "COPD", slug: "copd" },
  { name_en: "Pneumonia", slug: "pneumonia" },
  { name_en: "Bronchitis", slug: "bronchitis" },
  { name_en: "Anemia", slug: "anemia" }
];

export const COMMON_ALLERGIES = [
  { name_en: "Penicillin", slug: "penicillin" },
  { name_en: "Peanuts", slug: "peanuts" },
  { name_en: "Tree nuts", slug: "tree-nuts" },
  { name_en: "Shellfish", slug: "shellfish" },
  { name_en: "Fish", slug: "fish" },
  { name_en: "Eggs", slug: "eggs" },
  { name_en: "Milk", slug: "milk" },
  { name_en: "Wheat", slug: "wheat" },
  { name_en: "Soy", slug: "soy" },
  { name_en: "Sesame", slug: "sesame" },
  { name_en: "Latex", slug: "latex" },
  { name_en: "Bee stings", slug: "bee-stings" },
  { name_en: "Wasp stings", slug: "wasp-stings" },
  { name_en: "Dust mites", slug: "dust-mites" },
  { name_en: "Pollen", slug: "pollen" },
  { name_en: "Cat dander", slug: "cat-dander" },
  { name_en: "Dog dander", slug: "dog-dander" },
  { name_en: "Mold", slug: "mold" },
  { name_en: "Aspirin", slug: "aspirin" },
  { name_en: "Ibuprofen", slug: "ibuprofen" },
  { name_en: "Sulfa drugs", slug: "sulfa-drugs" },
  { name_en: "Codeine", slug: "codeine" },
  { name_en: "Morphine", slug: "morphine" },
  { name_en: "Contrast dye", slug: "contrast-dye" },
  { name_en: "Nickel", slug: "nickel" }
];

export const COMMON_MEDICATIONS = [
  { name_en: "Metformin", slug: "metformin" },
  { name_en: "Atorvastatin", slug: "atorvastatin" },
  { name_en: "Lisinopril", slug: "lisinopril" },
  { name_en: "Levothyroxine", slug: "levothyroxine" },
  { name_en: "Metoprolol", slug: "metoprolol" },
  { name_en: "Amlodipine", slug: "amlodipine" },
  { name_en: "Simvastatin", slug: "simvastatin" },
  { name_en: "Omeprazole", slug: "omeprazole" },
  { name_en: "Losartan", slug: "losartan" },
  { name_en: "Gabapentin", slug: "gabapentin" },
  { name_en: "Sertraline", slug: "sertraline" },
  { name_en: "Hydrochlorothiazide", slug: "hydrochlorothiazide" },
  { name_en: "Albuterol", slug: "albuterol" },
  { name_en: "Furosemide", slug: "furosemide" },
  { name_en: "Tramadol", slug: "tramadol" },
  { name_en: "Warfarin", slug: "warfarin" },
  { name_en: "Prednisone", slug: "prednisone" },
  { name_en: "Insulin", slug: "insulin" },
  { name_en: "Aspirin", slug: "aspirin" },
  { name_en: "Ibuprofen", slug: "ibuprofen" },
  { name_en: "Acetaminophen", slug: "acetaminophen" },
  { name_en: "Naproxen", slug: "naproxen" },
  { name_en: "Cyclobenzaprine", slug: "cyclobenzaprine" },
  { name_en: "Pantoprazole", slug: "pantoprazole" },
  { name_en: "Clopidogrel", slug: "clopidogrel" }
];

export type SeedTerm = {
  name_en: string;
  slug: string;
};

export function searchTerms(query: string, category: 'condition' | 'allergy' | 'medication'): SeedTerm[] {
  const terms = category === 'condition' ? COMMON_CONDITIONS 
    : category === 'allergy' ? COMMON_ALLERGIES 
    : COMMON_MEDICATIONS;
    
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return terms
    .filter(term => term.name_en.toLowerCase().includes(lowerQuery))
    .slice(0, 10); // Limit to 10 suggestions
}