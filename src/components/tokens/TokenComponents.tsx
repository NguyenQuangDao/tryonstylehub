'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TOKEN_CONFIG } from '../../config/tokens'

interface InsufficientTokensModalProps {
    isOpen: boolean
    onClose: () => void
    required: number
    current: number
    operation: string
}

export function InsufficientTokensModal({
    isOpen,
    onClose,
    required,
    current,
    operation,
}: InsufficientTokensModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || !isOpen) return null

    const deficit = required - current
    const recommendedPackage = TOKEN_CONFIG.PACKAGES.find(
        pkg => pkg.tokens >= deficit
    ) || TOKEN_CONFIG.PACKAGES[TOKEN_CONFIG.PACKAGES.length - 1]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-slideUp">
                {/* Biểu tượng */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                    Không đủ Token
                </h2>

                {/* Thông báo */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-gray-700 text-center">
                        Bạn cần <span className="font-bold text-red-600">{required} token</span> để
                        {' '}<span className="font-semibold">{operation}</span>, nhưng chỉ có{' '}
                        <span className="font-bold text-red-600">{current} token</span>.
                    </p>
                    <p className="text-gray-600 text-center mt-2 text-sm">
                        Bạn thiếu <span className="font-bold">{deficit} token</span>
                    </p>
                </div>

                {/* Gói đề xuất */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 mb-6 border-2 border-purple-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Gói đề xuất</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {recommendedPackage.name}
                        </h3>
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-3xl font-extrabold text-purple-600">
                                {recommendedPackage.tokens}
                            </span>
                            <span className="text-gray-500">token</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ${recommendedPackage.price}
                        </div>
                        {recommendedPackage.savings && recommendedPackage.savings > 0 && (
                            <div className="mt-2">
                                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                    Tiết kiệm {recommendedPackage.savings}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hành động */}
                <div className="space-y-3">
                    <Link
                        href="/tokens"
                        className="
              block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-xl
              hover:from-purple-700 hover:to-pink-700 
              transition-all duration-200 transform hover:scale-105
              shadow-lg hover:shadow-xl text-center
            "
                    >
                        Nạp Token Ngay
                    </Link>

                    <button
                        onClick={onClose}
                        className="
              block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl
              hover:bg-gray-200 transition-colors text-center
            "
                    >
                        Để sau
                    </button>
                </div>

                {/* Thông tin */}
                <p className="text-xs text-gray-500 text-center mt-4">
                    💡 Token được cộng ngay lập tức sau khi thanh toán
                </p>
            </div>
        </div>
    )
}

interface LowBalanceWarningProps {
    balance: number
    onDismiss?: () => void
}

export function LowBalanceWarning({ balance, onDismiss }: LowBalanceWarningProps) {
    if (balance > TOKEN_CONFIG.LOW_BALANCE_THRESHOLD) return null

    return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md mb-6 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-yellow-800 mb-1">
                            {balance === 0 ? 'Hết Token' : 'Sắp hết Token'}
                        </h3>
                        <p className="text-sm text-yellow-700">
                            {balance === 0
                                ? 'Bạn đã hết token. Nạp thêm token để tiếp tục sử dụng dịch vụ.'
                                : `Bạn chỉ còn ${balance} token. Nạp thêm để không bị gián đoạn.`
                            }
                        </p>
                        <Link
                            href="/tokens"
                            className="inline-block mt-2 text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline"
                        >
                            Nạp token ngay →
                        </Link>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 ml-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

interface TokenDisplayProps {
    balance: number
    showWarning?: boolean
    className?: string
}

export function TokenDisplay({ balance, showWarning = true, className = '' }: TokenDisplayProps) {
    const isLow = balance <= TOKEN_CONFIG.LOW_BALANCE_THRESHOLD
    const isEmpty = balance === 0

    return (
        <div className={className}>
            <div className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all
        ${isEmpty
                    ? 'bg-red-100 text-red-800 border-2 border-red-300 animate-pulse'
                    : isLow
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                }
      `}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span>{balance} Token</span>
                {showWarning && isLow && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )}
            </div>
        </div>
    )
}
