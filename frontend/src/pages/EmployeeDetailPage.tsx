import { useParams } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEmployee } from "@/hooks/useEmployee"
import { formatSalary } from "@/lib/format"

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error, notFound } = useEmployee(id ?? "")

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-8">
      {isLoading && <p className="text-muted-foreground">Loading employee...</p>}
      {notFound && <p className="text-destructive">Employee not found.</p>}
      {error && <p className="text-destructive">Failed to load employee: {error}</p>}

      {!isLoading && !error && !notFound && data && (
        <>
          <div>
            <h1 className="text-2xl font-semibold">
              {data.firstName} {data.lastName}
            </h1>
            <p className="text-muted-foreground">{data.employeeCode}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-sm">Country</dt>
              <dd>{data.country}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Department</dt>
              <dd>{data.department}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Role</dt>
              <dd>{data.roleTitle}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Level</dt>
              <dd>{data.level}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Current Salary</dt>
              <dd>{formatSalary(data.salaryAmount, data.currency)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Hire Date</dt>
              <dd>{data.hireDate}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Status</dt>
              <dd>{data.status}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-lg font-semibold">Salary History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.salaryHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.effectiveDate}</TableCell>
                    <TableCell>{formatSalary(entry.salaryAmount, entry.currency)}</TableCell>
                    <TableCell>{entry.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
