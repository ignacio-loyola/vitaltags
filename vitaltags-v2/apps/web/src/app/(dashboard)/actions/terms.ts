'use server'

import { prisma } from '../../../lib/db'
import { itemSchema, toSlug } from '../../../lib/terms'

type ActionOk = { ok: true; id?: string; slug?: string }
type ActionErr = { ok: false; error: string; code: 'VALIDATION' | 'DUPLICATE' | 'UNKNOWN' }
type ActionResult = ActionOk | ActionErr

function shortid(): string {
  return Math.random().toString(36).slice(2, 6)
}

async function uniqueSlug(
  table: 'Condition' | 'Medication' | 'Allergy',
  base: string,
  profileId: string
): Promise<{ candidate: string; duplicateForSameProfile: boolean }> {
  let candidate = base
  for (let i = 0; i < 6; i++) {
    const existing = await prisma[table.toLowerCase() as 'condition' | 'medication' | 'allergy'].findUnique({
      where: { slug: candidate },
      select: { id: true, profileId: true },
    } as any)
    if (!existing) return { candidate, duplicateForSameProfile: false }
    if (existing.profileId === profileId) return { candidate, duplicateForSameProfile: true }
    candidate = `${base}-${shortid()}`
  }
  return { candidate, duplicateForSameProfile: false }
}

async function wrap<T>(fn: () => Promise<T>): Promise<ActionResult & Partial<T>> {
  try {
    return (await fn()) as any
  } catch {
    return { ok: false, error: 'unknown_error', code: 'UNKNOWN' }
  }
}

export async function addCondition(profileId: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  const baseSlug = toSlug(parsed.data.name_en)
  const { candidate, duplicateForSameProfile } = await uniqueSlug('Condition', baseSlug, profileId)
  if (duplicateForSameProfile) return { ok: false, error: 'duplicate', code: 'DUPLICATE' }
  return wrap(async () => {
    const created = await prisma.condition.create({
      data: {
        profileId,
        name_en: parsed.data.name_en,
        slug: candidate,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        onsetDate: parsed.data.onsetDate ? new Date(parsed.data.onsetDate) : undefined,
      },
      select: { id: true, slug: true },
    })
    return { ok: true, id: created.id, slug: created.slug }
  })
}

export async function updateCondition(id: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  return wrap(async () => {
    await prisma.condition.update({
      where: { id },
      data: {
        name_en: parsed.data.name_en ?? undefined,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        onsetDate: parsed.data.onsetDate ? new Date(parsed.data.onsetDate) : undefined,
      },
    })
    return { ok: true }
  })
}

export async function removeCondition(id: string): Promise<ActionResult> {
  return wrap(async () => {
    await prisma.condition.delete({ where: { id } })
    return { ok: true }
  })
}

export async function addMedication(profileId: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  const baseSlug = toSlug(parsed.data.name_en)
  const { candidate, duplicateForSameProfile } = await uniqueSlug('Medication', baseSlug, profileId)
  if (duplicateForSameProfile) return { ok: false, error: 'duplicate', code: 'DUPLICATE' }
  return wrap(async () => {
    const created = await prisma.medication.create({
      data: {
        profileId,
        name_en: parsed.data.name_en,
        slug: candidate,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        doseText: parsed.data.doseText ?? undefined,
      },
      select: { id: true, slug: true },
    })
    return { ok: true, id: created.id, slug: created.slug }
  })
}

export async function updateMedication(id: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  return wrap(async () => {
    await prisma.medication.update({
      where: { id },
      data: {
        name_en: parsed.data.name_en ?? undefined,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        doseText: parsed.data.doseText ?? undefined,
      },
    })
    return { ok: true }
  })
}

export async function removeMedication(id: string): Promise<ActionResult> {
  return wrap(async () => {
    await prisma.medication.delete({ where: { id } })
    return { ok: true }
  })
}

export async function addAllergy(profileId: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  const baseSlug = toSlug(parsed.data.name_en)
  const { candidate, duplicateForSameProfile } = await uniqueSlug('Allergy', baseSlug, profileId)
  if (duplicateForSameProfile) return { ok: false, error: 'duplicate', code: 'DUPLICATE' }
  return wrap(async () => {
    const created = await prisma.allergy.create({
      data: {
        profileId,
        name_en: parsed.data.name_en,
        slug: candidate,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        criticality: parsed.data.criticality ?? undefined,
      },
      select: { id: true, slug: true },
    })
    return { ok: true, id: created.id, slug: created.slug }
  })
}

export async function updateAllergy(id: string, input: unknown): Promise<ActionResult> {
  const parsed = itemSchema.partial().safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input', code: 'VALIDATION' }
  return wrap(async () => {
    await prisma.allergy.update({
      where: { id },
      data: {
        name_en: parsed.data.name_en ?? undefined,
        system: parsed.data.system ?? undefined,
        code: parsed.data.code ?? undefined,
        note: parsed.data.note ?? undefined,
        criticality: parsed.data.criticality ?? undefined,
      },
    })
    return { ok: true }
  })
}

export async function removeAllergy(id: string): Promise<ActionResult> {
  return wrap(async () => {
    await prisma.allergy.delete({ where: { id } })
    return { ok: true }
  })
}


