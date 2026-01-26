'use client'

import { useSyncExternalStore } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TodoInput } from '@/components/todo/TodoInput'
import { TodoList } from '@/components/todo/TodoList'
import { CalendarView } from '@/components/calendar/CalendarView'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ViewToggle } from '@/components/ViewToggle'
import { PresetList } from '@/components/preset/PresetList'
import { UserMenu } from '@/components/auth/UserMenu'
import { TeamSwitcher } from '@/components/team'
import { useTodoStore } from '@/store/todoStore'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'

// Check if E2E test mode is enabled (client-side only)
function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('e2e') === 'true') return true
  if (localStorage.getItem('E2E_TEST_MODE') === 'true') return true
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') return true
  return false
}

// Custom hook for client-side hydration state
function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function Home() {
  // Track client readiness using useSyncExternalStore to avoid hydration mismatch
  const clientReady = useClientReady()
  // Check E2E mode only on client side after hydration
  const isE2E = clientReady && isE2ETestMode()

  const viewMode = useTodoStore((state) => state.viewMode)
  const user = useAuthStore((state) => state.user)
  const initialized = useAuthStore((state) => state.initialized)
  const currentTeam = useTeamStore((state) => state.currentTeam)

  // Wait for client-side initialization
  if (!clientReady) {
    return null
  }

  // In E2E mode, skip auth checks and render immediately
  if (!isE2E) {
    // Wait for auth to initialize before rendering
    if (!initialized) {
      return null
    }

    // If user is not logged in after initialization, AuthProvider will redirect to /login
    if (!user) {
      return null
    }
  }

  const title = currentTeam ? currentTeam.name : '할 일 목록'

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <main className={`mx-auto ${viewMode === 'calendar' ? 'max-w-4xl' : 'max-w-xl'}`}>
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <TeamSwitcher />
              </div>
              <CardTitle className="text-2xl font-semibold truncate max-w-[200px]">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <ViewToggle />
                <UserMenu />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TodoInput />
            <PresetList />
            {viewMode === 'list' ? <TodoList /> : <CalendarView />}
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Made with Claude Code
        </p>
      </main>
    </div>
  )
}
