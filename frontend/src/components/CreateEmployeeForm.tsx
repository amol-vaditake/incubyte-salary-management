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
import { createEmployee } from "@/api/employees"
import { ApiError } from "@/api/client"
import { useEmployeeOptions } from "@/hooks/useEmployeeOptions"
import type { CreateEmployeeInput, EmployeeDetail } from "@/types/employee"

const CURRENCIES = ["INR", "USD", "GBP", "EUR", "CAD"]
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  firstName: string
  lastName: string
  email: string
  country: string
  department: string
  roleTitle: string
  level: string
  currency: string
  salaryAmount: string
  hireDate: string
}

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  department: "",
  roleTitle: "",
  level: "",
  currency: "",
  salaryAmount: "",
  hireDate: "",
}

type FieldErrors = Partial<Record<keyof FormState, string>>

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!form.firstName.trim()) errors.firstName = "First name is required"
  if (!form.lastName.trim()) errors.lastName = "Last name is required"
  if (!form.email.trim()) errors.email = "Email is required"
  else if (!EMAIL_PATTERN.test(form.email)) errors.email = "Enter a valid email address"
  if (!form.country) errors.country = "Country is required"
  if (!form.department) errors.department = "Department is required"
  if (!form.roleTitle.trim()) errors.roleTitle = "Role title is required"
  if (!form.level) errors.level = "Level is required"
  if (!form.currency) errors.currency = "Currency is required"
  if (!form.salaryAmount.trim()) errors.salaryAmount = "Salary is required"
  else if (!(Number(form.salaryAmount) > 0)) {
    errors.salaryAmount = "Salary must be a positive number"
  }
  if (!form.hireDate) errors.hireDate = "Hire date is required"

  return errors
}

interface CreateEmployeeFormProps {
  onSuccess: (employee: EmployeeDetail) => void
}

export function CreateEmployeeForm({ onSuccess }: CreateEmployeeFormProps) {
  const { options } = useEmployeeOptions()
  const [form, setForm] = useState<FormState>(initialState)
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
      const input: CreateEmployeeInput = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        country: form.country,
        department: form.department,
        roleTitle: form.roleTitle.trim(),
        level: form.level,
        currency: form.currency,
        salaryAmount: Number(form.salaryAmount),
        hireDate: form.hireDate,
      }
      const created = await createEmployee(input)
      onSuccess(created)
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
        <FormField label="First Name" htmlFor="firstName" error={fieldErrors.firstName}>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
        </FormField>
        <FormField label="Last Name" htmlFor="lastName" error={fieldErrors.lastName}>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Country" error={fieldErrors.country}>
          <Select value={form.country} onValueChange={(v) => updateField("country", v ?? "")}>
            <SelectTrigger aria-label="Country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {options.countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Department" error={fieldErrors.department}>
          <Select
            value={form.department}
            onValueChange={(v) => updateField("department", v ?? "")}
          >
            <SelectTrigger aria-label="Department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {options.departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Role Title" htmlFor="roleTitle" error={fieldErrors.roleTitle}>
        <Input
          id="roleTitle"
          value={form.roleTitle}
          onChange={(e) => updateField("roleTitle", e.target.value)}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Level" error={fieldErrors.level}>
          <Select value={form.level} onValueChange={(v) => updateField("level", v ?? "")}>
            <SelectTrigger aria-label="Level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {options.levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Salary Amount" htmlFor="salaryAmount" error={fieldErrors.salaryAmount}>
          <Input
            id="salaryAmount"
            type="number"
            value={form.salaryAmount}
            onChange={(e) => updateField("salaryAmount", e.target.value)}
          />
        </FormField>
        <FormField label="Hire Date" htmlFor="hireDate" error={fieldErrors.hireDate}>
          <Input
            id="hireDate"
            type="date"
            value={form.hireDate}
            onChange={(e) => updateField("hireDate", e.target.value)}
          />
        </FormField>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Employee"}
      </Button>
    </form>
  )
}
