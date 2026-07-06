import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import type { ReactElement } from "react"
import { EmployeesPage } from "./EmployeesPage"
import type { PaginatedEmployees, Employee } from "@/types/employee"
import type { EmployeeOptions } from "@/types/options"

const DEFAULT_OPTIONS: EmployeeOptions = {
  countries: ["India", "USA", "UK", "Germany", "Canada"],
  departments: ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"],
  levels: ["Junior", "Mid", "Senior", "Lead"],
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-search">{location.search}</div>
}

function renderWithRouter(ui: ReactElement, initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<>{ui}<LocationDisplay /></>} />
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

// URL-aware: EmployeesPage fetches GET /employees/options (filter/create
// dropdown values) independently of GET /employees (the paginated list).
// listResponder is called once per list request, in order; the options
// endpoint always serves `options` and never counts against that queue.
function mockFetch({
  options = DEFAULT_OPTIONS,
  listResponder,
}: {
  options?: EmployeeOptions
  listResponder: (callIndex: number) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>
}) {
  let listCallIndex = 0
  const fetchMock = vi.fn((url: string) => {
    if (url.includes("/employees/options")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(options),
      })
    }
    const result = listResponder(listCallIndex)
    listCallIndex++
    return result
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function okJson(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) })
}

function listCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter((call) => !(call[0] as string).includes("/options"))
}

beforeEach(() => {
  mockFetch({ listResponder: () => okJson(buildResponse()) })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("EmployeesPage", () => {
  it("sources Country and Department filter options from GET /employees/options, not a hardcoded list", async () => {
    const user = userEvent.setup()
    // Deliberately different from the array that used to be hardcoded in
    // this component: includes a country/department never in that array
    // and omits ones that always were. If this component ever reverts to
    // a hardcoded list independent of the fetched data, this test fails.
    mockFetch({
      options: { countries: ["Freedonia"], departments: ["Legal"], levels: ["Staff"] },
      listResponder: () => okJson(buildResponse()),
    })

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("combobox", { name: /country/i }))
    expect(await screen.findByRole("option", { name: "Freedonia" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "India" })).not.toBeInTheDocument()
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("combobox", { name: /department/i }))
    expect(await screen.findByRole("option", { name: "Legal" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Marketing" })).not.toBeInTheDocument()
  })

  it("renders employee rows from mock API data", async () => {
    mockFetch({
      listResponder: () =>
        okJson(
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
        ),
    })

    renderWithRouter(<EmployeesPage />)

    expect(await screen.findByText("EMP-00001")).toBeInTheDocument()
    expect(screen.getByText("Asha Rao")).toBeInTheDocument()
    expect(screen.getByText("EMP-00002")).toBeInTheDocument()
    expect(screen.getByText("Ben Clarke")).toBeInTheDocument()
  })

  it("shows a loading state before the data arrives, then renders the table", async () => {
    let resolveFetch!: (value: { ok: boolean; status: number; json: () => Promise<unknown> }) => void
    const pending = new Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>(
      (resolve) => {
        resolveFetch = resolve
      }
    )
    mockFetch({ listResponder: () => pending })

    renderWithRouter(<EmployeesPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    resolveFetch({ ok: true, status: 200, json: () => Promise.resolve(buildResponse()) })

    expect(await screen.findByText("EMP-00001")).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it("shows an error state when the request fails", async () => {
    mockFetch({
      listResponder: () =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal server error" }),
        }),
    })

    renderWithRouter(<EmployeesPage />)

    expect(await screen.findByText(/failed to load employees/i)).toBeInTheDocument()
  })

  it("selecting a country filter triggers a new fetch scoped to that country and resets to page 1", async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch({ listResponder: () => okJson(buildResponse()) })

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("combobox", { name: /country/i }))
    await user.click(await screen.findByRole("option", { name: "India" }))

    await waitFor(() => expect(listCalls(fetchMock)).toHaveLength(2))
    const secondCallUrl = listCalls(fetchMock)[1]![0] as string
    expect(secondCallUrl).toContain("country=India")
    expect(secondCallUrl).toContain("page=1")
  })

  it("clicking next page triggers a fetch for page 2", async () => {
    const user = userEvent.setup()
    let callIndex = 0
    const fetchMock = mockFetch({
      listResponder: () => {
        const response =
          callIndex === 0
            ? buildResponse({ pagination: { page: 1, pageSize: 20, total: 40, totalPages: 2 } })
            : buildResponse({ pagination: { page: 2, pageSize: 20, total: 40, totalPages: 2 } })
        callIndex++
        return okJson(response)
      },
    })

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("button", { name: /go to next page/i }))

    await waitFor(() => expect(listCalls(fetchMock)).toHaveLength(2))
    const secondCallUrl = listCalls(fetchMock)[1]![0] as string
    expect(secondCallUrl).toContain("page=2")
  })

  it("clicking an employee row navigates to /employees/:id", async () => {
    const user = userEvent.setup()
    mockFetch({
      listResponder: () =>
        okJson(buildResponse({ data: [buildEmployee({ id: "abc-123", employeeCode: "EMP-00001" })] })),
    })

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByText("EMP-00001"))

    expect(await screen.findByText("Employee Detail Page")).toBeInTheDocument()
  })

  it("loading the page with ?page=3&country=India in the URL renders that state correctly", async () => {
    const fetchMock = mockFetch({
      listResponder: () =>
        okJson(buildResponse({ pagination: { page: 3, pageSize: 20, total: 100, totalPages: 5 } })),
    })

    renderWithRouter(<EmployeesPage />, "/?page=3&country=India")
    await screen.findByText("EMP-00001")

    const requestedUrl = listCalls(fetchMock)[0]![0] as string
    expect(requestedUrl).toContain("page=3")
    expect(requestedUrl).toContain("country=India")
    expect(screen.getByRole("combobox", { name: /country/i })).toHaveTextContent("India")
    expect(screen.getByText(/page 3 of 5/i)).toBeInTheDocument()
  })

  it("selecting a filter updates the URL, so refreshing preserves it", async () => {
    const user = userEvent.setup()
    mockFetch({ listResponder: () => okJson(buildResponse()) })

    renderWithRouter(<EmployeesPage />)
    await screen.findByText("EMP-00001")

    await user.click(screen.getByRole("combobox", { name: /country/i }))
    await user.click(await screen.findByRole("option", { name: "India" }))

    await waitFor(() =>
      expect(screen.getByTestId("location-search").textContent).toContain("country=India")
    )
    expect(screen.getByTestId("location-search").textContent).toContain("page=1")
  })
})
