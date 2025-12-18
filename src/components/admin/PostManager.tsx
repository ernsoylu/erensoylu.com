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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus, ArrowLeft, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { FileManagerModal } from "./FileManagerModal"

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    image_url: string
    published: boolean
    category_id: string | null
    created_at: string
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

    // Modal for featured image
    const [imageModalOpen, setImageModalOpen] = useState(false)

    useEffect(() => {
        fetchPosts()
        fetchCategories()
    }, [])

    const fetchPosts = async () => {
        const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
        setPosts(data || [])
        setLoading(false)
    }

    const fetchCategories = async () => {
        const { data } = await supabase.from("categories").select("id, name")
        setCategories(data || [])
    }

    const handleCreateNew = () => {
        setCurrentPostId(null)
        setFormData({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            image_url: "",
            published: false,
            category_id: "none" // placeholder for select value
        })
        setView("edit")
    }

    const handleEdit = (post: Post) => {
        setCurrentPostId(post.id)
        setFormData({
            ...post,
            category_id: post.category_id || "none"
        })
        setView("edit")
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        const saveData = {
            title: formData.title,
            slug: formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            content: formData.content,
            excerpt: formData.excerpt,
            image_url: formData.image_url,
            published: formData.published,
            category_id: formData.category_id === "none" ? null : formData.category_id,
            updated_at: new Date().toISOString()
        }

        try {
            if (currentPostId) {
                const { error } = await supabase.from("posts").update(saveData).eq("id", currentPostId)
                if (error) throw error
            } else {
                const { error } = await supabase.from("posts").insert([saveData])
                if (error) throw error
            }
            fetchPosts()
            setView("list")
        } catch (error: any) {
            console.error("Error saving post:", error)
            alert(`Error saving post: ${error.message || JSON.stringify(error)}`)
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
                    <Button variant="outline" size="icon" onClick={() => setView("list")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">{currentPostId ? "Edit Post" : "New Post"}</h2>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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
                                    <Label>Content</Label>
                                    <TiptapEditor
                                        content={formData.content || ""}
                                        onChange={content => setFormData({ ...formData, content })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Excerpt</Label>
                                    <Input
                                        value={formData.excerpt || ""}
                                        onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="published"
                                        checked={formData.published}
                                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                                    />
                                    <Label htmlFor="published">Published</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug</Label>
                                    <Input
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={formData.category_id || "none"}
                                        onValueChange={val => setFormData({ ...formData, category_id: val })}
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
                                <Button type="submit" className="w-full">Save Post</Button>
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
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="Image URL"
                                    />
                                    <Button type="button" variant="secondary" onClick={() => setImageModalOpen(true)}>Select</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>

                <FileManagerModal
                    open={imageModalOpen}
                    onOpenChange={setImageModalOpen}
                    onSelect={(url) => setFormData({ ...formData, image_url: url })}
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
                <Button onClick={handleCreateNew}>
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
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
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
