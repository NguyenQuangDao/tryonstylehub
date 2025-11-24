import { NextResponse } from 'next/server'
import { TOKEN_CONFIG } from '../../../../config/tokens'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: TOKEN_CONFIG.PACKAGES
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}