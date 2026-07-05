import { Button } from "@/components/ui/button"
import { useUiStore } from "@/store/useUiStore"

export function DashboardPage() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Employee Salary Management System</h1>
      <p className="text-muted-foreground">Frontend scaffold - feature pages land next.</p>
      <Button onClick={toggleSidebar}>
        Sidebar is {sidebarOpen ? "open" : "closed"} (toggle)
      </Button>
    </div>
  )
}
