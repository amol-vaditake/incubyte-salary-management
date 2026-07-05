import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createEmployee } from "@/api/employees"
import { ApiError } from "@/api/client"
import type { CreateEmployeeInput, EmployeeDetail } from "@/types/employee"

const COUNTRIES = ["India", "USA", "UK", "Germany", "Canada"]
const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"]
const LEVELS = ["Junior", "Mid", "Senior", "Lead"]
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          {fieldErrors.firstName && (
            <p className="text-destructive text-sm">{fieldErrors.firstName}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
          {fieldErrors.lastName && (
            <p className="text-destructive text-sm">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
        {fieldErrors.email && <p className="text-destructive text-sm">{fieldErrors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Country</Label>
          <Select value={form.country} onValueChange={(v) => updateField("country", v ?? "")}>
            <SelectTrigger aria-label="Country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.country && (
            <p className="text-destructive text-sm">{fieldErrors.country}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Department</Label>
          <Select
            value={form.department}
            onValueChange={(v) => updateField("department", v ?? "")}
          >
            <SelectTrigger aria-label="Department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.department && (
            <p className="text-destructive text-sm">{fieldErrors.department}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="roleTitle">Role Title</Label>
        <Input
          id="roleTitle"
          value={form.roleTitle}
          onChange={(e) => updateField("roleTitle", e.target.value)}
        />
        {fieldErrors.roleTitle && (
          <p className="text-destructive text-sm">{fieldErrors.roleTitle}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Level</Label>
          <Select value={form.level} onValueChange={(v) => updateField("level", v ?? "")}>
            <SelectTrigger aria-label="Level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.level && <p className="text-destructive text-sm">{fieldErrors.level}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Currency</Label>
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
          {fieldErrors.currency && (
            <p className="text-destructive text-sm">{fieldErrors.currency}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="salaryAmount">Salary Amount</Label>
          <Input
            id="salaryAmount"
            type="number"
            value={form.salaryAmount}
            onChange={(e) => updateField("salaryAmount", e.target.value)}
          />
          {fieldErrors.salaryAmount && (
            <p className="text-destructive text-sm">{fieldErrors.salaryAmount}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            value={form.hireDate}
            onChange={(e) => updateField("hireDate", e.target.value)}
          />
          {fieldErrors.hireDate && (
            <p className="text-destructive text-sm">{fieldErrors.hireDate}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Employee"}
      </Button>
    </form>
  )
}
