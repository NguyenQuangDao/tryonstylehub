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
  const body = document.body
  
  // Determine if dark mode should be active
  const isDark = theme === 'dark' || 
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  // Remove all theme classes first
  root.classList.remove('light', 'dark')
  body.classList.remove('light', 'dark')
  
  // Add the appropriate class
  if (theme === 'light') {
    root.classList.add('light')
    body.classList.add('light')
  } else if (theme === 'dark') {
    root.classList.add('dark')
    body.classList.add('dark')
  } else {
    // System theme
    if (isDark) {
      root.classList.add('dark')
      body.classList.add('dark')
    } else {
      root.classList.add('light')
      body.classList.add('light')
    }
  }
  
  // Force a repaint to ensure theme is applied immediately
  root.style.colorScheme = isDark ? 'dark' : 'light'
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#000000' : '#FFFFFF')
  }
  
  // Theme applied
}

// Test function to verify dark mode
export function testDarkMode(): void {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  const body = document.body
  
  // Dark mode test completed
}

