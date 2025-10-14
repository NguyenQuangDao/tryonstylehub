type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme-preference'

export function getThemePreference(): Theme {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(THEME_KEY) as Theme | null
  return saved || 'system'
}

export function setThemePreference(theme: Theme): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

