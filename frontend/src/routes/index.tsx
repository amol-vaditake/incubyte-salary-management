import { createBrowserRouter } from "react-router-dom"
import { EmployeesPage } from "@/pages/EmployeesPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <EmployeesPage />,
  },
])
