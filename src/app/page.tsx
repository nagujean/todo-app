import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TodoInput } from '@/components/todo/TodoInput'
import { TodoList } from '@/components/todo/TodoList'

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <main className="mx-auto max-w-xl">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-center">
              할 일 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TodoInput />
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
