import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FilterSelect, ALL_VALUE } from "@/components/FilterSelect"
import { CreateEmployeeDialog } from "@/components/CreateEmployeeDialog"
import { useEmployees } from "@/hooks/useEmployees"
import { formatSalary } from "@/lib/format"
import type { EmployeeFilters } from "@/types/employee"

const COUNTRIES = ["India", "USA", "UK", "Germany", "Canada"]
const DEPARTMENTS = ["Engineering", "Sales", "HR", "Finance", "Operations", "Marketing"]
const STATUSES = ["active", "inactive"]
const PAGE_SIZE = 20

export function EmployeesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<EmployeeFilters>({})
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useEmployees(filters, page, PAGE_SIZE)

  function updateFilter(key: keyof EmployeeFilters, value: string | null) {
    setFilters((prev) => ({
      ...prev,
      [key]: !value || value === ALL_VALUE ? undefined : value,
    }))
    setPage(1)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <CreateEmployeeDialog onCreated={() => refetch()} />
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Country"
          value={filters.country}
          options={COUNTRIES}
          allLabel="All countries"
          onChange={(v) => updateFilter("country", v)}
          className="w-40"
        />
        <FilterSelect
          label="Department"
          value={filters.department}
          options={DEPARTMENTS}
          allLabel="All departments"
          onChange={(v) => updateFilter("department", v)}
          className="w-44"
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={STATUSES}
          allLabel="All statuses"
          onChange={(v) => updateFilter("status", v)}
          className="w-36"
        />
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
                <TableRow
                  key={employee.id}
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/employees/${employee.id}`)
                  }}
                >
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
