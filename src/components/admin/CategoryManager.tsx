import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
// Import SortableCategoryItem and its interface
import { SortableCategoryItem, type CategoryItem } from "./category/SortableCategoryItem"

export const CategoryManager = () => {
    // Transform DB category to CategoryItem (ensure sort_order exists in state)
    // DB Type: id, name, slug, parent_id, sort_order
    const [categories, setCategories] = useState<CategoryItem[]>([])
    const [loading, setLoading] = useState(true)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            // Include sort_order in selection
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("sort_order", { ascending: true })

            if (error) throw error
            // Cast data to CategoryItem[] (DB schema matches now)
            setCategories((data as CategoryItem[]) || [])
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setLoading(false)
        }
    }

    // Tree Helpers
    // Sort logic usually handled by DB query, but good to enforce on client if mixing local state
    // We assume the state 'categories' is flat list
    const getRootCategories = () => categories.filter(c => !c.parent_id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    const getChildCategories = (parentId: string) => categories.filter(c => c.parent_id === parentId)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

    const handleAddCategory = async (parentId: string | null = null) => {
        const siblings = parentId ? getChildCategories(parentId) : getRootCategories()
        const newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sort_order || 0)) + 1 : 0

        try {
            const { data, error } = await supabase.from("categories").insert([{
                name: "New Category",
                slug: `new-category-${Date.now()}`, // Temporary unique slug
                parent_id: parentId,
                sort_order: newOrder
            }]).select().single()

            if (error) throw error
            setCategories([...categories, data])
        } catch (error) {
            console.error("Error adding category:", error)
            alert("Error adding category")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the category and potential subcategories.")) return
        try {
            const { error } = await supabase.from("categories").delete().eq("id", id)
            if (error) throw error
            setCategories(categories.filter(c => c.id !== id))
        } catch (error) {
            console.error("Error deleting category:", error)
        }
    }

    const handleUpdate = async (id: string, updates: Partial<CategoryItem>) => {
        setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c))

        try {
            // Exclude children from update payload if it exists
            // Exclude children from update payload if it exists
            const dbUpdates = { ...updates }
            if ('children' in dbUpdates) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (dbUpdates as any).children
            }
            const { error } = await supabase.from("categories").update(dbUpdates).eq("id", id)
            if (error) throw error
        } catch (error) {
            console.error("Error updating category:", error)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeItem = categories.find(c => c.id === active.id)
        if (!activeItem) return

        const parentId = activeItem.parent_id
        // Filter siblings to perform the sort on specific level
        const siblings = categories.filter(c => c.parent_id === parentId)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

        const oldIndex = siblings.findIndex(c => c.id === active.id)
        const newIndex = siblings.findIndex(c => c.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(siblings, oldIndex, newIndex)

            // Update local state
            const updatedCategories = categories.map(cat => {
                const found = newOrder.find(s => s.id === cat.id)
                if (found) {
                    return { ...cat, sort_order: newOrder.indexOf(found) }
                }
                return cat
            })
            setCategories(updatedCategories) // Cast back assuming sort_order exists

            // Persist to DB
            for (const [index, item] of newOrder.entries()) {
                await supabase.from("categories")
                    .update({ sort_order: index })
                    .eq("id", item.id)
            }
        }
    }

    if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>

    const rootCategories = getRootCategories()

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Category Manager</h2>
                    <p className="text-muted-foreground mt-1">Organize your content categories. Drag to reorder.</p>
                </div>
                <Button onClick={() => handleAddCategory(null)} size="lg">
                    <Plus className="mr-2 h-4 w-4" /> Add Top Category
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-4">
                    <SortableContext
                        items={rootCategories.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {rootCategories.map(root => (
                            <SortableCategoryItem
                                key={root.id}
                                item={root}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                onAddChild={handleAddCategory}
                                depth={0}
                            >
                                <SortableContext
                                    items={getChildCategories(root.id).map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {getChildCategories(root.id).map(child => (
                                        <SortableCategoryItem
                                            key={child.id}
                                            item={child}
                                            onDelete={handleDelete}
                                            onUpdate={handleUpdate}
                                            depth={1}
                                        />
                                    ))}
                                </SortableContext>
                            </SortableCategoryItem>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            {categories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No categories found. Start by adding one.
                </div>
            )}
        </div>
    )
}
