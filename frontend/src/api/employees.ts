import { apiGet, apiPatch, apiPost } from "./client"
import type {
  CreateEmployeeInput,
  EmployeeDetail,
  EmployeeFilters,
  PaginatedEmployees,
  UpdateSalaryInput,
} from "@/types/employee"

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

export function fetchEmployeeById(id: string): Promise<EmployeeDetail> {
  return apiGet<EmployeeDetail>(`/employees/${id}`)
}

export function createEmployee(input: CreateEmployeeInput): Promise<EmployeeDetail> {
  return apiPost<EmployeeDetail>("/employees", input)
}

export function updateEmployeeSalary(
  id: string,
  input: UpdateSalaryInput
): Promise<EmployeeDetail> {
  return apiPatch<EmployeeDetail>(`/employees/${id}/salary`, input)
}
