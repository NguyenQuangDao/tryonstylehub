'use client'

import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Image from 'next/image'
import { useMemo, useState } from 'react'

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>('visa')

  const items = useMemo(
    () => [
      {
        id: 1,
        title: 'Classic Tee',
        price: 29.99,
        imageUrl: '/images/sample/product-1.jpg',
      },
      {
        id: 2,
        title: 'Denim Jacket',
        price: 79.0,
        imageUrl: '/images/sample/product-2.jpg',
      },
    ],
    []
  )

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price, 0), [items])
  const shipping = 6.99
  const total = useMemo(() => subtotal + shipping, [subtotal])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold tracking-tight">Shipping</h2>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" className="h-9" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" className="h-9" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St" className="h-9" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" className="h-9" />
              </div>
              <div className="col-span-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="CA" className="h-9" />
              </div>
              <div className="col-span-1">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" placeholder="90001" className="h-9" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="h-9" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="(555) 000-0000" className="h-9" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight">Payment</h2>
            <Separator className="my-4" />

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
              <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <label htmlFor="visa" className="flex items-center gap-3">
                  <RadioGroupItem id="visa" value="visa" />
                  <span className="text-sm font-medium">Visa</span>
                  <span className="text-xs text-muted-foreground">•••• 4242</span>
                </label>
              </div>
              <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <label htmlFor="mastercard" className="flex items-center gap-3">
                  <RadioGroupItem id="mastercard" value="mastercard" />
                  <span className="text-sm font-medium">Mastercard</span>
                  <span className="text-xs text-muted-foreground">•••• 4444</span>
                </label>
              </div>
              <div className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                <label htmlFor="cod" className="flex items-center gap-3">
                  <RadioGroupItem id="cod" value="cod" />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </label>
              </div>
            </RadioGroup>

            {paymentMethod !== 'cod' && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="h-9" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="MM/YY" className="h-9" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" className="h-9" />
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1 lg:sticky lg:top-4">
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="text-lg font-semibold tracking-tight">Order Summary</h3>
            <Separator className="my-3" />

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={40}
                        height={40}
                        className="size-10 object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{item.title}</div>
                    </div>
                  </div>
                  <div className="text-xs">${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Total</span>
              <span className="text-base font-bold">${total.toFixed(2)}</span>
            </div>

            <Button className="mt-4 h-10 w-full font-semibold">Checkout</Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

