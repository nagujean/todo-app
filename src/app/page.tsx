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
    <div className="min-h-screen bg-background px-4 sm:px-8 py-4 sm:py-8 overflow-visible">
      <main className={`mx-auto w-full px-0 md:px-4 overflow-visible ${viewMode === 'calendar' ? 'md:max-w-4xl' : 'md:max-w-2xl'}`}>
        <Card className="shadow-sm overflow-visible">
          <CardHeader className="pb-4 overflow-visible space-y-2">
            {/* 첫 번째 줄: 테마, 타이틀, 계정정보 */}
            <div className="flex items-center gap-1 sm:gap-2 justify-between overflow-visible">
              <ThemeToggle />
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold truncate text-center flex-1 min-w-0 px-1">
                {title}
              </CardTitle>
              <UserMenu />
            </div>
            {/* 두 번째 줄: 팀 선택, 뷰 토글 */}
            <div className="flex items-center gap-1 sm:gap-2 justify-between overflow-visible flex-wrap">
              <TeamSwitcher />
              <ViewToggle />
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
