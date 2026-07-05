import { BarChart } from "@/components/BarChart"
import { SalaryByCurrencyTable } from "@/components/SalaryByCurrencyTable"
import { useAnalyticsSummary } from "@/hooks/useAnalyticsSummary"

export function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsSummary()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {isLoading && <p className="text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-destructive">Failed to load analytics: {error}</p>}

      {!isLoading && !error && data && (
        <>
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

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Headcount by Department</h2>
            <BarChart
              data={data.headcountByDepartment.map((row) => ({
                label: row.department,
                value: row.count,
              }))}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Headcount by Level</h2>
            <BarChart
              data={data.headcountByLevel.map((row) => ({ label: row.level, value: row.count }))}
            />
          </section>
        </>
      )}
    </div>
  )
}
