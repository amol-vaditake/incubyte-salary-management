interface BarChartRow {
  label: string
  value: number
}

interface BarChartProps {
  data: BarChartRow[]
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((row) => row.value), 1)

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm text-muted-foreground">{row.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              data-testid={`bar-${row.label}`}
              className="h-full rounded-full"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: "var(--chart-1)" }}
            />
          </div>
          <span className="w-12 text-right text-sm font-medium tabular-nums">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
