import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import type { ReactElement } from "react"
import { EmployeesPage } from "./EmployeesPage"
import type { PaginatedEmployees, Employee } from "@/types/employee"

function renderWithRouter(ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/employees/:id" element={<div>Employee Detail Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function buildEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "11111111-1111-1111-1111-111111111111",
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
    ...overrides,
  }
}

function buildResponse(overrides: Partial<PaginatedEmployees> = {}): PaginatedEmployees {
  return {
    data: [buildEmployee()],
    pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    ...overrides,
  }
}

function mockFetchResponses(...responses: unknown[]) {
  const fetchMock = vi.fn()
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
    })
  }
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(buildResponse()),
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("EmployeesPage", () => {
  it("renders employee rows from mock API data", async () => {
    mockFetchResponses(
      buildResponse({
        data: [
          buildEmployee({ employeeCode: "EMP-00001", firstName: "Asha", lastName: "Rao" }),
          buildEmployee({
            id: "22222222-2222-2222-2222-222222222222",
            employeeCode: "EMP-00002",
            firstName: "Ben",
            lastName: "Clarke",
            country: "UK",
            department: "Sales",
            currency: "GBP",
            salaryAmount: 55_000,
          }),
        ],
        pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      })
    )

    renderWithRouter(<EmployeesPage />)

    expect(await screen.findByText("EMP-00001")).toBeInTheDocument()
    expect(screen.getByText("Asha Rao")).toBeInTheDocument()
    expect(screen.getByText("EMP-00002")).toBeInTheDocument()
    expect(screen.getByText("Ben Clarke")).toBeInTheDocument()
  })

  it("shows a loading state before the data arrives, then renders the table", async () => {
    let resolveFetch!: (value: unknown) => void
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValueOnce(pending)
    )

    renderWithRouter(<EmployeesPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolveFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve(buildResponse()),
    })

    expect(await screen.findByText("EMP-00001")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it("shows an error state when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal server error" }),
      })
    )

    renderWithRouter(<EmployeesPage />)

    expect(await screen.findByText(/failed to load employees/i)).toBeInTheDocument()
  })

  it("selecting a country filter triggers a new fetch scoped to that country and resets to page 1", async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchResponses(buildResponse(), buildResponse())

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("combobox", { name: /country/i }))
    await user.click(await screen.findByRole("option", { name: "India" }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const secondCallUrl = fetchMock.mock.calls[1]![0] as string
    expect(secondCallUrl).toContain("country=India")
    expect(secondCallUrl).toContain("page=1")
  })

  it("clicking next page triggers a fetch for page 2", async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetchResponses(
      buildResponse({ pagination: { page: 1, pageSize: 20, total: 40, totalPages: 2 } }),
      buildResponse({ pagination: { page: 2, pageSize: 20, total: 40, totalPages: 2 } })
    )

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("button", { name: /go to next page/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const secondCallUrl = fetchMock.mock.calls[1]![0] as string
    expect(secondCallUrl).toContain("page=2")
  })

  it("clicking an employee row navigates to /employees/:id", async () => {
    const user = userEvent.setup()
    mockFetchResponses(
      buildResponse({ data: [buildEmployee({ id: "abc-123", employeeCode: "EMP-00001" })] })
    )

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByText("EMP-00001"))

    expect(await screen.findByText("Employee Detail Page")).toBeInTheDocument()
  })
})
