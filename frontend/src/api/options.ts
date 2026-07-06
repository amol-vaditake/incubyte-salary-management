import { apiGet } from "./client"
import type { EmployeeOptions } from "@/types/options"

export function fetchEmployeeOptions(): Promise<EmployeeOptions> {
  return apiGet<EmployeeOptions>("/employees/options")
}
