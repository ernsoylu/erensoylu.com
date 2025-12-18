import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom" // Try unstable_useBlocker or standard if v6
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Trash2, Edit, Plus, ArrowLeft, Eye, ExternalLink, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { FileManagerModal } from "./FileManagerModal"
import { UnsavedChangesDialog } from "./UnsavedChangesDialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

interface Post {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    image_url: string | null
    published: boolean
    category_id: string | null
    created_at: string
    draft_content?: any
    has_draft?: boolean
    draft_updated_at?: string
}

interface Category {
    id: string
    name: string
}

export const PostManager = () => {
    const [view, setView] = useState<"list" | "edit">("list")
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    // Edit State
    const [currentPostId, setCurrentPostId] = useState<string | null>(null)
    const [formData, setFormData] = useState<Partial<Post>>({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        image_url: "",
        published: false,
        category_id: null
    })

    // Draft & Dirty State
    const [isDirty, setIsDirty] = useState(false)
    const [hasRemoteDraft, setHasRemoteDraft] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

    // Modal for featured image
    const [imageModalOpen, setImageModalOpen] = useState(false)

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ""
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    useEffect(() => {
        fetchPosts()
        fetchCategories()
    }, [])

    // URL-driven state management
    useEffect(() => {
        const editId = searchParams.get('edit')
        const isNew = searchParams.get('new')

        if (editId) {
            if (currentPostId !== editId && posts.length > 0) {
                const postToEdit = posts.find(p => p.id === editId)
                if (postToEdit) {
                    loadPostIntoForm(postToEdit)
                }
            }
        } else if (isNew) {
            if (currentPostId !== null || view !== 'edit') {
                resetFormForNew()
            }
        } else {
            if (view !== 'list') {
                setView("list")
                setCurrentPostId(null)
            }
        }
    }, [posts, searchParams, currentPostId, view])

    const fetchPosts = async () => {
        const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
        setPosts(data || [])
        setLoading(false)
    }

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("id, name")
        setCategories(data || [])
    }

    const resetFormForNew = () => {
        setCurrentPostId(null)
        setFormData({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            image_url: "",
            published: false,
            category_id: "none"
        })
        setIsDirty(false)
        setHasRemoteDraft(false)
        setView("edit")
    }

    const loadPostIntoForm = (post: Post) => {
        setCurrentPostId(post.id)

        if (post.has_draft && post.draft_content) {
            // Auto-load draft content
            setFormData({
                ...post.draft_content,
                // Ensure ID is correct even if draft data is weird, though it should be fine
            })
            toast("Draft content loaded", {
                description: `Restored unsaved changes from ${new Date(post.draft_updated_at!).toLocaleString()}`,
                action: {
                    label: "Dismiss",
                    onClick: () => { }
                }
            })
            // setHasRemoteDraft(true) // We don't need this for the alert anymore
        } else {
            setFormData({
                ...post,
                category_id: post.category_id || "none"
            })
        }

        setIsDirty(false)
        setView("edit")
    }

    // Old loadDraft function removed

    const handleSaveDraft = async () => {
        try {
            const dataToSave = {
                title: formData.title,
                slug: formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                content: formData.content,
                excerpt: formData.excerpt,
                image_url: formData.image_url,
                category_id: formData.category_id === "none" ? null : formData.category_id,
                updated_at: new Date().toISOString()
            }

            // Logic:
            // If Post is New: Create row with published=false.
            // If Post is Published: Save to draft_content, has_draft=true.
            // If Post is Draft (published=false): Save to main columns.

            if (!currentPostId) {
                // New Post
                const { data, error } = await supabase.from("posts").insert([{ ...dataToSave, published: false }]).select()
                if (error) throw error
                setCurrentPostId(data[0].id)
                await fetchPosts()
                setSearchParams({ edit: data[0].id })
                toast.success("Draft saved")
            } else {
                const post = posts.find(p => p.id === currentPostId)
                if (post?.published) {
                    // Save as Revision
                    const { error } = await supabase.from("posts").update({
                        draft_content: { ...dataToSave, published: true }, // Keep published true in draft data context
                        has_draft: true,
                        draft_updated_at: new Date().toISOString()
                    }).eq("id", currentPostId)
                    if (error) throw error
                    toast.success("Draft revision saved")
                    setHasRemoteDraft(true)
                } else {
                    // Just update the draft post
                    const { error } = await supabase.from("posts").update({ ...dataToSave, published: false }).eq("id", currentPostId)
                    if (error) throw error
                    toast.success("Draft saved")
                }
            }
            setIsDirty(false)
            if (currentPostId) fetchPosts()
        } catch (error: any) {
            console.error("Error saving draft:", error)
            toast.error(`Error saving draft: ${error.message}`)
        }
    }

    const handlePublish = async () => {
        try {
            const dataToSave = {
                title: formData.title,
                slug: formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                content: formData.content,
                excerpt: formData.excerpt,
                image_url: formData.image_url,
                category_id: formData.category_id === "none" ? null : formData.category_id,
                updated_at: new Date().toISOString(),
                published: true,
                has_draft: false,
                draft_content: null // Clear draft on publish
            }

            if (currentPostId) {
                const { error } = await supabase.from("posts").update(dataToSave).eq("id", currentPostId)
                if (error) throw error
                toast.success("Post published", {
                    action: {
                        label: "View",
                        onClick: () => window.open(`/post/${dataToSave.slug}`, '_blank')
                    }
                })
            } else {
                const { data, error } = await supabase.from("posts").insert([dataToSave]).select()
                if (error) throw error
                setCurrentPostId(data[0].id)
                await fetchPosts()
                setSearchParams({ edit: data[0].id })
                toast.success("Post published", {
                    action: {
                        label: "View",
                        onClick: () => window.open(`/post/${dataToSave.slug}`, '_blank')
                    }
                })
            }
            setIsDirty(false)
            setHasRemoteDraft(false)
            if (currentPostId) fetchPosts()
        } catch (error: any) {
            console.error("Error publishing:", error)
            toast.error(`Error publishing: ${error.message}`)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post?")) return
        await supabase.from("posts").delete().eq("id", id)
        fetchPosts()
    }

    if (loading) return <div>Loading...</div>

    if (view === "edit") {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setSearchParams({})}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">{currentPostId ? "Edit Post" : "New Post"}</h2>

                    {/* View/Preview Button in Header */}
                    {formData.slug && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/post/${formData.slug}`, '_blank')}
                            title={formData.published ? "View Post" : "Preview Draft"}
                        >
                            {formData.published ? <ExternalLink className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category_id || "none"}
                                        onValueChange={val => {
                                            setFormData({ ...formData, category_id: val })
                                            setIsDirty(true)
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Uncategorized</SelectItem>
                                            {categories.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                        <Label>Post Excerpt</Label>
                                        <span className="text-xs text-muted-foreground">{formData.excerpt?.length || 0} chars</span>
                                    </div>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.excerpt || ""}
                                        onChange={e => {
                                            setFormData({ ...formData, excerpt: e.target.value })
                                            setIsDirty(true)
                                        }}
                                        placeholder="A short summary of the post..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <UnsavedChangesDialog
                    open={showUnsavedDialog}
                    onOpenChange={setShowUnsavedDialog}
                    onSaveDraft={() => { handleSaveDraft(); setShowUnsavedDialog(false); pendingNavigation?.(); }}
                    onPublish={() => { handlePublish(); setShowUnsavedDialog(false); pendingNavigation?.(); }}
                    onDiscard={() => { setIsDirty(false); setShowUnsavedDialog(false); pendingNavigation?.(); }}
                />

                <FileManagerModal
                    open={imageModalOpen}
                    onOpenChange={setImageModalOpen}
                    onSelect={(url) => setFormData({ ...formData, image_url: url })}
                />
            </div >
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
                <Button onClick={() => setSearchParams({ new: 'true' })}>
                    <Plus className="mr-2 h-4 w-4" /> New Post
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={post.published}
                                                onCheckedChange={async (checked) => {
                                                    // Optimistic update
                                                    setPosts(posts.map(p => p.id === post.id ? { ...p, published: checked } : p))
                                                    try {
                                                        const { error } = await supabase.from('posts').update({ published: checked }).eq('id', post.id)
                                                        if (error) throw error
                                                    } catch (error) {
                                                        console.error("Error updating status:", error)
                                                        // Revert on error
                                                        setPosts(posts.map(p => p.id === post.id ? { ...p, published: !checked } : p))
                                                        alert("Failed to update status")
                                                    }
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">{post.published ? "Published" : "Draft"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => window.open(`/post/${post.slug}`, '_blank')} title="View Post">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setSearchParams({ edit: post.id })}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {posts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No posts found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
