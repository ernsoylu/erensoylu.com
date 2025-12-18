import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Trash2, Edit, Plus, ArrowLeft, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TiptapEditor } from "@/components/ui/tiptap-editor"

interface Page {
    id: string
    title: string
    slug: string
    content: string
    created_at: string
}

export const PageManager = () => {
    const [view, setView] = useState<"list" | "edit">("list")
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)

    // Edit State
    const [currentPageId, setCurrentPageId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Page>>({
        title: "",
        slug: "",
        content: ""
    })

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        try {
            const { data, error } = await supabase.from("pages").select("*").order("title")
            if (error) throw error
            setPages(data || [])
        } catch (error) {
            console.error("Error fetching pages:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNew = () => {
        setCurrentPageId(null)
        setFormData({
            title: "",
            slug: "",
            content: ""
        })
        setView("edit")
    }

    const handleEdit = (page: Page) => {
        setCurrentPageId(page.id)
        setFormData({
            ...page
        })
        setView("edit")
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        // Auto-generate slug if empty
        let slug = formData.slug
        if (!slug && formData.title) {
            slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }

        const saveData = {
            title: formData.title,
            slug: slug,
            content: formData.content,
            updated_at: new Date().toISOString()
        }

        try {
            if (currentPageId) {
                const { error } = await supabase.from("pages").update(saveData).eq("id", currentPageId)
                if (error) throw error
            } else {
                const { error } = await supabase.from("pages").insert([saveData])
                if (error) throw error
            }
            fetchPages()
            setView("list")
        } catch (error: any) {
            console.error("Error saving page:", error)
            alert(`Error saving page: ${error.message || JSON.stringify(error)}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this page?")) return
        try {
            const { error } = await supabase.from("pages").delete().eq("id", id)
            if (error) throw error
            fetchPages()
        } catch (error) {
            console.error("Error deleting page:", error)
            alert("Error deleting page")
        }
    }

    if (loading) return <div>Loading...</div>

    if (view === "edit") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setView("list")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">{currentPageId ? "Edit Page" : "New Page"}</h2>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Leave empty to auto-generate from title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <TiptapEditor
                                    content={formData.content || ""}
                                    onChange={content => setFormData({ ...formData, content })}
                                />
                            </div>
                            <Button type="submit" className="w-full sm:w-auto">Save Page</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Pages</h2>
                <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" /> New Page
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell>{page.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => window.open(`/page/${page.slug}`, '_blank')} title="View Page">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No pages found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
