import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GripVertical, Trash2, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface CategoryItem {
    id: string
    name: string
    slug: string
    parent_id: string | null
    children?: CategoryItem[]
}

interface SortableCategoryItemProps {
    item: CategoryItem
    onDelete: (id: string) => void
    onUpdate: (id: string, data: Partial<CategoryItem>) => void
    onAddChild?: (parentId: string) => void
    depth?: number
    children?: React.ReactNode
}

export const SortableCategoryItem = ({
    item,
    onDelete,
    onUpdate,
    onAddChild,
    depth = 0,
    children
}: SortableCategoryItemProps) => {
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
                    <div className="flex items-center gap-2">
                        <button {...attributes} {...listeners} className="cursor-grab hover:text-primary active:cursor-grabbing">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                value={item.name}
                                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                                placeholder="Category Name"
                                className="h-9"
                            />
                            <Input
                                value={item.slug}
                                onChange={(e) => onUpdate(item.id, { slug: e.target.value })}
                                placeholder="slug"
                                className="h-9 bg-muted/50 font-mono text-xs"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                            {isRoot && (
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onAddChild?.(item.id)} title="Add Sub-Category">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => onDelete(item.id)} title="Delete Category">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {children && (
                        <div className="space-y-2 mt-1">
                            {children}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
