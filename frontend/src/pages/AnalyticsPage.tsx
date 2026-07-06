import { BarChart } from "@/components/BarChart"
import { SalaryByCurrencyTable } from "@/components/SalaryByCurrencyTable"
import { useAnalyticsSummary } from "@/hooks/useAnalyticsSummary"

export function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsSummary()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          How the org pays people, broken down by department, country, and level.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-destructive">Failed to load analytics: {error}</p>}

      {!isLoading && !error && data && (
        <div className="grid gap-6 sm:grid-cols-2">
          <SalaryByCurrencyTable
            title="Average Salary by Department"
            labelHeading="Department"
            rows={data.averageSalaryByDepartment.map((row) => ({
              label: row.department,
              currency: row.currency,
              averageSalary: row.averageSalary,
              count: row.count,
            }))}
          />

          <SalaryByCurrencyTable
            title="Average Salary by Country"
            labelHeading="Country"
            rows={data.averageSalaryByCountry.map((row) => ({
              label: row.country,
              currency: row.currency,
              averageSalary: row.averageSalary,
              count: row.count,
            }))}
          />

          <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold tracking-tight">Headcount by Department</h2>
            <BarChart
              data={data.headcountByDepartment.map((row) => ({
                label: row.department,
                value: row.count,
              }))}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold tracking-tight">Headcount by Level</h2>
            <BarChart
              data={data.headcountByLevel.map((row) => ({ label: row.level, value: row.count }))}
            />
          </section>
        </div>
      )}
    </div>
  )
}
