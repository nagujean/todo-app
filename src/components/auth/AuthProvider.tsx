'use client'

import React, { useEffect, useSyncExternalStore } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { setupAuthListener, useAuthStore } from '@/store/authStore'
import { subscribeToTodos, unsubscribeFromTodos } from '@/store/todoStore'
import { subscribeToPresets, unsubscribeFromPresets } from '@/store/presetStore'
import { subscribeToTeams, unsubscribeFromTeams } from '@/store/teamStore'

interface AuthProviderProps {
  children: React.ReactNode
}

// Subscribe function for useSyncExternalStore to detect client-side
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// Check if E2E test mode is enabled
function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') return true
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('e2e') === 'true') return true
  if (localStorage.getItem('E2E_TEST_MODE') === 'true') return true
  return false
}

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
    console.log('[AuthProvider] State:', { isClient, initialized, loading, hasUser: !!user })
  }, [isClient, initialized, loading, user])

  // Setup auth listener for non-E2E mode
  // The store already handles E2E mode at initialization time
  useEffect(() => {
    if (!isClient) return

    // If already initialized (E2E mode sets this at store creation), skip setup
    if (initialized && user) {
      console.log('[AuthProvider] Already initialized with user, skipping auth setup')
      return
    }

    console.log('[AuthProvider] Setting up auth listener')
    const unsubscribe = setupAuthListener()
    return () => unsubscribe()
  }, [isClient, initialized, user])

  // Subscribe to Firestore when user logs in (skip in E2E mode)
  useEffect(() => {
    // Skip Firestore subscriptions in E2E mode
    if (isE2ETestMode()) {
      console.log('[AuthProvider] E2E mode - skipping Firestore subscriptions')
      return
    }

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
