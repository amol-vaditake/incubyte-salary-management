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
import { UpdateSalaryDialog } from "@/components/UpdateSalaryDialog"
import { StatusBadge } from "@/components/StatusBadge"

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error, notFound, refetch } = useEmployee(id ?? "")

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
      {isLoading && <p className="text-muted-foreground">Loading employee...</p>}
      {notFound && <p className="text-destructive">Employee not found.</p>}
      {error && <p className="text-destructive">Failed to load employee: {error}</p>}

      {!isLoading && !error && !notFound && data && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {data.firstName} {data.lastName}
              </h1>
              <p className="text-muted-foreground text-sm">{data.employeeCode}</p>
            </div>
            {data.status === "active" && (
              <UpdateSalaryDialog
                employeeId={data.id}
                currentCurrency={data.currency}
                onUpdated={() => refetch()}
              />
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 rounded-lg border bg-card p-6 sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground text-sm">Country</dt>
              <dd className="font-medium">{data.country}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Department</dt>
              <dd className="font-medium">{data.department}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Role</dt>
              <dd className="font-medium">{data.roleTitle}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Level</dt>
              <dd className="font-medium">{data.level}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Current Salary</dt>
              <dd className="font-medium">{formatSalary(data.salaryAmount, data.currency)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Hire Date</dt>
              <dd className="font-medium">{data.hireDate}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Status</dt>
              <dd>
                <StatusBadge status={data.status} />
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Salary History</h2>
            <div className="overflow-hidden rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.salaryHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground">{entry.effectiveDate}</TableCell>
                      <TableCell className="font-medium">
                        {formatSalary(entry.salaryAmount, entry.currency)}
                      </TableCell>
                      <TableCell>{entry.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
