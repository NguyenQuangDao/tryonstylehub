import { describe, it, expect } from 'vitest'
import { generateS3Key } from '../s3'

describe('generateS3Key', () => {
  it('sanitizes filename and includes prefix', () => {
    const key = generateS3Key('products', 'Ảnh mới (v1).jpg')
    expect(key.startsWith('products/')).toBe(true)
    const parts = key.split('/')
    const fname = parts[parts.length - 1]
    expect(fname).toMatch(/jpg$/)
    expect(fname).not.toMatch(/\s|\(|\)/)
  })
})
