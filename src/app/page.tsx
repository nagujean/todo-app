'use client'

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

export default function Home() {
  const viewMode = useTodoStore((state) => state.viewMode)
  const user = useAuthStore((state) => state.user)
  const currentTeam = useTeamStore((state) => state.currentTeam)

  if (!user) {
    return null
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
