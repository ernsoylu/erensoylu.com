import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { AdminManagerHeader } from "@/components/admin/AdminManagerHeader"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"
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
import { omitChildrenField, persistSortOrder } from "@/lib/supabaseHelpers"

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
            const { error } = await supabase.from("categories").update(omitChildrenField(updates)).eq("id", id)
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

            await persistSortOrder("categories", newOrder)
        }
    }

    if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>

    const rootCategories = getRootCategories()

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <AdminManagerHeader
                title="Category Manager"
                description="Organize your content categories. Drag to reorder."
                action={
                    <Button onClick={() => handleAddCategory(null)} size="lg">
                        <Plus className="mr-2 h-4 w-4" /> Add Top Category
                    </Button>
                }
            />

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
                <AdminEmptyState message="No categories found. Start by adding one." />
            )}
        </div>
    )
}
