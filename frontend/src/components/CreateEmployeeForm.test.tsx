import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { CreateEmployeeForm } from "./CreateEmployeeForm"
import type { EmployeeDetail } from "@/types/employee"
import type { EmployeeOptions } from "@/types/options"

const DEFAULT_OPTIONS: EmployeeOptions = {
  countries: ["India", "USA", "UK", "Germany", "Canada"],
  departments: ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"],
  levels: ["Junior", "Mid", "Senior", "Lead"],
}

function buildCreatedEmployee(): EmployeeDetail {
  return {
    id: "new-id",
    employeeCode: "EMP-10002",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@example.com",
    country: "India",
    department: "Engineering",
    roleTitle: "Senior Engineer",
    level: "Senior",
    currency: "INR",
    salaryAmount: 1_800_000,
    hireDate: "2026-07-01",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    salaryHistory: [],
  }
}

interface MockFetchConfig {
  options?: EmployeeOptions
  postResponse?: { ok: boolean; status: number; body: unknown }
}

// URL/method-aware fetch mock: the form now fetches GET /employees/options
// on mount (from the real, database-backed endpoint) in addition to the
// POST /employees on submit, so a simple ordered mockResolvedValueOnce
// chain no longer reflects what actually happens.
function mockFetch({ options = DEFAULT_OPTIONS, postResponse }: MockFetchConfig = {}) {
  const fetchMock = vi.fn((_url: string, init?: { method?: string }) => {
    if (init?.method === "POST") {
      return Promise.resolve({
        ok: postResponse?.ok ?? true,
        status: postResponse?.status ?? 201,
        json: () => Promise.resolve(postResponse?.body ?? buildCreatedEmployee()),
      })
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(options),
    })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

function findPostCall(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.find(
    (call) => (call[1] as { method?: string } | undefined)?.method === "POST"
  )!
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), "Priya")
  await user.type(screen.getByLabelText(/last name/i), "Nair")
  await user.type(screen.getByLabelText(/email/i), "priya.nair@example.com")
  await user.click(screen.getByRole("combobox", { name: /country/i }))
  await user.click(await screen.findByRole("option", { name: "India" }))
  await user.click(screen.getByRole("combobox", { name: /department/i }))
  await user.click(await screen.findByRole("option", { name: "Engineering" }))
  await user.type(screen.getByLabelText(/role title/i), "Senior Engineer")
  await user.click(screen.getByRole("combobox", { name: /level/i }))
  await user.click(await screen.findByRole("option", { name: "Senior" }))
  await user.click(screen.getByRole("combobox", { name: /currency/i }))
  await user.click(await screen.findByRole("option", { name: "INR" }))
  await user.type(screen.getByLabelText(/salary/i), "1800000")
  await user.type(screen.getByLabelText(/hire date/i), "2026-07-01")
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("CreateEmployeeForm", () => {
  it("sources department/country/level options from GET /employees/options, not a hardcoded list", async () => {
    const user = userEvent.setup()
    // Deliberately different from the array that used to be hardcoded in
    // this component: includes a department that array never had ("Legal")
    // and omits one it always had ("Marketing"). If this component ever
    // reverts to a hardcoded list independent of the fetched data, this
    // test fails - which is exactly the bug class being fixed here.
    mockFetch({
      options: {
        countries: ["Freedonia"],
        departments: ["Legal"],
        levels: ["Staff"],
      },
    })

    render(<CreateEmployeeForm onSuccess={vi.fn()} />)

    await user.click(screen.getByRole("combobox", { name: /country/i }))
    expect(await screen.findByRole("option", { name: "Freedonia" })).toBeInTheDocument()
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("combobox", { name: /department/i }))
    expect(await screen.findByRole("option", { name: "Legal" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Marketing" })).not.toBeInTheDocument()
    await user.keyboard("{Escape}")

    await user.click(screen.getByRole("combobox", { name: /level/i }))
    expect(await screen.findByRole("option", { name: "Staff" })).toBeInTheDocument()
  })

  it("shows validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch()
    const onSuccess = vi.fn()

    render(<CreateEmployeeForm onSuccess={onSuccess} />)

    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "POST")).toBe(false)
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup()
    mockFetch()

    render(<CreateEmployeeForm onSuccess={vi.fn()} />)

    await user.type(screen.getByLabelText(/first name/i), "Priya")
    await user.type(screen.getByLabelText(/email/i), "not-an-email")
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it("submits successfully and calls onSuccess with the created employee", async () => {
    const user = userEvent.setup()
    const created = buildCreatedEmployee()
    const fetchMock = mockFetch({ postResponse: { ok: true, status: 201, body: created } })
    const onSuccess = vi.fn()

    render(<CreateEmployeeForm onSuccess={onSuccess} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(created))

    const [url, init] = findPostCall(fetchMock)
    expect(url).toContain("/employees")
    expect(init.method).toBe("POST")
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      firstName: "Priya",
      lastName: "Nair",
      email: "priya.nair@example.com",
      country: "India",
      department: "Engineering",
      roleTitle: "Senior Engineer",
      level: "Senior",
      currency: "INR",
      salaryAmount: 1_800_000,
      hireDate: "2026-07-01",
    })
  })

  it("shows the backend's error message on a 409 duplicate-email response", async () => {
    const user = userEvent.setup()
    mockFetch({
      postResponse: {
        ok: false,
        status: 409,
        body: { error: "An employee with this email already exists" },
      },
    })
    const onSuccess = vi.fn()

    render(<CreateEmployeeForm onSuccess={onSuccess} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(
      await screen.findByText(/an employee with this email already exists/i)
    ).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("shows the backend's error message on a 400 response", async () => {
    const user = userEvent.setup()
    mockFetch({
      postResponse: {
        ok: false,
        status: 400,
        body: { error: "salaryAmount must be a positive number" },
      },
    })

    render(<CreateEmployeeForm onSuccess={vi.fn()} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(
      await screen.findByText(/salaryAmount must be a positive number/i)
    ).toBeInTheDocument()
  })
})
