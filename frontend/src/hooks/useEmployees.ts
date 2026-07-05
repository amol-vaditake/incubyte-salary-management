import { useEffect, useState } from "react"
import { fetchEmployees } from "@/api/employees"
import type { EmployeeFilters, PaginatedEmployees } from "@/types/employee"

interface UseEmployeesResult {
  data: PaginatedEmployees | null
  isLoading: boolean
  error: string | null
}

export function useEmployees(
  filters: EmployeeFilters,
  page: number,
  pageSize: number
): UseEmployeesResult {
  const [data, setData] = useState<PaginatedEmployees | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)

    fetchEmployees({ ...filters, page, pageSize })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Unknown error")
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters.country, filters.department, filters.status, page, pageSize])

  return { data, isLoading, error }
}
