"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Bitcoin, Check, Coins, CreditCard, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [currentBalance, setCurrentBalance] = useState<number>(0)
    const [stripe, setStripe] = useState<Stripe | null>(null)
    const [elements, setElements] = useState<StripeElements | null>(null)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [showStripeForm, setShowStripeForm] = useState(false)
    const paymentElementId = 'stripe-payment-element'
    const paymentElementRef = useRef<any>(null)

    useEffect(() => {
        if (showStripeForm && elements && !paymentElementRef.current) {
            const container = document.getElementById(paymentElementId)
            if (container) {
                const pe = elements.create('payment')
                paymentElementRef.current = pe
                pe.mount(`#${paymentElementId}`)
            }
        }
    }, [showStripeForm, elements])

    useEffect(() => {
        return () => {
            if (paymentElementRef.current) {
                try {
                    paymentElementRef.current.unmount()
                } catch {}
                paymentElementRef.current = null
            }
        }
    }, [])

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
                const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
                if (!pk) {
                    setError('Thiếu NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY trong môi trường')
                    setProcessing(false)
                    return
                }
                const s = await loadStripe(pk)
                if (!s) {
                    setError('Không thể khởi tạo Stripe')
                    setProcessing(false)
                    return
                }
                setStripe(s)
                setClientSecret(data.clientSecret)
                const els = s.elements({ clientSecret: data.clientSecret })
                setElements(els)
                setShowStripeForm(true)
                setProcessing(false)
                return
            }

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
                                        <div className="text-xs text-muted-foreground ml-2">Credits</div>
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
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="text-sm font-medium mb-2">Payment Method</div>
                                <RadioGroup value={selectedPaymentMethod ?? ''} onValueChange={(val) => setSelectedPaymentMethod(val)} className="grid grid-cols-3 gap-2">
                                    {paymentMethods.map((m) => {
                                        const isSelected = selectedPaymentMethod === m.id
                                        const icon = m.name.toLowerCase().includes('paypal')
                                            ? <Wallet className="size-4" />
                                            : m.name.toLowerCase().includes('crypto')
                                            ? <Bitcoin className="size-4" />
                                            : <CreditCard className="size-4" />
                                        return (
                                            <label key={m.id} className={`h-9 px-3 border rounded-md flex items-center gap-2 cursor-pointer ${isSelected ? 'border-primary bg-primary/5 text-primary' : ''}`}>
                                                {icon}
                                                <span className="text-sm">{m.name}</span>
                                                <RadioGroupItem value={m.id} className="sr-only" />
                                            </label>
                                        )
                                    })}
                                </RadioGroup>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-base font-bold">
                                    Total: {(() => {
                                        const pkg = packages.find(p => p.id === selectedPackage)
                                        if (!pkg) return '$0.00'
                                        return pkg.currency === 'VND' ? `${pkg.price.toLocaleString('vi-VN')}₫` : `$${pkg.price.toFixed(2)}`
                                    })()}
                                </div>
                                <Button className="h-9 px-6" onClick={handlePurchase} disabled={processing || !selectedPackage || !selectedPaymentMethod}>
                                    {processing ? 'Processing...' : 'Confirm Payment'}
                                </Button>
                            </div>
                        </div>
                {showStripeForm && clientSecret && (
                    <div className="mt-4">
                        <Separator className="my-4" />
                        <div className="text-sm font-medium mb-2">Card Payment</div>
                        <div id={paymentElementId} className="mb-3" />
                        <Button className="w-full h-9" onClick={async () => {
                            if (!stripe || !elements) return
                            setProcessing(true)
                            setError(null)
                            const { error: stripeErr, paymentIntent } = await stripe.confirmPayment({
                                elements,
                                redirect: 'if_required',
                            })
                            if (stripeErr) {
                                setError(stripeErr.message || 'Payment confirmation failed')
                                setProcessing(false)
                                return
                            }
                            if (paymentIntent && paymentIntent.status === 'succeeded') {
                                const pkgId = selectedPackage
                                const res = await fetch('/api/tokens/confirm-stripe', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ paymentIntentId: paymentIntent.id, packageId: pkgId }),
                                })
                                const d = await res.json()
                                if (!res.ok || !d.success) {
                                    setError(d.error || 'Could not record transaction')
                                    setProcessing(false)
                                    return
                                }
                                setSuccess(true)
                                setCurrentBalance(d.data?.newBalance || currentBalance)
                                setProcessing(false)
                                setTimeout(() => {
                                    router.push('/success?purchase=success')
                                }, 1500)
                            } else {
                                setError('Payment not completed')
                                setProcessing(false)
                            }
                        }} disabled={processing}>
                            {processing ? 'Confirming...' : 'Pay'}
                        </Button>
                        <div className="text-xs text-muted-foreground mt-2">Test card: 4242 4242 4242 4242</div>
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    )
}
