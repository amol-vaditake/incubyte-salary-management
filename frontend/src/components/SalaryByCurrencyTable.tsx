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
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labelHeading}</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Average Salary</TableHead>
            <TableHead>Headcount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.label}-${row.currency}`}>
              <TableCell>{row.label}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell>{formatSalary(row.averageSalary, row.currency)}</TableCell>
              <TableCell>{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
