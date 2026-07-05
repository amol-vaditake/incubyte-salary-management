import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { UpdateSalaryForm } from "./UpdateSalaryForm"
import type { EmployeeDetail } from "@/types/employee"

const EMPLOYEE_ID = "11111111-1111-1111-1111-111111111111"

function buildUpdatedEmployee(): EmployeeDetail {
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
    salaryAmount: 2_000_000,
    hireDate: "2022-01-01",
    status: "active",
    createdAt: "2022-01-01T00:00:00.000Z",
    updatedAt: "2026-07-06T00:00:00.000Z",
    salaryHistory: [],
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("UpdateSalaryForm", () => {
  it("shows validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(
      <UpdateSalaryForm employeeId={EMPLOYEE_ID} currentCurrency="INR" onSuccess={vi.fn()} />
    )

    await user.click(screen.getByRole("button", { name: /update salary/i }))

    expect(await screen.findByText(/salary is required/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("pre-fills currency with the employee's current currency", () => {
    render(
      <UpdateSalaryForm employeeId={EMPLOYEE_ID} currentCurrency="USD" onSuccess={vi.fn()} />
    )

    expect(screen.getByRole("combobox", { name: /currency/i })).toHaveTextContent("USD")
  })

  it("submits successfully and calls onSuccess with the updated employee", async () => {
    const user = userEvent.setup()
    const updated = buildUpdatedEmployee()
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(updated),
    })
    vi.stubGlobal("fetch", fetchMock)
    const onSuccess = vi.fn()

    render(
      <UpdateSalaryForm employeeId={EMPLOYEE_ID} currentCurrency="INR" onSuccess={onSuccess} />
    )

    await user.type(screen.getByLabelText(/salary amount/i), "2000000")
    await user.type(screen.getByLabelText(/effective date/i), "2026-07-06")
    await user.type(screen.getByLabelText(/reason/i), "Annual increment")
    await user.click(screen.getByRole("button", { name: /update salary/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updated))

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toContain(`/employees/${EMPLOYEE_ID}/salary`)
    expect(init.method).toBe("PATCH")
    const body = JSON.parse(init.body)
    expect(body).toMatchObject({
      salaryAmount: 2_000_000,
      currency: "INR",
      effectiveDate: "2026-07-06",
      reason: "Annual increment",
    })
  })

  it("shows the backend's error message when the effectiveDate is backdated (400)", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: "effectiveDate cannot be before the most recent salary_history entry",
          }),
      })
    )

    render(
      <UpdateSalaryForm employeeId={EMPLOYEE_ID} currentCurrency="INR" onSuccess={vi.fn()} />
    )

    await user.type(screen.getByLabelText(/salary amount/i), "2000000")
    await user.type(screen.getByLabelText(/effective date/i), "2020-01-01")
    await user.type(screen.getByLabelText(/reason/i), "Backdated raise")
    await user.click(screen.getByRole("button", { name: /update salary/i }))

    expect(
      await screen.findByText(/cannot be before the most recent salary_history entry/i)
    ).toBeInTheDocument()
  })
})
