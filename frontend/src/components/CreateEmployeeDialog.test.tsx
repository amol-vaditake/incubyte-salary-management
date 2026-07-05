import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { CreateEmployeeDialog } from "./CreateEmployeeDialog"
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

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("CreateEmployeeDialog", () => {
  it("opens the form when the trigger is clicked, and it isn't shown before that", async () => {
    const user = userEvent.setup()

    render(<CreateEmployeeDialog onCreated={vi.fn()} />)

    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /new employee/i }))

    expect(await screen.findByLabelText(/first name/i)).toBeInTheDocument()
  })

  it("closes the dialog and calls onCreated after a successful submission", async () => {
    const user = userEvent.setup()
    const created = buildCreatedEmployee()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(created),
      })
    )
    const onCreated = vi.fn()

    render(<CreateEmployeeDialog onCreated={onCreated} />)
    await user.click(screen.getByRole("button", { name: /new employee/i }))
    await screen.findByLabelText(/first name/i)

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

    await user.click(screen.getByRole("button", { name: /create employee/i }))

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created))
    await waitFor(() => expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument())
  })
})
