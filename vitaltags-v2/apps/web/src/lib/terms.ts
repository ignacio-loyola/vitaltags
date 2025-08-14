import { z } from 'zod'

export function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const NAME_MAX = 80
export const nameSchema = z
  .string()
  .min(2)
  .max(NAME_MAX)
  .regex(/^[A-Za-z0-9()\-\.,\/\s]+$/)

export const codeSystems = [
  'http://snomed.info/sct',
  'http://www.nlm.nih.gov/research/umls/rxnorm',
  'http://hl7.org/fhir/sid/atc',
  'http://hl7.org/fhir/sid/icd-10',
  'http://id.who.int/icd/release/11/mms',
] as const
export type CodeSystem = (typeof codeSystems)[number]

export const itemSchema = z.object({
  name_en: nameSchema,
  system: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  note: z.string().max(200).optional().nullable(),
  onsetDate: z.string().datetime().optional().nullable(),
  doseText: z.string().max(80).optional().nullable(),
  criticality: z.enum(['high', 'low', 'unable-to-assess']).optional().nullable(),
})


