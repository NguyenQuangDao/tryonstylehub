'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/seller-applications', label: 'Đơn người bán' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="rounded-3xl border bg-white/80 backdrop-blur-xl dark:bg-gray-900/60 shadow-sm">
              <div className="p-4">
                <div className="text-lg font-semibold mb-4">Quản trị</div>
                <nav className="space-y-1">
                  {nav.map((item) => (
                    <Link key={item.href} href={item.href} className={cn(
                      'block px-3 py-2 rounded-xl text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

