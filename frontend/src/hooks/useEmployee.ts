import { useEffect, useState } from "react"
import { fetchEmployeeById } from "@/api/employees"
import { ApiError } from "@/api/client"
import type { EmployeeDetail } from "@/types/employee"

interface UseEmployeeResult {
  data: EmployeeDetail | null
  isLoading: boolean
  error: string | null
  notFound: boolean
}

export function useEmployee(id: string): UseEmployeeResult {
  const [data, setData] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError(null)
    setNotFound(false)

    fetchEmployeeById(id)
      .then((result) => {
        if (cancelled) return
        setData(result)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : "Unknown error")
        }
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { data, isLoading, error, notFound }
}
