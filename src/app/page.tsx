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
import { isE2ETestMode } from '@/lib/utils'

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
      <main className={`mx-auto w-full ${viewMode === 'calendar' ? 'md:max-w-4xl' : 'md:max-w-xl'}`}>
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-between">
              <div className="flex items-center gap-2 order-1">
                <ThemeToggle />
                <TeamSwitcher />
              </div>
              <CardTitle className="text-xl md:text-2xl font-semibold truncate text-center md:text-left w-full md:w-auto md:max-w-[200px] order-3 md:order-2">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 order-2 md:order-3">
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
