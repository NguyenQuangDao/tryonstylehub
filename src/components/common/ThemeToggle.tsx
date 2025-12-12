'use client'

import { useTheme } from '@/lib/theme'
import { testDarkMode } from '@/lib/theme-utils'
import { Moon, Sun, Laptop } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-2 w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
  }

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Sáng', description: 'Chế độ sáng' },
    { value: 'dark' as const, icon: Moon, label: 'Tối', description: 'Chế độ tối' },
    { value: 'system' as const, icon: Laptop, label: 'Hệ thống', description: 'Theo hệ thống' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const CurrentIcon = currentTheme.icon

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme)
    setShowDropdown(false)
    
    // Test dark mode after change
    setTimeout(() => {
      testDarkMode()
    }, 100)
  }

  return (
    <div className="relative">
      {/* Main Toggle Button */}
     

      
    </div>
  )
}

