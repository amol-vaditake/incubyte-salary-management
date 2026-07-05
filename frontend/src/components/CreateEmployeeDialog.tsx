import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEmployeeForm } from "@/components/CreateEmployeeForm"
import type { EmployeeDetail } from "@/types/employee"

interface CreateEmployeeDialogProps {
  onCreated: (employee: EmployeeDetail) => void
}

export function CreateEmployeeDialog({ onCreated }: CreateEmployeeDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ New Employee</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Employee</DialogTitle>
        </DialogHeader>
        <CreateEmployeeForm
          onSuccess={(employee) => {
            setOpen(false)
            onCreated(employee)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
