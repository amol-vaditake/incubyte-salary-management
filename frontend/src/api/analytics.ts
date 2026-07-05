import { apiGet } from "./client"
import type { AnalyticsSummary } from "@/types/analytics"

export function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  return apiGet<AnalyticsSummary>("/analytics/summary")
}
