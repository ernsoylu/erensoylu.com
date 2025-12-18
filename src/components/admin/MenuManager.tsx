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
import { SortableMenuItem, type MenuItem } from "./menu/SortableMenuItem"
import { LinkSelectorModal } from "./LinkSelectorModal"

// Removed local MenuItem interface to use the one from SortableMenuItem


export const MenuManager = () => {
    const [items, setItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingItemId, setEditingItemId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from("navbar_items")
                .select("*")
                .order("sort_order", { ascending: true })

            if (error) throw error
            setItems(data || [])
        } catch (error) {
            console.error("Error fetching menu items:", error)
        } finally {
            setLoading(false)
        }
    }

    // Helper to organize flat list into tree
    const getRootItems = () => items.filter(i => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order)
    const getChildItems = (parentId: string) => items.filter(i => i.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order)

    const handleAddItem = async (parentId: string | null = null) => {
        // Calculate new order
        const siblings = parentId ? getChildItems(parentId) : getRootItems()
        const newOrder = siblings.length > 0 ? Math.max(...siblings.map(s => s.sort_order)) + 1 : 0

        try {
            const { data, error } = await supabase.from("navbar_items").insert([{
                label: "New Link",
                path: "/",
                sort_order: newOrder,
                parent_id: parentId,
                is_active: true
            }]).select().single()

            if (error) throw error
            setItems([...items, data])
        } catch (error) {
            console.error("Error adding item:", error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this menu item?")) return
        try {
            const { error } = await supabase.from("navbar_items").delete().eq("id", id)
            if (error) throw error
            setItems(items.filter(i => i.id !== id))
        } catch (error) {
            console.error("Error deleting item:", error)
        }
    }

    const handleUpdate = async (id: string, updates: Partial<MenuItem>) => {
        // Optimistic update
        setItems(items.map(i => i.id === id ? { ...i, ...updates } : i))

        try {
            // Debounce or just fire? For now direct fire.
            // Exclude children from update
            const { children, ...dbUpdates } = updates as any
            const { error } = await supabase.from("navbar_items").update(dbUpdates).eq("id", id)
            if (error) throw error
        } catch (error) {
            console.error("Error updating item:", error)
            // Revert? (Complex without previous state snapshot, assuming success)
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        // Determine if we are sorting roots or children
        const activeItem = items.find(i => i.id === active.id)
        if (!activeItem) return

        const parentId = activeItem.parent_id
        const siblings = items.filter(i => i.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order)

        const oldIndex = siblings.findIndex(i => i.id === active.id)
        const newIndex = siblings.findIndex(i => i.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(siblings, oldIndex, newIndex)

            // Updates local state locally first
            const updatedItems = items.map(item => {
                const found = newOrder.find(s => s.id === item.id)
                if (found) return { ...item, sort_order: newOrder.indexOf(found) }
                return item
            })
            setItems(updatedItems)

            // Persist order to DB
            for (let i = 0; i < newOrder.length; i++) {
                await supabase.from("navbar_items").update({ sort_order: i }).eq("id", newOrder[i].id)
            }
        }
    }

    const openLinkSelector = (itemId: string) => {
        setEditingItemId(itemId)
        setModalOpen(true)
    }

    const handleSelectLink = (path: string, label?: string) => {
        if (editingItemId) {
            const updates: any = { path }
            // Only update label if it's currently "New Link" or empty (optional UX choice)
            const currentItem = items.find(i => i.id === editingItemId)
            if (currentItem && (currentItem.label === "New Link" || !currentItem.label) && label) {
                updates.label = label
            }
            handleUpdate(editingItemId, updates)
        }
    }

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>

    const rootItems = getRootItems()

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Menu Manager</h2>
                    <p className="text-muted-foreground mt-1">Drag and drop to arrange your menu structure.</p>
                </div>
                <Button onClick={() => handleAddItem(null)} size="lg">
                    <Plus className="mr-2 h-4 w-4" /> Add Top Menu
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="space-y-4">
                    <SortableContext
                        items={rootItems.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {rootItems.map(root => (
                            <SortableMenuItem
                                key={root.id}
                                item={root}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                                onAddChild={handleAddItem}
                                onSelectLink={openLinkSelector}
                                depth={0}
                            >
                                {/* Nested Sortable Context for Children */}
                                <SortableContext
                                    items={getChildItems(root.id).map(i => i.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {getChildItems(root.id).map(child => (
                                        <SortableMenuItem
                                            key={child.id}
                                            item={child}
                                            onDelete={handleDelete}
                                            onUpdate={handleUpdate}
                                            onSelectLink={openLinkSelector}
                                            depth={1}
                                        />
                                    ))}
                                </SortableContext>
                            </SortableMenuItem>
                        ))}
                    </SortableContext>
                </div>
            </DndContext>

            {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    No menu items found. Get started by adding a top menu!
                </div>
            )}

            <LinkSelectorModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSelect={handleSelectLink}
            />
        </div>
    )
}
