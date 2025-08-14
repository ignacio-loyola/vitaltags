import { describe, it, expect } from 'vitest'
import { toSlug, nameSchema } from './terms'

describe('terms helpers', () => {
  it('toSlug normalizes text', () => {
    expect(toSlug(' Type 2 Diabetes ')).toBe('type-2-diabetes')
    expect(toSlug('Metformin 500 mg (tablet)')).toBe('metformin-500-mg-tablet')
  })

  it('nameSchema accepts normal names and rejects invalid', () => {
    expect(() => nameSchema.parse('Asthma')).not.toThrow()
    expect(() => nameSchema.parse('A')).toThrow()
    expect(() => nameSchema.parse('Bad♥Name')).toThrow()
  })
})


