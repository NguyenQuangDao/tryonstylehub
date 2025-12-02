/**
 * Payment Logger
 * Comprehensive logging for payment and token transactions
 */

import { prisma } from './prisma'

export enum LogLevel {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SECURITY = 'SECURITY',
}

export enum PaymentEventType {
    PURCHASE_INITIATED = 'PURCHASE_INITIATED',
    PURCHASE_COMPLETED = 'PURCHASE_COMPLETED',
    PURCHASE_FAILED = 'PURCHASE_FAILED',
    TOKEN_DEDUCTED = 'TOKEN_DEDUCTED',
    TOKEN_REFUNDED = 'TOKEN_REFUNDED',
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
    PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
    PAYMENT_DECLINED = 'PAYMENT_DECLINED',
}

interface LogEntry {
    userId?: string | number
    eventType: PaymentEventType
    level: LogLevel
    details: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

/**
 * Log payment and token-related events
 */
export async function logPaymentEvent(entry: LogEntry): Promise<void> {
    try {
        const logData = {
            userId: entry.userId || null,
            service: 'payment',
            operation: entry.eventType,
            cost: 0, // For payment logs, cost is tracked in TokenPurchase
            details: JSON.stringify({
                level: entry.level,
                timestamp: new Date().toISOString(),
                ipAddress: entry.ipAddress,
                userAgent: entry.userAgent,
                ...entry.details,
            }),
        }

        await (prisma as any).costTracking.create({ data: logData })

        // Also log to console for development
        console.log(`[${entry.level}] ${entry.eventType}:`, entry.details)
    } catch (error) {
        console.error('Failed to log payment event:', error)
    }
}

/**
 * Log token deduction events
 */
export async function logTokenDeduction(
    userId: string | number,
    operation: string,
    tokensCost: number,
    success: boolean,
    details?: Record<string, any>
): Promise<void> {
    await logPaymentEvent({
        userId,
        eventType: success ? PaymentEventType.TOKEN_DEDUCTED : PaymentEventType.INSUFFICIENT_BALANCE,
        level: success ? LogLevel.INFO : LogLevel.WARNING,
        details: {
            operation,
            tokensCost,
            success,
            ...details,
        },
    })
}

/**
 * Get payment logs for a user
 */
export async function getUserPaymentLogs(userId: string | number, limit = 50) {
    return (prisma as any).costTracking.findMany({
        where: {
            userId,
            service: 'payment',
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Get security events
 */
export async function getSecurityEvents(limit = 100) {
    const logs = await (prisma as any).costTracking.findMany({
        where: { service: 'payment' },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })

    return logs.filter((log: any) => {
        try {
            const details = JSON.parse(log.details || '{}')
            return details.level === LogLevel.SECURITY
        } catch {
            return false
        }
    })
}
