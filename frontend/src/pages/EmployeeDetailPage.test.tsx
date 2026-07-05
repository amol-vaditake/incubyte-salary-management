import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { EmployeeDetailPage } from "./EmployeeDetailPage"
import type { EmployeeDetail } from "@/types/employee"

const EMPLOYEE_ID = "11111111-1111-1111-1111-111111111111"

function buildEmployeeDetail(overrides: Partial<EmployeeDetail> = {}): EmployeeDetail {
  return {
    id: EMPLOYEE_ID,
    employeeCode: "EMP-00001",
    firstName: "Asha",
    lastName: "Rao",
    email: "asha.rao@example.com",
    country: "India",
    department: "Engineering",
    roleTitle: "Senior Engineer",
    level: "Senior",
    currency: "INR",
    salaryAmount: 1_800_000,
    hireDate: "2022-01-01",
    status: "active",
    createdAt: "2022-01-01T00:00:00.000Z",
    updatedAt: "2022-01-01T00:00:00.000Z",
    salaryHistory: [
      {
        id: "h1",
        employeeId: EMPLOYEE_ID,
        salaryAmount: 1_000_000,
        currency: "INR",
        effectiveDate: "2022-01-01",
        reason: "Initial hire",
        createdAt: "2022-01-01T00:00:00.000Z",
      },
    ],
    ...overrides,
  }
}

function renderDetailPage() {
  return render(
    <MemoryRouter initialEntries={[`/employees/${EMPLOYEE_ID}`]}>
      <Routes>
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
      </Routes>
    </MemoryRouter>
  )
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

describe("EmployeeDetailPage", () => {
  it("renders employee details and salary history ordered oldest to newest", async () => {
    mockFetchOnce(
      buildEmployeeDetail({
        salaryHistory: [
          {
            id: "h1",
            employeeId: EMPLOYEE_ID,
            salaryAmount: 1_000_000,
            currency: "INR",
            effectiveDate: "2022-01-01",
            reason: "Initial hire",
            createdAt: "2022-01-01T00:00:00.000Z",
          },
          {
            id: "h2",
            employeeId: EMPLOYEE_ID,
            salaryAmount: 1_200_000,
            currency: "INR",
            effectiveDate: "2023-06-01",
            reason: "Promotion",
            createdAt: "2023-06-01T00:00:00.000Z",
          },
        ],
      })
    )

    renderDetailPage()

    expect(await screen.findByText("Asha Rao")).toBeInTheDocument()
    expect(screen.getByText("EMP-00001")).toBeInTheDocument()
    expect(screen.getByText("India")).toBeInTheDocument()
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument()

    const reasonCells = screen.getAllByText(/Initial hire|Promotion/)
    expect(reasonCells.map((el) => el.textContent)).toEqual(["Initial hire", "Promotion"])
  })

  it("shows a loading state before the data arrives", async () => {
    let resolveFetch!: (value: unknown) => void
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(pending))

    renderDetailPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolveFetch({ ok: true, status: 200, json: () => Promise.resolve(buildEmployeeDetail()) })

    expect(await screen.findByText("Asha Rao")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it("shows an error state when the request fails with a non-404 status", async () => {
    mockFetchOnce({ error: "Internal server error" }, false, 500)

    renderDetailPage()

    expect(await screen.findByText(/failed to load employee/i)).toBeInTheDocument()
  })

  it("shows a not-found state on a 404", async () => {
    mockFetchOnce({ error: "Employee not found" }, false, 404)

    renderDetailPage()

    expect(await screen.findByText(/employee not found/i)).toBeInTheDocument()
  })
})
