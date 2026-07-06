import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatSalary } from "@/lib/format"

interface SalaryByCurrencyRow {
  label: string
  currency: string
  averageSalary: number
  count: number
}

interface SalaryByCurrencyTableProps {
  title: string
  labelHeading: string
  rows: SalaryByCurrencyRow[]
}

export function SalaryByCurrencyTable({ title, labelHeading, rows }: SalaryByCurrencyTableProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{labelHeading}</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Average Salary</TableHead>
            <TableHead>Headcount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.label}-${row.currency}`}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell className="text-muted-foreground">{row.currency}</TableCell>
              <TableCell className="font-medium">
                {formatSalary(row.averageSalary, row.currency)}
              </TableCell>
              <TableCell className="text-muted-foreground">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
