import { createBrowserRouter } from "react-router-dom"
import { EmployeesPage } from "@/pages/EmployeesPage"
import { EmployeeDetailPage } from "@/pages/EmployeeDetailPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <EmployeesPage />,
  },
  {
    path: "/employees/:id",
    element: <EmployeeDetailPage />,
  },
])
