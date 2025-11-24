/**
 * Token Middleware
 * Middleware to check and deduct tokens before allowing access to paid features
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { checkTokenBalance, deductTokens } from './token-manager'

export interface TokenRequirement {
    operation: string
    tokensRequired: number
}

/**
 * Middleware to check if user has enough tokens
 * Use this in API routes that require tokens
 */
export async function requireTokens(
    req: NextRequest,
    requirement: TokenRequirement
): Promise<{
    success: boolean
    userId?: number
    error?: string
    insufficientTokens?: boolean
    currentBalance?: number
}> {
    try {
        // 1. Authenticate user
        const tokenCookie = req.cookies.get('token')?.value
        if (!tokenCookie) {
            return {
                success: false,
                error: 'Unauthorized: Please login',
            }
        }

        const payload = await verifyToken(tokenCookie)
        if (!payload?.userId) {
            return {
                success: false,
                error: 'Unauthorized: Invalid token',
            }
        }

        // 2. Check token balance
        const balanceCheck = await checkTokenBalance(
            payload.userId,
            requirement.tokensRequired
        )

        if (!balanceCheck.hasEnoughTokens) {
            return {
                success: false,
                insufficientTokens: true,
                currentBalance: balanceCheck.currentBalance,
                error: balanceCheck.message,
            }
        }

        return {
            success: true,
            userId: payload.userId,
        }
    } catch (error) {
        console.error('Token requirement check error:', error)
        return {
            success: false,
            error: 'Failed to verify token requirement',
        }
    }
}

/**
 * Deduct tokens for a completed operation
 * Call this AFTER the operation succeeds
 */
export async function chargeTokens(
    userId: number,
    operation: string,
    tokensRequired: number,
    metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    return deductTokens(userId, tokensRequired, operation, metadata)
}

/**
 * Helper to create a standardized insufficient tokens response
 */
export function createInsufficientTokensResponse(
    required: number,
    current: number,
    operation: string
) {
    return NextResponse.json(
        {
            error: 'Insufficient tokens',
            insufficientTokens: true,
            details: {
                required,
                current,
                deficit: required - current,
                operation,
                message: `Bạn cần ${required} token để ${operation}, nhưng chỉ có ${current} token.`,
            },
        },
        { status: 402 } // 402 Payment Required
    )
}

/**
 * Example usage in an API route:
 * 
 * export async function POST(req: NextRequest) {
 *   // Check token requirement
 *   const tokenCheck = await requireTokens(req, {
 *     operation: 'AI Recommendation',
 *     tokensRequired: TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
 *   })
 * 
 *   if (!tokenCheck.success) {
 *     if (tokenCheck.insufficientTokens) {
 *       return createInsufficientTokensResponse(
 *         TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
 *         tokenCheck.currentBalance || 0,
 *         'AI Recommendation'
 *       )
 *     }
 *     return NextResponse.json({ error: tokenCheck.error }, { status: 401 })
 *   }
 * 
 *   try {
 *     // Perform the operation
 *     const result = await performAIRecommendation(...)
 * 
 *     // Charge tokens AFTER success
 *     await chargeTokens(
 *       tokenCheck.userId!,
 *       'AI Recommendation',
 *       TOKEN_CONFIG.COSTS.AI_RECOMMENDATION,
 *       { resultId: result.id }
 *     )
 * 
 *     return NextResponse.json({ success: true, data: result })
 *   } catch (error) {
 *     // Don't charge tokens if operation failed
 *     return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
 *   }
 * }
 */
