'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { applyTheme, getThemePreference, setThemePreference } from './theme-utils'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = getThemePreference()
    setThemeState(savedTheme)
    applyTheme(savedTheme)
    
    const updateResolvedTheme = () => {
      const currentTheme = theme || savedTheme
      const isDark = currentTheme === 'dark' || 
        (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      setResolvedTheme(isDark ? 'dark' : 'light')
    }
    
    updateResolvedTheme()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateResolvedTheme)
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setThemePreference(newTheme)
    
    // Apply theme immediately
    applyTheme(newTheme)
    
    // Update resolved theme
    const isDark = newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setResolvedTheme(isDark ? 'dark' : 'light')
    
    // Force a small delay to ensure DOM updates  
    setTimeout(() => {
      applyTheme(newTheme)
    }, 10)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

