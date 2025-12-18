import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { toast } from "sonner"
import { ContentViewLayout } from "@/components/content/ContentViewLayout"
import { useIsAdminSession } from "@/components/content/useIsAdminSession"
import { useTocFromHtml } from "@/components/content/useTocFromHtml"

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
    const isAdmin = useIsAdminSession()
    const { toc, processedHtml } = useTocFromHtml(post?.content)

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
        <ContentViewLayout
            title={post.title}
            dateLabel="Published"
            date={post.created_at}
            categoryName={post.category?.name}
            toc={toc}
            contentHtml={processedHtml || post.content}
            heroImage={post.image_url ? { src: post.image_url, alt: post.title } : null}
            isAdmin={isAdmin}
            adminEditHref={`/admin/posts?edit=${post.id}`}
            adminEditLabel="Edit Post"
            onDeleteClick={() => setShowDeleteDialog(true)}
            deleteDialog={{
                open: showDeleteDialog,
                onOpenChange: setShowDeleteDialog,
                onConfirm: () => { void handleDelete() },
                title: "Delete Post",
                description: "Are you sure you want to delete this post? This action cannot be undone.",
            }}
        />
    )
}
