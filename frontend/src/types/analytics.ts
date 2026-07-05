export interface AverageSalaryByDepartment {
  department: string
  currency: string
  averageSalary: number
  count: number
}

export interface AverageSalaryByCountry {
  country: string
  currency: string
  averageSalary: number
  count: number
}

export interface HeadcountByDepartment {
  department: string
  count: number
}

export interface HeadcountByLevel {
  level: string
  count: number
}

export interface AnalyticsSummary {
  averageSalaryByDepartment: AverageSalaryByDepartment[]
  averageSalaryByCountry: AverageSalaryByCountry[]
  headcountByDepartment: HeadcountByDepartment[]
  headcountByLevel: HeadcountByLevel[]
}
