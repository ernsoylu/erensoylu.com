import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Edit, Trash } from "lucide-react"
import { TiptapRenderer } from "@/components/ui/TiptapRenderer"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface Post {
    id: string
    title: string
    content: string
    image_url: string
    created_at: string
    category: { name: string } | null
}

export const PostView = () => {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const [post, setPost] = useState<Post | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([])
    const [processedContent, setProcessedContent] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAdmin(!!session)
        })
    }, [])

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data, error } = await supabase
                    .from("posts")
                    .select(`
          id, 
          title, 
          content, 
          image_url, 
          created_at,
          published,
          category:categories(name)
        `)
                    .eq("slug", slug)
                    .single()

                if (error) throw error

                // If not published, check if admin
                if (!data.published) {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (!session) {
                        throw new Error("Post not found or not published")
                    }
                }

                // @ts-expect-error - data type mismatch with Post interface
                setPost(data)
                logger.api("PostView", "Fetch Success", { title: data.title })
            } catch (error) {
                logger.error("PostView", "Fetch Failed", error)
                console.error("Error fetching post:", error)
                setPost(null)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            logger.view("PostView", { slug })
            fetchPost()
        }
    }, [slug])

    useEffect(() => {
        if (post?.content) {
            generateToc(post.content)
        }
    }, [post])

    const generateToc = (html: string) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const headings = doc.querySelectorAll('h1, h2, h3')
        const tocItems: { id: string, text: string, level: number }[] = []

        headings.forEach((heading, index) => {
            const id = `heading-${index}`
            heading.id = id
            tocItems.push({
                id,
                text: heading.textContent || "",
                level: parseInt(heading.tagName.substring(1))
            })
        })

        setProcessedContent(doc.body.innerHTML)
        setToc(tocItems)
    }

    const handleDelete = async () => {
        if (!post) return

        try {
            const { error } = await supabase.from("posts").delete().eq("id", post.id)
            if (error) throw error

            toast.success("Post deleted successfully")
            logger.action("PostView", "Delete Post", { id: post.id, title: post.title })
            navigate("/posts")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            logger.error("PostView", "Delete Failed", error)
            console.error("Error deleting post:", error)
            toast.error(`Error deleting post: ${errorMessage}`)
        }
    }

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>

    if (!post) return (
        <div className="min-h-screen pt-20 md:pt-24 text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
    )

    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>

            {/* Full Width Title (Desktop & Mobile) */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-8 md:mb-12 text-center md:text-left">{post.title}</h1>

            <div className="flex flex-col lg:flex-row gap-12 relative">
                {/* Sidebar: Metadata & TOC */}
                <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r pb-8 lg:pb-0 mb-8 lg:mb-0">
                    <div className="lg:sticky lg:top-24 space-y-8">

                        {/* Metadata Section */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Author</h4>
                                <p className="font-medium text-foreground">Eren Soylu</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Published</h4>
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(post.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {post.category && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Category</h4>
                                    <Badge variant="secondary" className="font-normal">{post.category.name}</Badge>
                                </div>
                            )}
                        </div>

                        {/* Admin Edit Shortcut */}
                        {isAdmin && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Admin</h4>
                                <Link to={`/admin/posts?edit=${post.id}`}>
                                    <Button variant="outline" size="icon" title="Edit Post">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="destructive" size="icon" title="Delete Post" onClick={() => setShowDeleteDialog(true)} className="ml-2">
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmDialog
                                    open={showDeleteDialog}
                                    onOpenChange={setShowDeleteDialog}
                                    onConfirm={handleDelete}
                                    title="Delete Post"
                                    description="Are you sure you want to delete this post? This action cannot be undone."
                                />
                            </div>
                        )}

                        {/* TOC Section */}
                        {toc.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Table of Contents</h3>
                                <nav className="flex flex-col space-y-1.5 border-l pl-3">
                                    {toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`text-sm hover:text-primary transition-colors block py-0.5 border-l-2 -ml-[13px] pl-3 ${item.level === 1 ? 'border-transparent font-medium text-foreground' :
                                                item.level === 2 ? 'border-transparent pl-5 text-muted-foreground' :
                                                    'border-transparent pl-7 text-muted-foreground/80'
                                                }`}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                                            }}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <article className="flex-1 max-w-3xl min-w-0">
                    {post.image_url && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-8 bg-muted">
                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <TiptapRenderer content={processedContent || post.content} />
                </article>
            </div>
        </div>
    )
}
