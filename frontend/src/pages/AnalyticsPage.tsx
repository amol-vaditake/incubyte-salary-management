import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart } from "@/components/BarChart"
import { useAnalyticsSummary } from "@/hooks/useAnalyticsSummary"
import { formatSalary } from "@/lib/format"

export function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsSummary()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {isLoading && <p className="text-muted-foreground">Loading analytics...</p>}
      {error && <p className="text-destructive">Failed to load analytics: {error}</p>}

      {!isLoading && !error && data && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Average Salary by Department</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Average Salary</TableHead>
                  <TableHead>Headcount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.averageSalaryByDepartment.map((row) => (
                  <TableRow key={`${row.department}-${row.currency}`}>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.currency}</TableCell>
                    <TableCell>{formatSalary(row.averageSalary, row.currency)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Average Salary by Country</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Average Salary</TableHead>
                  <TableHead>Headcount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.averageSalaryByCountry.map((row) => (
                  <TableRow key={`${row.country}-${row.currency}`}>
                    <TableCell>{row.country}</TableCell>
                    <TableCell>{row.currency}</TableCell>
                    <TableCell>{formatSalary(row.averageSalary, row.currency)}</TableCell>
                    <TableCell>{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

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
