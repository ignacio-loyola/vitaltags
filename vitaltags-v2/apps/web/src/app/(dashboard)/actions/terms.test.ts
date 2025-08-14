import { describe, it, expect, beforeAll } from 'vitest'
import { addCondition, updateCondition, removeCondition } from './terms'
import { prisma } from '../../../lib/db'

beforeAll(async () => {
  // Create a temp user and profile for tests
  const u = await prisma.user.upsert({ where: { email: 'test+terms@example.com' }, update: {}, create: { email: 'test+terms@example.com' } })
  await prisma.profile.upsert({
    where: { publicId: 'terms-public' },
    update: {},
    create: {
      userId: u.id,
      publicId: 'terms-public',
      alias: 'Terms User',
      ageRange: '30-40',
      criticalAllergies: [],
      criticalConditions: [],
      criticalMeds: [],
      icePhone: '+15550000000',
      revocationCode: 'revcode',
    },
  })
})

describe('terms actions', () => {
  it('create/update/delete condition happy path', async () => {
    const profile = await prisma.profile.findUnique({ where: { publicId: 'terms-public' } })
    expect(profile).toBeTruthy()
    const created = await addCondition(profile!.id, { name_en: 'Hypertension' })
    expect(created.ok).toBe(true)
    const id = (created as any).id as string
    const updated = await updateCondition(id, { note: 'controlled' })
    expect(updated.ok).toBe(true)
    const removed = await removeCondition(id)
    expect(removed.ok).toBe(true)
  })

  it('rejects invalid name', async () => {
    const profile = await prisma.profile.findUnique({ where: { publicId: 'terms-public' } })
    const res = await addCondition(profile!.id, { name_en: '!' })
    expect(res.ok).toBe(false)
  })
})


