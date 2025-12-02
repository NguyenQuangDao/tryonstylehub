'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RegisterShopForm from '@/components/forms/register-shop-form'

export default function RegisterShopPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Đăng ký shop</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterShopForm />
        </CardContent>
      </Card>
    </div>
  )
}

