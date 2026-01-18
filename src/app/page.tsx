import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TodoInput } from '@/components/todo/TodoInput'
import { TodoList } from '@/components/todo/TodoList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PresetList } from '@/components/preset/PresetList'

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <main className="mx-auto max-w-xl">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="w-10" />
              <CardTitle className="text-2xl font-semibold">
                할 일 목록
              </CardTitle>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TodoInput />
            <PresetList />
            <TodoList />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Made with Claude Code
        </p>
      </main>
    </div>
  )
}
