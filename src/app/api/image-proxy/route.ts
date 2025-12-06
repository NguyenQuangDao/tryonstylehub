import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) {
      return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    if (!/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'Invalid url' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    const res = await fetch(url)
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch remote image' }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await res.arrayBuffer()
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=300',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
