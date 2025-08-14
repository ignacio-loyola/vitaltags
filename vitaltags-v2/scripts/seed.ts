import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'

async function main() {
  const prisma = new PrismaClient()
  const email = 'test+demo@example.com'
  // Upsert user
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email } })
  // Upsert profile with comprehensive demo data
  const profile = await prisma.profile.upsert({
    where: { publicId: 'demo-public-id' },
    update: {
      alias: 'Alex Johnson',
      ageRange: '35-45',
      criticalAllergies: ['Penicillin', 'Peanuts', 'Shellfish'],
      criticalConditions: ['Type 2 diabetes', 'Hypertension', 'Asthma'],
      criticalMeds: ['Metformin', 'Lisinopril', 'Albuterol'],
      icePhone: '(555) 123-DEMO',
      allowBreakGlass: true,
    },
    create: {
      userId: user.id,
      publicId: 'demo-public-id',
      alias: 'Alex Johnson',
      ageRange: '35-45',
      criticalAllergies: ['Penicillin', 'Peanuts', 'Shellfish'],
      criticalConditions: ['Type 2 diabetes', 'Hypertension', 'Asthma'],
      criticalMeds: ['Metformin', 'Lisinopril', 'Albuterol'],
      icePhone: '(555) 123-DEMO',
      revocationCode: crypto.randomUUID().slice(0, 8),
      allowBreakGlass: true,
    },
  })

  // Add comprehensive realistic medical terms to the profile
  const conditions = [
    { name_en: 'Type 2 diabetes', slug: 'type-2-diabetes', note: 'Diagnosed 2018, well controlled with medication', onsetDate: new Date('2018-03-15') },
    { name_en: 'Hypertension', slug: 'hypertension', note: 'Stage 1, controlled with ACE inhibitor', onsetDate: new Date('2019-07-22') },
    { name_en: 'Asthma', slug: 'asthma', note: 'Exercise-induced, well controlled', onsetDate: new Date('2010-05-10') },
    { name_en: 'High cholesterol', slug: 'high-cholesterol', note: 'LDL 180, on statin therapy', onsetDate: new Date('2020-01-15') },
    { name_en: 'Migraine', slug: 'migraine', note: 'Chronic, triggered by stress and lack of sleep' },
    { name_en: 'Osteoarthritis', slug: 'osteoarthritis', note: 'Bilateral knees, managed with NSAIDs' },
    { name_en: 'Sleep apnea', slug: 'sleep-apnea', note: 'Moderate severity, uses CPAP machine' },
  ]

  for (const condition of conditions) {
    await prisma.condition.upsert({
      where: { slug: condition.slug },
      update: {},
      create: {
        profileId: profile.id,
        ...condition,
      },
    })
  }

  const allergies = [
    { name_en: 'Penicillin', slug: 'penicillin', criticality: 'high', note: 'Severe reaction - anaphylaxis risk' },
    { name_en: 'Peanuts', slug: 'peanuts', criticality: 'high', note: 'Throat swelling, carries EpiPen' },
    { name_en: 'Shellfish', slug: 'shellfish', criticality: 'high', note: 'Hives and breathing difficulties' },
    { name_en: 'Sulfa drugs', slug: 'sulfa-drugs', criticality: 'high', note: 'Skin rash and fever' },
    { name_en: 'Latex', slug: 'latex', criticality: 'low', note: 'Contact dermatitis' },
    { name_en: 'Iodine contrast', slug: 'iodine-contrast', criticality: 'high', note: 'Previous reaction during CT scan' },
    { name_en: 'Aspirin', slug: 'aspirin', criticality: 'high', note: 'GI bleeding risk' },
  ]

  for (const allergy of allergies) {
    await prisma.allergy.upsert({
      where: { slug: allergy.slug },
      update: {},
      create: {
        profileId: profile.id,
        ...allergy,
      },
    })
  }

  const medications = [
    { name_en: 'Metformin', slug: 'metformin', doseText: '500mg twice daily', note: 'Take with meals' },
    { name_en: 'Lisinopril', slug: 'lisinopril', doseText: '10mg daily', note: 'For blood pressure' },
    { name_en: 'Albuterol', slug: 'albuterol', doseText: '2 puffs as needed', note: 'Rescue inhaler for asthma' },
    { name_en: 'Atorvastatin', slug: 'atorvastatin', doseText: '20mg at bedtime', note: 'For cholesterol' },
    { name_en: 'Sumatriptan', slug: 'sumatriptan', doseText: '50mg as needed', note: 'For migraines, max 2 per day' },
    { name_en: 'Ibuprofen', slug: 'ibuprofen', doseText: '400mg as needed', note: 'For arthritis pain, max 1200mg/day' },
    { name_en: 'Omeprazole', slug: 'omeprazole', doseText: '20mg daily', note: 'Stomach protection' },
    { name_en: 'Vitamin D3', slug: 'vitamin-d3', doseText: '2000 IU daily', note: 'Supplement' },
    { name_en: 'EpiPen', slug: 'epipen', doseText: '0.3mg auto-injector', note: 'Emergency use for severe allergic reactions' },
  ]

  for (const medication of medications) {
    await prisma.medication.upsert({
      where: { slug: medication.slug },
      update: {},
      create: {
        profileId: profile.id,
        ...medication,
      },
    })
  }
  // Add all seed terms from autocomplete data to database (independent of profiles)
  const { COMMON_CONDITIONS, COMMON_ALLERGIES, COMMON_MEDICATIONS } = await import('../apps/web/src/data/seed-terms')
  
  console.log('Seeding global medical terms database...')
  
  // Add all conditions
  for (const condition of COMMON_CONDITIONS) {
    await prisma.condition.upsert({
      where: { slug: condition.slug },
      update: {},
      create: {
        profileId: profile.id, // Using demo profile as default, but these are available globally
        name_en: condition.name_en,
        slug: condition.slug,
        note: 'Common medical condition',
      },
    })
  }
  
  // Add all allergies
  for (const allergy of COMMON_ALLERGIES) {
    await prisma.allergy.upsert({
      where: { slug: allergy.slug },
      update: {},
      create: {
        profileId: profile.id,
        name_en: allergy.name_en,
        slug: allergy.slug,
        criticality: allergy.name_en.includes('Penicillin') || allergy.name_en.includes('Peanuts') ? 'high' : 'low',
        note: 'Common allergen',
      },
    })
  }
  
  // Add all medications
  for (const medication of COMMON_MEDICATIONS) {
    await prisma.medication.upsert({
      where: { slug: medication.slug },
      update: {},
      create: {
        profileId: profile.id,
        name_en: medication.name_en,
        slug: medication.slug,
        note: 'Common medication',
      },
    })
  }

  console.log(`Seeded ${COMMON_CONDITIONS.length} conditions, ${COMMON_ALLERGIES.length} allergies, ${COMMON_MEDICATIONS.length} medications`)
  console.log('Seeded user:', email)
  console.log('Public emergency URL: /e/demo-public-id')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => process.exit(0))


