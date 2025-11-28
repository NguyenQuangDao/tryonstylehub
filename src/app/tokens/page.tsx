'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TokenPackage {
    id: string
    name: string
    tokens: number
    price: number
    currency: string
    featured?: boolean
    description?: string
    savings?: number
}

interface PaymentMethod {
    id: string
    name: string
    icon: string
    enabled: boolean
    description?: string
    currencies?: string[]
}

export default function TokenPurchasePage() {
    const router = useRouter()
    const [packages, setPackages] = useState<TokenPackage[]>([])
    const [allPackages, setAllPackages] = useState<TokenPackage[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([])
    const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'VND'>('VND')
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [currentBalance, setCurrentBalance] = useState<number>(0)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch packages
            const packagesRes = await fetch('/api/tokens/packages')
            const packagesData = await packagesRes.json()

            if (packagesData.success) {
                setAllPackages(packagesData.data)
                // Filter packages by default currency
                const currencyPackages = packagesData.data.filter(
                    (p: TokenPackage) => p.currency === selectedCurrency
                )
                setPackages(currencyPackages)
                // Auto-select featured package
                const featured = currencyPackages.find((p: TokenPackage) => p.featured)
                if (featured) setSelectedPackage(featured.id)
            }

            // Fetch payment methods
            const methodsRes = await fetch('/api/tokens/payment-methods')
            const methodsData = await methodsRes.json()

            if (methodsData.success) {
                setAllPaymentMethods(methodsData.data)
                // Filter methods by currency
                const currencyMethods = methodsData.data.filter(
                    (m: PaymentMethod) => !m.currencies || m.currencies.includes(selectedCurrency)
                )
                setPaymentMethods(currencyMethods)
                // Auto-select first payment method
                if (currencyMethods.length > 0) {
                    setSelectedPaymentMethod(currencyMethods[0].id)
                }
            }

            // Fetch current balance
            const balanceRes = await fetch('/api/tokens/balance')
            const balanceData = await balanceRes.json()

            if (balanceData.success) {
                setCurrentBalance(balanceData.data.balance)
            }

        } catch (err) {
            setError('Không thể tải thông tin gói token')
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCurrencyChange = (currency: 'USD' | 'VND') => {
        setSelectedCurrency(currency)

        // Filter packages by currency
        const currencyPackages = allPackages.filter(p => p.currency === currency)
        setPackages(currencyPackages)

        // Filter payment methods by currency
        const currencyMethods = allPaymentMethods.filter(
            m => !m.currencies || m.currencies.includes(currency)
        )
        setPaymentMethods(currencyMethods)

        // Reset selections
        setSelectedPackage(null)
        setSelectedPaymentMethod(currencyMethods.length > 0 ? currencyMethods[0].id : null)
    }

    const handlePurchase = async () => {
        if (!selectedPackage || !selectedPaymentMethod) {
            setError('Vui lòng chọn gói token và phương thức thanh toán')
            return
        }

        try {
            setProcessing(true)
            setError(null)

            const response = await fetch('/api/tokens/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedPackage,
                    paymentMethodId: selectedPaymentMethod,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Thanh toán thất bại')
            }

            // Handle redirect-based payments (MoMo, VNPay, ZaloPay, PayPal)
            if (data.requiresRedirect && data.paymentUrl) {
                window.location.href = data.paymentUrl
                return
            }

            // Handle Stripe client-side confirmation
            if (data.requiresClientConfirmation && data.clientSecret) {
                // TODO: Integrate Stripe Elements for client-side confirmation
                setError('Stripe payment requires client-side setup. Coming soon!')
                setProcessing(false)
                return
            }

            // Direct success (shouldn't happen with real payments)
            setSuccess(true)
            setCurrentBalance(data.data?.newBalance || currentBalance)

            setTimeout(() => {
                router.push('/dashboard?purchase=success')
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
            console.error('Purchase error:', err)
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại
                        </Link>
                        <div className="flex items-center gap-4">
                            {/* Currency Selector */}
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => handleCurrencyChange('VND')}
                                    className={`px-4 py-2 rounded-md font-medium transition-all ${selectedCurrency === 'VND'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    🇻🇳 VND
                                </button>
                                <button
                                    onClick={() => handleCurrencyChange('USD')}
                                    className={`px-4 py-2 rounded-md font-medium transition-all ${selectedCurrency === 'USD'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    🌍 USD
                                </button>
                            </div>
                            <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full">
                                <span className="text-sm text-gray-600">Số dư hiện tại:</span>
                                <span className="text-xl font-bold text-purple-600">{currentBalance} Token</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Success Message */}
                {success && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-bounce">
                        <div className="text-5xl mb-3">🎉</div>
                        <h3 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h3>
                        <p className="text-green-600">Token đã được thêm vào tài khoản của bạn</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-semibold text-red-800">Có lỗi xảy ra</h4>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Nạp Token
                        </h1>
                        <p className="text-lg text-gray-600">
                            Chọn gói token phù hợp với nhu cầu của bạn
                        </p>
                    </div>

                    {/* Token Packages */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn gói token</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    onClick={() => setSelectedPackage(pkg.id)}
                                    className={`
                    relative cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300
                    ${selectedPackage === pkg.id
                                            ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                                        }
                    ${pkg.featured ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
                  `}
                                >
                                    {pkg.featured && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                PHỔ BIẾN
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold text-purple-600">{pkg.tokens}</span>
                                            <span className="text-gray-500 ml-2">token</span>
                                        </div>
                                        <div className="mb-4">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {pkg.currency === 'VND'
                                                    ? `${pkg.price.toLocaleString('vi-VN')}₫`
                                                    : `$${pkg.price}`
                                                }
                                            </span>
                                            {pkg.savings && pkg.savings > 0 && (
                                                <div className="mt-2">
                                                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                        Tiết kiệm {pkg.savings}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {pkg.description && (
                                            <p className="text-sm text-gray-600">{pkg.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedPaymentMethod(method.id)}
                                    className={`
                    cursor-pointer rounded-xl p-4 border-2 transition-all duration-200
                    ${selectedPaymentMethod === method.id
                                            ? 'border-purple-600 bg-purple-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-purple-300'
                                        }
                  `}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{method.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{method.name}</div>
                                            {method.description && (
                                                <div className="text-sm text-gray-500 mt-1">{method.description}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {paymentMethods.length === 0 && (
                            <div className="mt-3 text-sm text-red-600">Không có phương thức cho loại tiền đã chọn. Vui lòng chuyển sang VND.</div>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-4">
                            🔒 Tất cả giao dịch được mã hóa và bảo mật
                        </p>
                    </div>

                    {/* Summary and Purchase Button */}
                    {selectedPackage && selectedPaymentMethod && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận thanh toán</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-gray-600">Gói đã chọn:</span>
                                    <span className="font-semibold text-gray-900">
                                        {packages.find(p => p.id === selectedPackage)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-gray-600">Số token:</span>
                                    <span className="font-semibold text-purple-600 text-xl">
                                        {packages.find(p => p.id === selectedPackage)?.tokens} token
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-gray-600">Phương thức:</span>
                                    <span className="font-semibold text-gray-900">
                                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-2">
                                    <span className="font-bold text-gray-900">Tổng cộng:</span>
                                    <span className="font-bold text-purple-600">
                                        {(() => {
                                            const pkg = packages.find(p => p.id === selectedPackage)
                                            if (!pkg) return ''
                                            return pkg.currency === 'VND'
                                                ? `${pkg.price.toLocaleString('vi-VN')}₫`
                                                : `$${pkg.price}`
                                        })()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={processing}
                                className="
                  w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl
                  hover:from-purple-700 hover:to-pink-700 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 transform hover:scale-105
                  shadow-lg hover:shadow-xl
                "
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : (
                                    <>Xác nhận thanh toán</>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Token sẽ được thêm vào tài khoản ngay lập tức sau khi thanh toán thành công
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
