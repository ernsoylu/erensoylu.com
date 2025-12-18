import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title?: string
    description?: string
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Are you sure?",
    description = "This action cannot be undone. This will permanently delete the item.",
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => {
                        onConfirm()
                        onOpenChange(false)
                    }}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
