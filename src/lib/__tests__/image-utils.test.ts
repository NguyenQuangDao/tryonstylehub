import { describe, it, expect } from 'vitest'
import { validateImageFile, allowedImageTypes } from '../image-utils'

describe('validateImageFile', () => {
  it('accepts allowed types within size limit', () => {
    for (const type of allowedImageTypes) {
      const ok = validateImageFile({ type, size: 1024 * 1024 })
      expect(ok).toBe(true)
    }
  })

  it('rejects disallowed type', () => {
    const ok = validateImageFile({ type: 'image/gif', size: 1024 })
    expect(ok).toBe(false)
  })

  it('rejects zero size and oversize', () => {
    expect(validateImageFile({ type: 'image/png', size: 0 })).toBe(false)
    expect(validateImageFile({ type: 'image/png', size: 11 * 1024 * 1024 })).toBe(false)
  })
})
