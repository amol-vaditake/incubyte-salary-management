import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useEmployees } from "@/hooks/useEmployees"
import type { EmployeeFilters } from "@/types/employee"

const COUNTRIES = ["India", "USA", "UK", "Germany", "Canada"]
const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"]
const STATUSES = ["active", "inactive"]
const PAGE_SIZE = 20
const ALL_VALUE = "all"

function formatSalary(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString("en-US")}`
}

export function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({})
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useEmployees(filters, page, PAGE_SIZE)

  function updateFilter(key: keyof EmployeeFilters, value: string | null) {
    setFilters((prev) => ({
      ...prev,
      [key]: !value || value === ALL_VALUE ? undefined : value,
    }))
    setPage(1)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Employees</h1>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.country ?? ALL_VALUE} onValueChange={(v) => updateFilter("country", v)}>
          <SelectTrigger aria-label="Country" className="w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All countries</SelectItem>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.department ?? ALL_VALUE}
          onValueChange={(v) => updateFilter("department", v)}
        >
          <SelectTrigger aria-label="Department" className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All departments</SelectItem>
            {DEPARTMENTS.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status ?? ALL_VALUE} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger aria-label="Status" className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading employees...</p>}
      {error && (
        <p className="text-destructive">Failed to load employees: {error}</p>
      )}

      {!isLoading && !error && data && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeCode}</TableCell>
                  <TableCell>
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.country}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.roleTitle}</TableCell>
                  <TableCell>{employee.level}</TableCell>
                  <TableCell>{formatSalary(employee.salaryAmount, employee.currency)}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total}{" "}
              employees)
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    aria-disabled={page <= 1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < data.pagination.totalPages) setPage(page + 1)
                    }}
                    aria-disabled={page >= data.pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}
