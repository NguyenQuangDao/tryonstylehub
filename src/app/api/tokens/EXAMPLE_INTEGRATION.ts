/**
 * EXAMPLE: Token-Protected API Route
 * 
 * This is an example of how to integrate token checking and deduction
 * into an existing API route (like /api/recommend)
 * 
 * Follow these steps to add token protection to any API:
 */

import { TOKEN_CONFIG } from '@/config/tokens'
import { chargeTokens, createInsufficientTokensResponse, requireTokens } from '@/lib/token-middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // ============================================
  // STEP 1: Check Token Requirement
  // ============================================
  const tokenCheck = await requireTokens(request, {
    operation: 'AI Recommendation',
    tokensRequired: TOKEN_CONFIG.COSTS.AI_RECOMMENDATION.amount,
  })

  // If token check failed
  if (!tokenCheck.success) {
    // Insufficient tokens - show friendly error
    if (tokenCheck.insufficientTokens) {
      return createInsufficientTokensResponse(
        TOKEN_CONFIG.COSTS.AI_RECOMMENDATION.amount,
        tokenCheck.currentBalance || 0,
        'sử dụng AI Recommendation'
      )
    }

    // Other errors (authentication, etc.)
    return NextResponse.json(
      { error: tokenCheck.error },
      { status: 401 }
    )
  }

  // ============================================
  // STEP 2: Perform Your Operation
  // ============================================
  try {
    // Your existing API logic here
    // For example:
    const body = await request.json()
    const { style } = body

    // Validate input
    if (!style) {
      return NextResponse.json(
        { error: 'Style is required' },
        { status: 400 }
      )
    }

    // Perform AI recommendation (your existing logic)
    const result = await performAIRecommendation()

    // ============================================
    // STEP 3: Charge Tokens AFTER Success
    // ============================================
    const chargeResult = await chargeTokens(
      tokenCheck.userId!,
      'AI Recommendation',
      TOKEN_CONFIG.COSTS.AI_RECOMMENDATION.amount,
      {
        style,
        resultCount: result.outfit.length,
        outfitId: result.outfitId,
      }
    )

    // Return success with updated balance
    return NextResponse.json({
      success: true,
      data: result,
      tokenInfo: {
        charged: TOKEN_CONFIG.COSTS.AI_RECOMMENDATION.amount,
        newBalance: chargeResult.newBalance,
      },
    })

  } catch (error) {
    console.error('API Error:', error)

    // ============================================
    // IMPORTANT: Don't charge tokens on error!
    // ============================================
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}

/**
 * Mock function - replace with your actual recommendation logic
 */
async function performAIRecommendation() {
  // Your existing recommendation logic here
  return {
    outfitId: 123,
    outfit: [
      { id: 1, name: 'Product 1', type: 'shirt', price: 29.99 },
      { id: 2, name: 'Product 2', type: 'pants', price: 49.99 },
    ],
  }
}

/**
 * ============================================
 * FRONTEND INTEGRATION EXAMPLE
 * ============================================
 * 
 * How to handle the response in your React component:
 */

/*
// In your React component (e.g., recommend/page.tsx)

const handleRecommendation = async (style: string) => {
  try {
    setLoading(true)
    setError(null)
    
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style }),
    })

    const data = await response.json()

    // Handle insufficient tokens (402 status)
    if (response.status === 402 && data.insufficientTokens) {
      setShowInsufficientTokensModal(true)
      setInsufficientTokensData({
        required: data.details.required,
        current: data.details.current,
        operation: data.details.operation,
      })
      return
    }

    // Handle other errors
    if (!response.ok) {
      setError(data.error || 'Something went wrong')
      return
    }

    // Success - update UI with results
    setResults(data.data)
    setTokenBalance(data.tokenInfo.newBalance)
    
  } catch (err) {
    setError('Network error occurred')
  } finally {
    setLoading(false)
  }
}

// Render insufficient tokens modal
{showInsufficientTokensModal && (
  <InsufficientTokensModal
    isOpen={showInsufficientTokensModal}
    onClose={() => setShowInsufficientTokensModal(false)}
    required={insufficientTokensData.required}
    current={insufficientTokensData.current}
    operation={insufficientTokensData.operation}
  />
)}
*/

/**
 * ============================================
 * MIGRATION CHECKLIST
 * ============================================
 * 
 * To add token protection to an existing API:
 * 
 * 1. [ ] Import token middleware functions
 * 2. [ ] Add requireTokens() at the start of your handler
 * 3. [ ] Handle insufficientTokens error case
 * 4. [ ] Keep your existing operation logic
 * 5. [ ] Add chargeTokens() AFTER successful operation
 * 6. [ ] Ensure tokens are NOT charged on errors
 * 7. [ ] Update frontend to handle 402 status
 * 8. [ ] Add InsufficientTokensModal to frontend
 * 9. [ ] Update token balance in UI after operation
 * 10. [ ] Test both success and failure scenarios
 */
