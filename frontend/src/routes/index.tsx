import { createBrowserRouter } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { EmployeesPage } from "@/pages/EmployeesPage"
import { EmployeeDetailPage } from "@/pages/EmployeeDetailPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <EmployeesPage /> },
      { path: "/employees/:id", element: <EmployeeDetailPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
    ],
  },
])
