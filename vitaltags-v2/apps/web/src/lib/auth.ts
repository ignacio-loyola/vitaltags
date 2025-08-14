import { cookies } from 'next/headers'
import { prisma } from './db'

const SESSION_COOKIE = 'vt_sess'
const SESSION_TTL_MS = 1000 * 60 * 60 * 8 // 8h

export async function createSession(userId: string) {
  const { randomUUID } = await import('node:crypto')
  const id = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await prisma.session.create({ data: { id, userId, expiresAt } })
  cookies().set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
    expires: expiresAt,
  })
}

export async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const cookie = cookies().get(SESSION_COOKIE)
  if (!cookie) return null
  const sess = await prisma.session.findUnique({ where: { id: cookie.value }, include: { user: true } })
  if (!sess || sess.expiresAt < new Date()) return null
  return { id: sess.user.id, email: sess.user.email }
}

export async function destroySession() {
  const cookie = cookies().get(SESSION_COOKIE)
  if (cookie) {
    await prisma.session.delete({ where: { id: cookie.value } }).catch(() => {})
    cookies().delete(SESSION_COOKIE)
  }
}


