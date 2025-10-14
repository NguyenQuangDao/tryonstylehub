'use client'

import { useTheme } from '@/lib/theme'
import { testDarkMode } from '@/lib/theme-utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Monitor, Moon, Sun } from 'lucide-react'
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
    { value: 'system' as const, icon: Monitor, label: 'Tự động', description: 'Theo hệ thống' },
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
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
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 shadow-md hover:shadow-lg group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chuyển đổi theme"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-10"
        >
          <CurrentIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </motion.div>

        {/* Active indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-open-sans">
                  Chọn Theme
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">
                  Chọn chế độ hiển thị phù hợp
                </p>
              </div>

              {/* Theme Options */}
              <div className="p-2">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon
                  const isActive = theme === themeOption.value
                  
                  return (
                    <motion.button
                      key={themeOption.value}
                      onClick={() => handleThemeChange(themeOption.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`p-1.5 rounded-lg ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className={`text-sm font-medium font-open-sans ${
                          isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {themeOption.label}
                        </div>
                        <div className={`text-xs font-open-sans ${
                          isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {themeOption.description}
                        </div>
                      </div>

                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center font-open-sans">
                  Theme hiện tại: <span className="font-semibold text-gray-700 dark:text-gray-300">{currentTheme.label}</span>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

