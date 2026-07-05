import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField } from "@/components/FormField"
import { updateEmployeeSalary } from "@/api/employees"
import { ApiError } from "@/api/client"
import type { EmployeeDetail, UpdateSalaryInput } from "@/types/employee"

const CURRENCIES = ["INR", "USD", "GBP", "EUR", "CAD"]

interface FormState {
  salaryAmount: string
  currency: string
  effectiveDate: string
  reason: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!form.salaryAmount.trim()) errors.salaryAmount = "Salary is required"
  else if (!(Number(form.salaryAmount) > 0)) {
    errors.salaryAmount = "Salary must be a positive number"
  }
  if (!form.currency) errors.currency = "Currency is required"
  if (!form.effectiveDate) errors.effectiveDate = "Effective date is required"
  if (!form.reason.trim()) errors.reason = "Reason is required"

  return errors
}

interface UpdateSalaryFormProps {
  employeeId: string
  currentCurrency: string
  onSuccess: (employee: EmployeeDetail) => void
}

export function UpdateSalaryForm({
  employeeId,
  currentCurrency,
  onSuccess,
}: UpdateSalaryFormProps) {
  const [form, setForm] = useState<FormState>({
    salaryAmount: "",
    currency: currentCurrency,
    effectiveDate: "",
    reason: "",
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      const input: UpdateSalaryInput = {
        salaryAmount: Number(form.salaryAmount),
        currency: form.currency,
        effectiveDate: form.effectiveDate,
        reason: form.reason.trim(),
      }
      const updated = await updateEmployeeSalary(employeeId, input)
      onSuccess(updated)
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {submitError && <p className="text-destructive text-sm">{submitError}</p>}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Salary Amount" htmlFor="salaryAmount" error={fieldErrors.salaryAmount}>
          <Input
            id="salaryAmount"
            type="number"
            value={form.salaryAmount}
            onChange={(e) => updateField("salaryAmount", e.target.value)}
          />
        </FormField>
        <FormField label="Currency" error={fieldErrors.currency}>
          <Select value={form.currency} onValueChange={(v) => updateField("currency", v ?? "")}>
            <SelectTrigger aria-label="Currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Effective Date" htmlFor="effectiveDate" error={fieldErrors.effectiveDate}>
        <Input
          id="effectiveDate"
          type="date"
          value={form.effectiveDate}
          onChange={(e) => updateField("effectiveDate", e.target.value)}
        />
      </FormField>

      <FormField label="Reason" htmlFor="reason" error={fieldErrors.reason}>
        <Input
          id="reason"
          value={form.reason}
          onChange={(e) => updateField("reason", e.target.value)}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Salary"}
      </Button>
    </form>
  )
}
