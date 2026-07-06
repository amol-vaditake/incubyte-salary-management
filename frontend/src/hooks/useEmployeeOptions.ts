import { useEffect, useState } from "react"
import { fetchEmployeeOptions } from "@/api/options"
import type { EmployeeOptions } from "@/types/options"

const EMPTY_OPTIONS: EmployeeOptions = { countries: [], departments: [], levels: [] }

interface UseEmployeeOptionsResult {
  options: EmployeeOptions
  isLoading: boolean
  error: string | null
}

// Reference data (the actual distinct values in the database), fetched
// once per mount - shared by the create form and the list's filters so
// neither can drift from the other, or from what the database contains.
export function useEmployeeOptions(): UseEmployeeOptionsResult {
  const [options, setOptions] = useState<EmployeeOptions>(EMPTY_OPTIONS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchEmployeeOptions()
      .then((result) => {
        if (cancelled) return
        setOptions(result)
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
  }, [])

  return { options, isLoading, error }
}
