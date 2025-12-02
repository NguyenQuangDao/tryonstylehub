'use client'

import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 max-w-md w-full text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công</h1>
        <p className="text-gray-600 mb-6">Token đã được cộng vào tài khoản của bạn.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700">Về Dashboard</Link>
          <Link href="/tokens" className="px-6 py-3 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200">Nạp thêm token</Link>
        </div>
      </div>
    </div>
  )
}

