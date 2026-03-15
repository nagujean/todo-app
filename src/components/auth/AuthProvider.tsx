'use client'

import React, { useEffect, useSyncExternalStore } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setupAuthListener, useAuthStore } from '@/store/authStore'
import { subscribeToTodos, unsubscribeFromTodos } from '@/store/todoStore'
import { subscribeToPresets, unsubscribeFromPresets } from '@/store/presetStore'
import { subscribeToTeams, unsubscribeFromTeams } from '@/store/teamStore'
import { isE2ETestMode } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface AuthProviderProps {
  children: React.ReactNode
}

// Subscribe function for useSyncExternalStore to detect client-side
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Use useSyncExternalStore to safely detect client vs server
  // This avoids hydration mismatches
  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const loading = useAuthStore((state) => state.loading)

  // Debug logging
  useEffect(() => {
    logger.debug('[AuthProvider] State:', { isClient, initialized, loading, hasUser: !!user })
  }, [isClient, initialized, loading, user])

  // Setup auth listener for non-E2E mode
  // The store already handles E2E mode at initialization time
  useEffect(() => {
    if (!isClient) return

    logger.debug('[AuthProvider] Setting up auth listener')
    const unsubscribe = setupAuthListener()
    return () => {
      logger.debug('[AuthProvider] Cleanup: Unsubscribing auth listener')
      unsubscribe()
    }
  }, [isClient]) // Only depend on isClient - setup once when client-side

  // Subscribe to Firestore when user logs in (skip in E2E mode)
  useEffect(() => {
    // Skip Firestore subscriptions in E2E mode
    if (isE2ETestMode()) {
      logger.debug('[AuthProvider] E2E mode - skipping Firestore subscriptions')
      return
    }

    if (user) {
      logger.debug('[AuthProvider] Subscribing to Firestore for user:', user.uid)
      subscribeToTodos(user.uid)
      subscribeToPresets(user.uid)
      subscribeToTeams(user.uid)
    } else {
      logger.debug('[AuthProvider] Unsubscribing from Firestore (no user)')
      unsubscribeFromTodos()
      unsubscribeFromPresets()
      unsubscribeFromTeams()
    }

    return () => {
      logger.debug('[AuthProvider] Cleanup: Unsubscribing from Firestore')
      unsubscribeFromTodos()
      unsubscribeFromPresets()
      unsubscribeFromTeams()
    }
  }, [user?.uid]) // Use user.uid as dependency instead of entire user object

  // Handle routing based on auth state
  useEffect(() => {
    if (!initialized) return

    const isAuthPage = pathname === '/login' || pathname === '/signup'

    if (!user && !isAuthPage) {
      router.push('/login')
    } else if (user && isAuthPage) {
      router.push('/')
    }
  }, [user, initialized, pathname, router])

  // Server-side: always show loading (safe default)
  // Client-side: check actual auth state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  // Client-side: show loading until initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  return <>{children}</>
}
