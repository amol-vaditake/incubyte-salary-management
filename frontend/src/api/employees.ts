import { apiGet } from "./client"
import type { EmployeeFilters, PaginatedEmployees } from "@/types/employee"

export interface FetchEmployeesParams extends EmployeeFilters {
  page: number
  pageSize: number
}

export function fetchEmployees(params: FetchEmployeesParams): Promise<PaginatedEmployees> {
  const query = new URLSearchParams()
  query.set("page", String(params.page))
  query.set("pageSize", String(params.pageSize))
  if (params.country) query.set("country", params.country)
  if (params.department) query.set("department", params.department)
  if (params.status) query.set("status", params.status)

  return apiGet<PaginatedEmployees>(`/employees?${query.toString()}`)
}
