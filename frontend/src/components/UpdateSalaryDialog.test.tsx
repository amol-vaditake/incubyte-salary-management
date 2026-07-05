import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { UpdateSalaryDialog } from "./UpdateSalaryDialog"
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

describe("UpdateSalaryDialog", () => {
  it("opens the form when the trigger is clicked, and it isn't shown before that", async () => {
    const user = userEvent.setup()

    render(
      <UpdateSalaryDialog employeeId={EMPLOYEE_ID} currentCurrency="INR" onUpdated={vi.fn()} />
    )

    expect(screen.queryByLabelText(/salary amount/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /update salary/i }))

    expect(await screen.findByLabelText(/salary amount/i)).toBeInTheDocument()
  })

  it("closes the dialog and calls onUpdated after a successful submission", async () => {
    const user = userEvent.setup()
    const updated = buildUpdatedEmployee()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(updated),
      })
    )
    const onUpdated = vi.fn()

    render(
      <UpdateSalaryDialog employeeId={EMPLOYEE_ID} currentCurrency="INR" onUpdated={onUpdated} />
    )
    await user.click(screen.getByRole("button", { name: /update salary/i }))
    await screen.findByLabelText(/salary amount/i)

    await user.type(screen.getByLabelText(/salary amount/i), "2000000")
    await user.type(screen.getByLabelText(/effective date/i), "2026-07-06")
    await user.type(screen.getByLabelText(/reason/i), "Annual increment")

    const submitButtons = screen.getAllByRole("button", { name: /update salary/i })
    await user.click(submitButtons[submitButtons.length - 1]!)

    await waitFor(() => expect(onUpdated).toHaveBeenCalledWith(updated))
    await waitFor(() =>
      expect(screen.queryByLabelText(/salary amount/i)).not.toBeInTheDocument()
    )
  })
})
