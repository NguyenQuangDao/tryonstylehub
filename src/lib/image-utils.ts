export const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function validateImageFile(file: { type: string; size: number }, maxSize = 10 * 1024 * 1024): boolean {
  if (!allowedImageTypes.includes(file.type)) return false
  if (!file.size || file.size <= 0) return false
  if (file.size > maxSize) return false
  return true
}
