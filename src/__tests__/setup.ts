import '@testing-library/jest-dom'

if (typeof globalThis.fetch === 'undefined') {
  // Simple fetch polyfill for tests that don't stub fetch
  globalThis.fetch = async () => new Response('{}', { status: 200 }) as any
}

