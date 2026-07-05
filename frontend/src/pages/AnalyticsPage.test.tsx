import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { AnalyticsPage } from "./AnalyticsPage"
import type { AnalyticsSummary } from "@/types/analytics"

function buildSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    averageSalaryByDepartment: [
      { department: "Engineering", currency: "INR", averageSalary: 1_200_000, count: 100 },
      { department: "Engineering", currency: "USD", averageSalary: 110_000, count: 80 },
      { department: "Sales", currency: "INR", averageSalary: 900_000, count: 50 },
    ],
    averageSalaryByCountry: [
      { country: "India", currency: "INR", averageSalary: 1_100_000, count: 300 },
      { country: "USA", currency: "USD", averageSalary: 105_000, count: 250 },
    ],
    headcountByDepartment: [
      { department: "Engineering", count: 180 },
      { department: "Sales", count: 90 },
    ],
    headcountByLevel: [
      { level: "Junior", count: 120 },
      { level: "Mid", count: 95 },
      { level: "Senior", count: 45 },
      { level: "Lead", count: 15 },
    ],
    ...overrides,
  }
}

function mockFetchOnce(response: unknown, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(response),
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("AnalyticsPage", () => {
  it("renders average salary by department, grouped by currency, as a table", async () => {
    mockFetchOnce(buildSummary())

    render(<AnalyticsPage />)

    await screen.findByText("INR 1,200,000")
    expect(screen.getByText("USD 110,000")).toBeInTheDocument()
    expect(screen.getByText("INR 900,000")).toBeInTheDocument()
  })

  it("renders average salary by country, grouped by currency, as a table", async () => {
    mockFetchOnce(buildSummary())

    render(<AnalyticsPage />)

    await screen.findByText("India")
    expect(screen.getByText("USA")).toBeInTheDocument()
    expect(screen.getByText("INR 1,100,000")).toBeInTheDocument()
    expect(screen.getByText("USD 105,000")).toBeInTheDocument()
  })

  it("renders headcount by department as a bar chart proportional to the max", async () => {
    mockFetchOnce(buildSummary())

    render(<AnalyticsPage />)

    const engineeringBar = await screen.findByTestId("bar-Engineering")
    const salesBar = await screen.findByTestId("bar-Sales")

    expect(engineeringBar).toHaveStyle({ width: "100%" })
    expect(salesBar).toHaveStyle({ width: "50%" })
    expect(screen.getByText("180")).toBeInTheDocument()
  })

  it("renders headcount by level as a bar chart proportional to the max", async () => {
    mockFetchOnce(buildSummary())

    render(<AnalyticsPage />)

    const juniorBar = await screen.findByTestId("bar-Junior")
    const leadBar = await screen.findByTestId("bar-Lead")

    expect(juniorBar).toHaveStyle({ width: "100%" })
    expect(leadBar).toHaveStyle({ width: "12.5%" })
  })

  it("shows a loading state before the data arrives", async () => {
    let resolveFetch!: (value: unknown) => void
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(pending))

    render(<AnalyticsPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolveFetch({ ok: true, status: 200, json: () => Promise.resolve(buildSummary()) })

    await screen.findByText("INR 1,200,000")
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it("shows an error state when the request fails", async () => {
    mockFetchOnce({ error: "Internal server error" }, false, 500)

    render(<AnalyticsPage />)

    expect(await screen.findByText(/failed to load analytics/i)).toBeInTheDocument()
  })
})
