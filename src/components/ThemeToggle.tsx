'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/themeStore'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
