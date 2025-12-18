import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSaveDraft: () => void
    onPublish: () => void
    onDiscard: () => void
}

export function UnsavedChangesDialog({
    open,
    onOpenChange,
    onSaveDraft,
    onPublish,
    onDiscard,
}: UnsavedChangesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unsaved Changes</DialogTitle>
                    <DialogDescription>
                        You have unsaved changes. What would you like to do?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onDiscard}>Discard Changes</Button>
                    <Button variant="secondary" onClick={onSaveDraft}>
                        Save Draft
                    </Button>
                    <Button onClick={onPublish}>Publish Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
