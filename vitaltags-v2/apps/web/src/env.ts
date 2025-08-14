import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .refine((v) => {
        try {
          return Boolean(new URL(v))
        } catch {
          return false
        }
      }, 'Invalid URL'),
    KEK_HEX: z.string().regex(/^[a-f0-9]{64}$/i, 'Must be 256-bit hex (64 chars)'),
    PII_SALT_HEX: z.string().regex(/^[a-f0-9]{32,}$/i, 'Must be hex, >=16 bytes'),
    PASETO_LOCAL_KEY: z.string().regex(/^[a-f0-9]{64}$/i, 'Must be 256-bit hex (64 chars)'),
  },
  client: {
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    KEK_HEX: process.env.KEK_HEX,
    PII_SALT_HEX: process.env.PII_SALT_HEX,
    PASETO_LOCAL_KEY: process.env.PASETO_LOCAL_KEY,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  },
})


