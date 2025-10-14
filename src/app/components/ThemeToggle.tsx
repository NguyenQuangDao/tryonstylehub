'use client'

import { useTheme } from '@/lib/theme'
import { motion } from 'framer-motion'
import { Monitor, Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <button
      onClick={() => {
        const currentIndex = themes.findIndex(t => t.value === theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex].value)
      }}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to ${themes[(themes.findIndex(t => t.value === theme) + 1) % themes.length].label} theme`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <CurrentIcon className="h-5 w-5" />
      </motion.div>
    </button>
  )
}

