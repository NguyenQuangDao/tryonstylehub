"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Check, Coins } from 'lucide-react'
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
    const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'VND'>('USD')
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [blockingInit, setBlockingInit] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [currentBalance, setCurrentBalance] = useState<number>(0)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const payment = params.get('payment')
        const provider = params.get('provider')
        const tokenParam = params.get('token')
        if (payment === 'approved' && provider === 'paypal' && tokenParam) {
            setBlockingInit(true)
            ;(async () => {
                try {
                    setError(null)
                    const res = await fetch('/api/tokens/confirm-paypal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: tokenParam }),
                    })
                    const d = await res.json()
                    if (!res.ok || !d.success) {
                        throw new Error(d.error || 'Không thể xác thực thanh toán')
                    }
                    setSuccess(true)
                    setCurrentBalance(d.data?.newBalance || currentBalance)
                    const url = new URL(window.location.href)
                    url.searchParams.delete('payment')
                    url.searchParams.delete('provider')
                    url.searchParams.delete('token')
                    url.searchParams.delete('PayerID')
                    window.history.replaceState({}, document.title, url.toString())
                    setTimeout(() => {
                        router.push('/success?purchase=success')
                    }, 1500)
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
                } finally {
                    setBlockingInit(false)
                }
            })()
        }
    }, [])

    useEffect(() => {
        if (!blockingInit) fetchData()
    }, [blockingInit])

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
                const currencyMethods = methodsData.data.filter(
                    (m: PaymentMethod) => !m.currencies || m.currencies.includes(selectedCurrency)
                )
                const sortedMethods = reorderMethods(currencyMethods)
                setPaymentMethods(sortedMethods)
                if (sortedMethods.length > 0) {
                    setSelectedPaymentMethod(sortedMethods[0].id)
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
        const sortedMethods = reorderMethods(currencyMethods)
        setPaymentMethods(sortedMethods)

        // Reset selections
        setSelectedPackage(null)
        setSelectedPaymentMethod(sortedMethods.length > 0 ? sortedMethods[0].id : null)
    }

    const reorderMethods = (methods: PaymentMethod[]) => {
        const score = (name: string) => {
            const n = name.toLowerCase()
            if (n.includes('crypto')) return 0
            if (n.includes('paypal')) return 1
            return 2
        }
        return [...methods].sort((a, b) => score(a.name) - score(b.name))
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

            // PayPal Buttons handled below

            // Direct success (shouldn't happen with real payments)
            setSuccess(true)
            setCurrentBalance(data.data?.newBalance || currentBalance)

            setTimeout(() => {
                router.push('/success?purchase=success')
            }, 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
            console.error('Purchase error:', err)
        } finally {
            setProcessing(false)
        }
    }

    if (blockingInit) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Đang xác thực thanh toán PayPal...</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="text-xl font-semibold">Refill Balance</div>
                        <div className="text-sm text-muted-foreground">Choose a package to continue using AI features</div>
                    </div>
                    <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                        <Coins className="size-4 text-yellow-500" />
                        <div className="text-sm font-medium">Available: {currentBalance.toLocaleString()} Credits</div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-md px-3 py-2">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md px-3 py-2">
                        Payment succeeded. Credits added.
                    </div>
                )}

                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {packages.map((pkg) => {
                            const selected = selectedPackage === pkg.id
                            return (
                                <div
                                    key={pkg.id}
                                    onClick={() => setSelectedPackage(pkg.id)}
                                    className={`border border-border rounded-xl bg-card p-5 cursor-pointer transition-all ${selected ? 'border-primary bg-primary/5' : 'hover:bg-muted'} relative`}
                                >
                                    {pkg.featured && (
                                        <Badge className="absolute top-3 right-3 h-5 text-[10px] rounded-full" variant="default">Popular</Badge>
                                    )}
                                    <div className="flex items-baseline justify-between mb-3">
                                        <div className="text-2xl font-bold tracking-tight">{pkg.tokens}</div>
                                        <div className="text-sm text-muted-foreground ml-2">Credits</div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-lg font-semibold">
                                            {pkg.currency === 'VND' ? `${pkg.price.toLocaleString('vi-VN')}₫` : `$${pkg.price}`}
                                        </span>
                                        {pkg.savings && pkg.savings > 0 && (
                                            <span className="text-xs text-muted-foreground line-through ml-2">
                                                {pkg.currency === 'VND' ? `${(pkg.price * (100 + pkg.savings) / 100).toLocaleString('vi-VN')}₫` : `$${(pkg.price * (100 + pkg.savings) / 100).toFixed(2)}`}
                                            </span>
                                        )}
                                    </div>
                                    <Separator className="my-3" />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3" /> No expiry</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3" /> Priority support</div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3" /> Fast processing</div>
                                    </div>
                                    <div className="mt-4">
                                        <Button variant={selected ? 'default' : 'outline'} size="sm" className="w-full h-8" onClick={() => setSelectedPackage(pkg.id)}>
                                            {selected ? 'Selected' : 'Select'}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 mt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-base font-bold">
                                    Total: {(() => {
                                        const pkg = packages.find(p => p.id === selectedPackage)
                                        if (!pkg) return '$0.00'
                                        return pkg.currency === 'VND' ? `${pkg.price.toLocaleString('vi-VN')}₫` : `$${pkg.price.toFixed(2)}`
                                    })()}
                                </div>
                                <Button className="h-9 px-6" onClick={handlePurchase} disabled={processing || !selectedPackage || !selectedPaymentMethod}>
                                    {processing ? 'Processing...' : 'Confirm Payment with PayPal'}
                                </Button>
                            </div>
                        </div>
                {/* {selectedPaymentMethod === 'paypal' && selectedPackage && (
                    <div className="mt-4 w-full">
                        <Separator className="my-4" />
                        {!paypalReady && (
                            <div className="text-sm text-muted-foreground bg-muted/30 border rounded-md p-3 mb-3">
                                Thiếu cấu hình Sandbox: đặt `NEXT_PUBLIC_PAYPAL_CLIENT_ID` và `PAYPAL_CLIENT_ID` trong `.env`.
                            </div>
                        )}
                        {paypalReady && (
                          <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'USD', intent: 'capture' }}>
                            <PayPalButtons
                                style={{ layout: 'vertical' }}
                                createOrder={async () => {
                                    const res = await fetch('/api/tokens/purchase', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ packageId: selectedPackage, paymentMethodId: 'paypal' }),
                                    })
                                    const d = await res.json()
                                    if (!res.ok || !d.success) {
                                        setError(d.error || 'Không thể tạo đơn PayPal')
                                        throw new Error(d.error || 'createOrder failed')
                                    }
                                    if (d.requiresRedirect && d.paymentUrl) {
                                        window.location.href = d.paymentUrl
                                        return ''
                                    }
                                    return d.orderId || d.transactionId || ''
                                }}
                                onApprove={async (data) => {
                                    const orderId = data.orderID
                                    const res = await fetch('/api/tokens/confirm-paypal', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ orderId, packageId: selectedPackage }),
                                    })
                                    const d = await res.json()
                                    if (!res.ok || !d.success) {
                                        setError(d.error || 'Không thể ghi nhận giao dịch')
                                        return
                                    }
                                    setSuccess(true)
                                    setCurrentBalance(d.data?.newBalance || currentBalance)
                                    setTimeout(() => {
                                        router.push('/success?purchase=success')
                                    }, 1500)
                                }}
                                onError={(err) => {
                                    console.error(err)
                                    setError('Thanh toán PayPal lỗi')
                                }}
                            />
                          </PayPalScriptProvider>
                        )}
                    </div>
                )} */}
                    </div>
                </div>
            </div>
        </div>
    )
}
