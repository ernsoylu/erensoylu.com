import { Button } from "@/components/ui/button"

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    icon: React.ElementType
    label?: string
}

export const ToolbarButton = ({
    onClick,
    isActive = false,
    icon: Icon,
    label
}: ToolbarButtonProps) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        size="icon"
        onClick={onClick}
        type="button"
        className="h-8 w-8"
        title={label}
    >
        <Icon className="h-4 w-4" />
    </Button>
)
