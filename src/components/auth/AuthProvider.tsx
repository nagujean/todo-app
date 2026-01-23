'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setupAuthListener, useAuthStore } from '@/store/authStore'
import { subscribeToTodos, unsubscribeFromTodos } from '@/store/todoStore'
import { subscribeToPresets, unsubscribeFromPresets } from '@/store/presetStore'
import { subscribeToTeams, unsubscribeFromTeams } from '@/store/teamStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, initialized, loading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = setupAuthListener()
    return () => unsubscribe()
  }, [])

  // Subscribe to Firestore when user logs in
  useEffect(() => {
    if (user) {
      subscribeToTodos(user.uid)
      subscribeToPresets(user.uid)
      subscribeToTeams(user.uid)
    } else {
      unsubscribeFromTodos()
      unsubscribeFromPresets()
      unsubscribeFromTeams()
    }

    return () => {
      unsubscribeFromTodos()
      unsubscribeFromPresets()
      unsubscribeFromTeams()
    }
  }, [user])

  useEffect(() => {
    if (!initialized) return

    const isAuthPage = pathname === '/login' || pathname === '/signup'

    if (!user && !isAuthPage) {
      router.push('/login')
    } else if (user && isAuthPage) {
      router.push('/')
    }
  }, [user, initialized, pathname, router])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return <>{children}</>
}
