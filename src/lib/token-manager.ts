/**
 * Token Manager
 * Handles token balance checks, deductions, and validations
 */

import { LogLevel, PaymentEventType, logPaymentEvent, logTokenDeduction } from './payment-logger'
import { prisma } from './prisma'

export interface TokenCheckResult {
    hasEnoughTokens: boolean
    currentBalance: number
    required: number
    message: string
}

/**
 * Check if user has enough tokens for an operation
 */
export async function checkTokenBalance(
    userId: number,
    requiredTokens: number
): Promise<TokenCheckResult> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
    })

    if (!user) {
        return {
            hasEnoughTokens: false,
            currentBalance: 0,
            required: requiredTokens,
            message: 'Người dùng không tồn tại',
        }
    }

    const hasEnoughTokens = user.tokenBalance >= requiredTokens

    return {
        hasEnoughTokens,
        currentBalance: user.tokenBalance,
        required: requiredTokens,
        message: hasEnoughTokens
            ? 'Đủ token'
            : `Không đủ token. Bạn cần ${requiredTokens} token nhưng chỉ có ${user.tokenBalance} token`,
    }
}

/**
 * Deduct tokens from user balance
 * This function is atomic and will rollback if operation fails
 */
export async function deductTokens(
    userId: number,
    amount: number,
    operation: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
        // Check balance first
        const balanceCheck = await checkTokenBalance(userId, amount)

        if (!balanceCheck.hasEnoughTokens) {
            await logTokenDeduction(userId, operation, amount, false, {
                reason: 'insufficient_balance',
                currentBalance: balanceCheck.currentBalance,
                ...metadata,
            })

            return {
                success: false,
                error: balanceCheck.message,
            }
        }

        // Deduct tokens in a transaction
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { tokenBalance: { decrement: amount } },
            select: { tokenBalance: true },
        })

        // Log successful deduction
        await logTokenDeduction(userId, operation, amount, true, {
            previousBalance: balanceCheck.currentBalance,
            newBalance: updatedUser.tokenBalance,
            ...metadata,
        })

        return {
            success: true,
            newBalance: updatedUser.tokenBalance,
        }
    } catch (error) {
        console.error('Token deduction error:', error)

        await logPaymentEvent({
            userId,
            eventType: PaymentEventType.TOKEN_DEDUCTED,
            level: LogLevel.ERROR,
            details: {
                operation,
                amount,
                error: error instanceof Error ? error.message : 'Unknown error',
                ...metadata,
            },
        })

        return {
            success: false,
            error: 'Không thể trừ token. Vui lòng thử lại.',
        }
    }
}

/**
 * Refund tokens to user (e.g., if operation failed after deduction)
 */
export async function refundTokens(
    userId: number,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance?: number }> {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { tokenBalance: { increment: amount } },
            select: { tokenBalance: true },
        })

        await logPaymentEvent({
            userId,
            eventType: PaymentEventType.TOKEN_REFUNDED,
            level: LogLevel.INFO,
            details: {
                amount,
                reason,
                newBalance: updatedUser.tokenBalance,
                ...metadata,
            },
        })

        return {
            success: true,
            newBalance: updatedUser.tokenBalance,
        }
    } catch (error) {
        console.error('Token refund error:', error)
        return { success: false }
    }
}

/**
 * Get current token balance for user
 */
export async function getTokenBalance(userId: number): Promise<number> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
    })

    return user?.tokenBalance || 0
}

/**
 * Add tokens to user balance (after successful purchase)
 */
export async function addTokens(
    userId: number,
    amount: number,
    source: string,
    metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance?: number }> {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { tokenBalance: { increment: amount } },
            select: { tokenBalance: true },
        })

        await logPaymentEvent({
            userId,
            eventType: PaymentEventType.PURCHASE_COMPLETED,
            level: LogLevel.INFO,
            details: {
                tokensAdded: amount,
                source,
                newBalance: updatedUser.tokenBalance,
                ...metadata,
            },
        })

        return {
            success: true,
            newBalance: updatedUser.tokenBalance,
        }
    } catch (error) {
        console.error('Add tokens error:', error)
        return { success: false }
    }
}
