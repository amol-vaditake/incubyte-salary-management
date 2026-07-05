import { useEffect, useState } from "react"
import { fetchAnalyticsSummary } from "@/api/analytics"
import type { AnalyticsSummary } from "@/types/analytics"

interface UseAnalyticsSummaryResult {
  data: AnalyticsSummary | null
  isLoading: boolean
  error: string | null
}

export function useAnalyticsSummary(): UseAnalyticsSummaryResult {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchAnalyticsSummary()
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
  }, [])

  return { data, isLoading, error }
}
