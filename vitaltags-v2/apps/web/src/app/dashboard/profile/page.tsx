import { getSessionUser } from '../../../lib/auth'
import { prisma } from '../../../lib/db'
import { generateDEK, wrapDEK, encryptJSON } from '../../../lib/crypto'

async function saveTierC(profileId: string, data: unknown) {
  const dek = await generateDEK()
  const wrapped = await wrapDEK(dek)
  const { ciphertext, nonce } = await encryptJSON(dek, data)
  await prisma.profile.update({
    where: { id: profileId },
    data: { c_ciphertext: Buffer.from(ciphertext), c_nonce: Buffer.from(nonce), dek_wrapped: Buffer.from(wrapped) },
  })
}

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) return <div style={{ padding: 24 }}>Not signed in.</div>
  const profile = await prisma.profile.findFirst({ where: { userId: user.id } })
  return (
    <main style={{ padding: 24 }}>
      <h1>Edit Profile</h1>
      <form action={async (formData: FormData) => {
        'use server'
        const alias = String(formData.get('alias') || '')
        const ageRange = String(formData.get('ageRange') || '')
        const icePhone = String(formData.get('icePhone') || '')
        const criticalAllergies = (String(formData.get('criticalAllergies') || '').split('\n').filter(Boolean))
        const criticalConditions = (String(formData.get('criticalConditions') || '').split('\n').filter(Boolean))
        const criticalMeds = (String(formData.get('criticalMeds') || '').split('\n').filter(Boolean))
        const dataC = String(formData.get('tierC') || '{}')
        const parsedC = JSON.parse(dataC)
        if (profile) {
          await prisma.profile.update({ where: { id: profile.id }, data: { alias, ageRange, icePhone, criticalAllergies, criticalConditions, criticalMeds } })
          await saveTierC(profile.id, parsedC)
        } else {
          const created = await prisma.profile.create({ data: {
            userId: user.id,
            publicId: crypto.randomUUID().replace(/-/g, ''),
            alias, ageRange, icePhone, criticalAllergies, criticalConditions, criticalMeds,
            revocationCode: crypto.randomUUID().slice(0, 8),
          } })
          await saveTierC(created.id, parsedC)
        }
      }}>
        <fieldset>
          <legend>Tier E (public)</legend>
          <label>Alias <input name="alias" defaultValue={profile?.alias || ''} /></label><br />
          <label>Age range <input name="ageRange" defaultValue={profile?.ageRange || ''} /></label><br />
          <label>ECP phone <input name="icePhone" defaultValue={profile?.icePhone || ''} /></label><br />
          <label>Critical allergies<br /><textarea name="criticalAllergies" defaultValue={(profile?.criticalAllergies||[]).join('\n')} /></label><br />
          <label>Critical conditions<br /><textarea name="criticalConditions" defaultValue={(profile?.criticalConditions||[]).join('\n')} /></label><br />
          <label>Critical meds<br /><textarea name="criticalMeds" defaultValue={(profile?.criticalMeds||[]).join('\n')} /></label><br />
        </fieldset>
        <fieldset>
          <legend>Tier C (encrypted JSON)</legend>
          <textarea name="tierC" rows={8} defaultValue="{}" />
        </fieldset>
        <button type="submit">Save</button>
      </form>
    </main>
  )
}


