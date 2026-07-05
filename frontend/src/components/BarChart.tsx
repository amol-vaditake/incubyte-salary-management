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
    <div className="flex flex-col gap-2">
      {data.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm">{row.label}</span>
          <div className="bg-muted h-4 flex-1 overflow-hidden rounded">
            <div
              data-testid={`bar-${row.label}`}
              className="bg-primary h-full rounded"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-sm">{row.value}</span>
        </div>
      ))}
    </div>
  )
}
