import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isActive = status === "active"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        isActive
          ? "bg-success/10 text-success dark:bg-success/15"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", isActive ? "bg-success" : "bg-muted-foreground")}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}
