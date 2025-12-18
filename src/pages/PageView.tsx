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

    const [toc, setToc] = useState<{ id: string, text: string, level: number }[]>([])
    const [processedContent, setProcessedContent] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAdmin(!!session)
        })
    }, [])

    useEffect(() => {
        if (slug) {
            logger.view("PageView", { slug })
            fetchPage()
        }
    }, [slug])

    useEffect(() => {
        if (page?.content) {
            generateToc(page.content)
        }
    }, [page])

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
            // @ts-ignore
            setPage(data)
            logger.api("PageView", "Fetch Success", { title: data.title })
        } catch (error) {
            logger.error("PageView", "Fetch Failed", error)
            console.error("Error fetching page:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!page) return

        try {
            const { error } = await supabase.from("pages").delete().eq("id", page.id)
            if (error) throw error

            toast.success("Page deleted successfully")
            logger.action("PageView", "Delete Page", { id: page.id, title: page.title })
            navigate("/")
        } catch (error: any) {
            logger.error("PageView", "Delete Failed", error)
            console.error("Error deleting page:", error)
            toast.error(`Error deleting page: ${error.message}`)
        }
    }

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>

    if (!page) return (
        <div className="min-h-screen pt-24 text-center">
            <h1 className="text-2xl font-bold mb-4">Page not found</h1>
            <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
    )

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>

            {/* Full Width Title (Desktop & Mobile) */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-8 md:mb-12 text-center md:text-left">{page.title}</h1>

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
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Last Updated</h4>
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(page.updated_at).toLocaleDateString()}
                                </div>
                            </div>

                            {page.category && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Category</h4>
                                    <Badge variant="secondary" className="font-normal">{page.category.name}</Badge>
                                </div>
                            )}
                        </div>

                        {/* Admin Edit Shortcut */}
                        {isAdmin && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Admin</h4>
                                <Link to={`/admin/pages?edit=${page.id}`}>
                                    <Button variant="outline" size="icon" title="Edit Page">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="destructive" size="icon" title="Delete Page" onClick={() => setShowDeleteDialog(true)} className="ml-2">
                                    <Trash className="h-4 w-4" />
                                </Button>
                                <DeleteConfirmDialog
                                    open={showDeleteDialog}
                                    onOpenChange={setShowDeleteDialog}
                                    onConfirm={handleDelete}
                                    title="Delete Page"
                                    description="Are you sure you want to delete this page? This action cannot be undone."
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
                    <TiptapRenderer content={processedContent || page.content} />
                </article>
            </div>
        </div>
    )
}
