export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  country: string
  department: string
  roleTitle: string
  level: string
  currency: string
  salaryAmount: number
  hireDate: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedEmployees {
  data: Employee[]
  pagination: Pagination
}

export interface EmployeeFilters {
  country?: string
  department?: string
  status?: string
}
