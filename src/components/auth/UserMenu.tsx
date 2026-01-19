'use client'

import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export function UserMenu() {
  const { user, logout, loading } = useAuthStore()

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Error is handled in the store
    }
  }

  const displayName = user.displayName || user.email?.split('@')[0] || '사용자'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={loading}
        title="로그아웃"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
