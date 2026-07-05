import { Link, Outlet } from "react-router-dom"

export function Layout() {
  return (
    <div>
      <nav className="flex gap-4 border-b p-4">
        <Link to="/" className="font-medium hover:underline">
          Employees
        </Link>
        <Link to="/analytics" className="font-medium hover:underline">
          Analytics
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
