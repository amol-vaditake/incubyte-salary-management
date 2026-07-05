import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UpdateSalaryForm } from "@/components/UpdateSalaryForm"
import type { EmployeeDetail } from "@/types/employee"

interface UpdateSalaryDialogProps {
  employeeId: string
  currentCurrency: string
  onUpdated: (employee: EmployeeDetail) => void
}

export function UpdateSalaryDialog({
  employeeId,
  currentCurrency,
  onUpdated,
}: UpdateSalaryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Update Salary</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Salary</DialogTitle>
        </DialogHeader>
        <UpdateSalaryForm
          employeeId={employeeId}
          currentCurrency={currentCurrency}
          onSuccess={(employee) => {
            setOpen(false)
            onUpdated(employee)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
