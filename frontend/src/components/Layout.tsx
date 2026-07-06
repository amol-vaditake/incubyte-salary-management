import { NavLink, Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-8 py-3">
          <span className="font-heading text-base font-semibold tracking-tight">
            ACME <span className="text-muted-foreground font-normal">Salary Management</span>
          </span>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClassName}>
              Employees
            </NavLink>
            <NavLink to="/analytics" className={navLinkClassName}>
              Analytics
            </NavLink>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
