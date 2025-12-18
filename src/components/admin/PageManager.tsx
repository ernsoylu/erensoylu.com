import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
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
import { Trash2, Edit, Plus, ArrowLeft, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { FileManagerModal } from "./FileManagerModal"
import { UnsavedChangesDialog } from "./UnsavedChangesDialog"

interface Page {
    id: string
    title: string
    slug: string
    content: string
    created_at: string
    excerpt: string | null
    image_url: string | null
    published: boolean
    draft_content?: Partial<Page>
    has_draft?: boolean
    draft_updated_at?: string
}

export const PageManager = () => {
    const [view, setView] = useState<"list" | "edit">("list")
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    // Edit State
    const [currentPageId, setCurrentPageId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Page>>({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        image_url: "",
        published: false
    })

    // Draft & Dirty State
    const [isDirty, setIsDirty] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    const [imageModalOpen, setImageModalOpen] = useState(false)

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
            }
        }
        globalThis.window.addEventListener("beforeunload", handleBeforeUnload)
        return () => globalThis.window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    const fetchPages = async () => {
        logger.api("PageManager", "Fetch Pages Start")
        try {
            const { data, error } = await supabase.from("pages").select("*").order("title")
            if (error) throw error
            setPages(data || [])
            logger.api("PageManager", "Fetch Pages Success", { count: data?.length })
        } catch (error) {
            logger.error("PageManager", "Fetch Pages Failed", error)
            console.error("Error fetching pages:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPages()
    }, [])

    const buildSlug = (title?: string, slug?: string) =>
        slug || title?.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)+/g, '') || ""

    const resetFormForNew = () => {
        setCurrentPageId(null)
        setFormData({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            image_url: "",
            published: false
        })
        setIsDirty(false)
        setView("edit")
    }

    // URL-driven state management
    useEffect(() => {
        const loadPageIntoForm = (page: Page) => {
            setCurrentPageId(page.id)

            if (page.has_draft && page.draft_content) {
                setFormData({ ...page.draft_content })
                toast("Draft content loaded", {
                    description: `Restored unsaved changes from ${new Date(page.draft_updated_at!).toLocaleString()}`,
                    action: {
                        label: "Dismiss",
                        onClick: () => { }
                    }
                })
            } else {
                setFormData({ ...page })
            }

            setIsDirty(false)
            setView("edit")
            setSearchParams({ edit: page.id })
        }

        const editId = searchParams.get('edit')
        const isCreatingNew = searchParams.has('new')

        if (editId && pages.length > 0 && currentPageId !== editId) {
            const page = pages.find(p => p.id === editId)
            if (page) loadPageIntoForm(page)
            return
        }

        if (isCreatingNew && (currentPageId !== null || view !== 'edit')) {
            resetFormForNew()
            return
        }

        if (!editId && !isCreatingNew && view !== 'list') {
            setView("list")
            setCurrentPageId(null)
        }
    }, [pages, searchParams, currentPageId, view, setSearchParams])

    const handleSaveDraft = async () => {
        logger.action("PageManager", "Save Draft Start", { id: currentPageId })
        try {
            const slug = buildSlug(formData.title, formData.slug)
            const dataToSave = {
                title: formData.title,
                slug,
                content: formData.content,
                excerpt: formData.excerpt,
                image_url: formData.image_url,
                updated_at: new Date().toISOString()
            }

            if (currentPageId === null) {
                const { data, error } = await supabase.from("pages").insert([{ ...dataToSave, published: false }]).select()
                if (error) throw error
                const newId = data[0].id
                setCurrentPageId(newId)
                await fetchPages()
                setSearchParams({ edit: newId })
                toast.success("Draft page saved")
                logger.api("PageManager", "Save Draft (New) Success", { id: newId })
                setIsDirty(false)
                return
            }

            const page = pages.find(p => p.id === currentPageId)
            const isPublished = page?.published === true

            if (isPublished) {
                const { error } = await supabase.from("pages").update({
                    draft_content: { ...dataToSave, published: true },
                    has_draft: true,
                    draft_updated_at: new Date().toISOString()
                }).eq("id", currentPageId)
                if (error) throw error
                toast.success("Draft revision saved")
                logger.api("PageManager", "Save Draft Revision Success", { id: currentPageId })
            } else {
                const { error } = await supabase.from("pages").update({ ...dataToSave, published: false }).eq("id", currentPageId)
                if (error) throw error
                toast.success("Draft saved")
                logger.api("PageManager", "Save Draft (Update) Success", { id: currentPageId })
            }
            setIsDirty(false)
            void fetchPages()
        } catch (error: unknown) {
            logger.error("PageManager", "Save Draft Failed", error)
            const message = error instanceof Error ? error.message : "Unknown error"
            console.error("Error saving draft:", error)
            toast.error(`Error saving draft: ${message}`)
        }
    }

    const handlePublish = async () => {
        try {
            const slug = buildSlug(formData.title, formData.slug)
            const dataToSave = {
                title: formData.title,
                slug,
                content: formData.content,
                excerpt: formData.excerpt,
                image_url: formData.image_url,
                published: true,
                updated_at: new Date().toISOString(),
                draft_content: null,
                has_draft: false,
                draft_updated_at: null,
            }

            if (currentPageId === null) {
                const { data, error } = await supabase.from("pages").insert([dataToSave]).select()
                if (error) throw error
                const newId = data[0].id
                setCurrentPageId(newId)
                setSearchParams({ edit: newId })
                toast.success("Page published!")
            } else {
                const { error } = await supabase.from("pages").update(dataToSave).eq("id", currentPageId)
                if (error) throw error
                toast.success("Page updated and published!")
            }
            setIsDirty(false)
            fetchPages()
        } catch (error: unknown) {
            console.error("Error publishing page:", error)
            const message = error instanceof Error ? error.message : "Unknown error"
            toast.error(`Error publishing page: ${message}`)
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
                    <Button variant="outline" size="icon" onClick={() => setSearchParams({})}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">{currentPageId ? "Edit Page" : "New Page"}</h2>
                    {formData.slug && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/page/${formData.slug}`, '_blank')}
                            title="View Page"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => {
                                            setFormData({ ...formData, title: e.target.value })
                                            setIsDirty(true)
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <TiptapEditor
                                        content={formData.content || ""}
                                        onChange={content => {
                                            setFormData({ ...formData, content })
                                            setIsDirty(true)
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Status</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${formData.published ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}>
                                        {formData.published ? "Published" : "Draft"}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={e => {
                                            setFormData({ ...formData, slug: e.target.value })
                                            setIsDirty(true)
                                        }}
                                    />
                                </div>
                                <div className="pt-4 space-y-2">
                                    <Button onClick={handleSaveDraft} variant="secondary" className="w-full">
                                        Save Draft
                                    </Button>
                                    <Button onClick={handlePublish} className="w-full">
                                        {formData.published ? "Update & Publish" : "Publish"}
                                    </Button>
                                    {isDirty && <p className="text-xs text-center text-muted-foreground">Unsaved changes</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Featured Image</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Featured" className="w-full h-40 object-cover rounded-md" />
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.image_url || ""}
                                        onChange={e => {
                                            setFormData({ ...formData, image_url: e.target.value })
                                            setIsDirty(true)
                                        }}
                                        placeholder="Image URL"
                                    />
                                    <Button type="button" variant="secondary" onClick={() => setImageModalOpen(true)}>Select</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Excerpt</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Page Excerpt</Label>
                                        <span className="text-xs text-muted-foreground">{formData.excerpt?.length || 0} chars</span>
                                    </div>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.excerpt || ""}
                                        onChange={e => {
                                            setFormData({ ...formData, excerpt: e.target.value })
                                            setIsDirty(true)
                                        }}
                                        placeholder="A short summary of the page..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <UnsavedChangesDialog
                    open={showUnsavedDialog}
                    onOpenChange={setShowUnsavedDialog}
                    onSaveDraft={() => { handleSaveDraft(); setShowUnsavedDialog(false); }}
                    onPublish={() => { handlePublish(); setShowUnsavedDialog(false); }}
                    onDiscard={() => { setIsDirty(false); setShowUnsavedDialog(false); }}
                />

                <FileManagerModal
                    open={imageModalOpen}
                    onOpenChange={setImageModalOpen}
                    onSelect={(url) => {
                        setFormData({ ...formData, image_url: url })
                        setIsDirty(true)
                        setImageModalOpen(false)
                    }}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Pages</h2>
                <Button onClick={() => setSearchParams({ new: 'true' })}>
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
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.map((page) => (
                                <TableRow key={page.id}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell>{page.slug}</TableCell>
                                    <TableCell>{new Date(page.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setSearchParams({ edit: page.id })}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
