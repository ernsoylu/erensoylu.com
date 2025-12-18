import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { toast } from "sonner"
import { ContentViewLayout } from "@/components/content/ContentViewLayout"
import { useIsAdminSession } from "@/components/content/useIsAdminSession"
import { useTocFromHtml } from "@/components/content/useTocFromHtml"

interface Page {
    id: string
    title: string
    content: string
    created_at?: string
    updated_at: string
    category: { name: string } | null
}

export const PageView = () => {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const [page, setPage] = useState<Page | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const isAdmin = useIsAdminSession()
    const { toc, processedHtml } = useTocFromHtml(page?.content)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data, error } = await supabase
                    .from("pages")
                    .select(`
          id, 
          title, 
          content, 
          updated_at,
          category:categories(name)
        `)
                    .eq("slug", slug)
                    .single()

                if (error) throw error
                // @ts-expect-error - data type mismatch with Page interface
                setPage(data)
                logger.api("PageView", "Fetch Success", { title: data.title })
            } catch (error) {
                logger.error("PageView", "Fetch Failed", error)
                console.error("Error fetching page:", error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            logger.view("PageView", { slug })
            fetchPage()
        }
    }, [slug])

    const handleDelete = async () => {
        if (!page) return

        try {
            const { error } = await supabase.from("pages").delete().eq("id", page.id)
            if (error) throw error

            toast.success("Page deleted successfully")
            logger.action("PageView", "Delete Page", { id: page.id, title: page.title })
            navigate("/")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error"
            logger.error("PageView", "Delete Failed", error)
            console.error("Error deleting page:", error)
            toast.error(`Error deleting page: ${errorMessage}`)
        }
    }

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>

    if (!page) return (
        <div className="min-h-screen pt-20 md:pt-24 text-center">
            <h1 className="text-2xl font-bold mb-4">Page not found</h1>
            <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
    )

    return (
        <ContentViewLayout
            title={page.title}
            dateLabel="Last Updated"
            date={page.updated_at}
            categoryName={page.category?.name}
            toc={toc}
            contentHtml={processedHtml || page.content}
            isAdmin={isAdmin}
            adminEditHref={`/admin/pages?edit=${page.id}`}
            adminEditLabel="Edit Page"
            onDeleteClick={() => setShowDeleteDialog(true)}
            deleteDialog={{
                open: showDeleteDialog,
                onOpenChange: setShowDeleteDialog,
                onConfirm: handleDelete,
                title: "Delete Page",
                description: "Are you sure you want to delete this page? This action cannot be undone.",
            }}
        />
    )
}
