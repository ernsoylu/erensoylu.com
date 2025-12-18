import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, Trash2, Plus, Link as LinkIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MenuItem {
    id: string
    label: string
    path: string
    sort_order: number
    parent_id: string | null
    grid_cols?: number
    grid_rows?: number
    is_active: boolean
    children?: MenuItem[]
}

interface SortableMenuItemProps {
    item: MenuItem
    onDelete: (id: string) => void
    onUpdate: (id: string, data: Partial<MenuItem>) => void
    onAddChild?: (parentId: string) => void
    depth?: number
    children?: React.ReactNode
    onSelectLink: (itemId: string) => void
}

export const SortableMenuItem = ({
    item,
    onDelete,
    onUpdate,
    onAddChild,
    depth = 0,
    children,
    onSelectLink
}: SortableMenuItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        position: "relative" as "relative",
    }

    const isRoot = depth === 0

    return (
        <div ref={setNodeRef} style={style} className={cn("mb-2", isDragging && "opacity-50")}>
            <Card className={cn(isRoot ? "border-l-4 border-l-primary" : "ml-8 border-l-2")}>
                <CardContent className="p-3 flex flex-col gap-3">
                    {/* Item Row */}
                    <div className="flex items-center gap-2">
                        <button {...attributes} {...listeners} className="cursor-grab hover:text-primary active:cursor-grabbing">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                value={item.label}
                                onChange={(e) => onUpdate(item.id, { label: e.target.value })}
                                placeholder="Label"
                                className="h-9"
                            />
                            <div className="flex gap-1">
                                <Input
                                    value={item.path}
                                    readOnly
                                    placeholder="Target"
                                    className="h-9 bg-muted"
                                />
                                <Button variant="secondary" size="icon" className="h-9 w-9 shrink-0" onClick={() => onSelectLink(item.id)}>
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Root Item Extras: Grid Config & Add Child */}
                    {isRoot && (
                        <div className="pl-7 grid gap-3">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                                <span className="font-semibold uppercase tracking-wider">Submenu Layout</span>
                                <div className="flex items-center gap-2">
                                    <span>Columns:</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={item.grid_cols || 1}
                                        onChange={(e) => onUpdate(item.id, { grid_cols: parseInt(e.target.value) || 1 })}
                                        className="h-7 w-16 bg-background"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Rows:</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.grid_rows || 1}
                                        onChange={(e) => onUpdate(item.id, { grid_rows: parseInt(e.target.value) || 1 })}
                                        className="h-7 w-16 bg-background"
                                    />
                                </div>
                                <div className="ml-auto">
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onAddChild?.(item.id)}>
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Sub-Item
                                    </Button>
                                </div>
                            </div>

                            {/* Nested Children Container */}
                            {children && (
                                <div className="space-y-2 mt-1">
                                    {children}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
