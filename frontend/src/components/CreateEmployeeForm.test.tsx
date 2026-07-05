import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { CreateEmployeeForm } from "./CreateEmployeeForm"
import type { EmployeeDetail } from "@/types/employee"

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
  it("shows validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const onSuccess = vi.fn()

    render(<CreateEmployeeForm onSuccess={onSuccess} />)

    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("fetch", vi.fn())

    render(<CreateEmployeeForm onSuccess={vi.fn()} />)

    await user.type(screen.getByLabelText(/first name/i), "Priya")
    await user.type(screen.getByLabelText(/email/i), "not-an-email")
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it("submits successfully and calls onSuccess with the created employee", async () => {
    const user = userEvent.setup()
    const created = buildCreatedEmployee()
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(created),
    })
    vi.stubGlobal("fetch", fetchMock)
    const onSuccess = vi.fn()

    render(<CreateEmployeeForm onSuccess={onSuccess} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(created))

    const [url, init] = fetchMock.mock.calls[0]!
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
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: "An employee with this email already exists" }),
      })
    )
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
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "salaryAmount must be a positive number" }),
      })
    )

    render(<CreateEmployeeForm onSuccess={vi.fn()} />)
    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /create employee/i }))

    expect(
      await screen.findByText(/salaryAmount must be a positive number/i)
    ).toBeInTheDocument()
  })
})
