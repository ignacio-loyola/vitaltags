import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'

async function main() {
  const prisma = new PrismaClient()
  const email = 'test+demo@example.com'
  // Upsert user
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email } })
  // Upsert profile
  const profile = await prisma.profile.upsert({
    where: { publicId: 'demo-public-id' },
    update: {},
    create: {
      userId: user.id,
      publicId: 'demo-public-id',
      alias: 'Demo User',
      ageRange: '30-40',
      criticalAllergies: ['penicillin'],
      criticalConditions: ['asthma'],
      criticalMeds: ['albuterol'],
      icePhone: '+15555550123',
      revocationCode: crypto.randomUUID().slice(0, 8),
    },
  })
  console.log('Seeded user:', email)
  console.log('Public emergency URL: /e/demo-public-id')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => process.exit(0))


