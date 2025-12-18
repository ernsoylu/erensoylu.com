import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Filter } from "lucide-react"
import {
    EmptyState,
    ListViewLayout,
    LoadingGrid,
    SidebarSection,
} from "@/components/listing/ListViewLayout"
import { clearAllFilters, getPageParam, updateListSearchParams } from "@/components/listing/searchParams"

interface Category {
    id: string
    name: string
    slug: string
    count?: number
}

interface Post {
    id: string
    title: string
    slug: string
    excerpt: string
    image_url: string
    created_at: string
    category: {
        name: string
        slug: string
    }
}

export const PostListView = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // State
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)

    // Filters
    const searchQuery = searchParams.get("s") || ""
    const categorySlug = searchParams.get("category") || "all"
    const sortOrder = searchParams.get("sort") || "newest"
    const page = getPageParam(searchParams)
    const PAGE_SIZE = 9

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from("categories").select("id, name, slug")
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            try {
                const isAllCategories = categorySlug === "all"
                let categoryId: string | null = null

                if (!isAllCategories) {
                    const { data: category, error: categoryError } = await supabase
                        .from("categories")
                        .select("id")
                        .eq("slug", categorySlug)
                        .single()

                    if (categoryError || !category?.id) {
                        setPosts([])
                        setTotalCount(0)
                        return
                    }

                    categoryId = category.id
                }

                let query = supabase
                    .from("posts")
                    .select("*, category:categories(name, slug)", { count: 'exact' })
                    .eq("published", true)

                if (categoryId) query = query.eq("category_id", categoryId)
                if (searchQuery) query = query.ilike("title", `%${searchQuery}%`)

                if (sortOrder === "newest") query = query.order("created_at", { ascending: false })
                else if (sortOrder === "oldest") query = query.order("created_at", { ascending: true })
                else if (sortOrder === "az") query = query.order("title", { ascending: true })

                // Pagination
                const from = (page - 1) * PAGE_SIZE
                const to = from + PAGE_SIZE - 1
                query = query.range(from, to)

                const { data, error, count } = await query
                if (error) {
                    console.error("Error fetching posts:", error)
                    return
                }

                setPosts(data || [])
                setTotalCount(count || 0)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [searchQuery, categorySlug, sortOrder, page])

    const headerTitle = categorySlug === 'all'
        ? "All Posts"
        : `${categories.find(c => c.slug === categorySlug)?.name || 'Category'} Posts`

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "az", label: "A-Z" },
    ]

    const deleteIfValueIn = { category: ["all"] }

    const sidebar = (
        <>
            <SidebarSection icon={<Search className="w-4 h-4" />} title="Search">
                <Input
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => updateListSearchParams(searchParams, setSearchParams, "s", e.target.value)}
                />
            </SidebarSection>

            <SidebarSection icon={<Filter className="w-4 h-4" />} title="Categories">
                <div className="flex flex-col gap-2">
                    <Button
                        variant={categorySlug === 'all' ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => updateListSearchParams(searchParams, setSearchParams, "category", "all", { deleteIfValueIn })}
                    >
                        All Categories
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={categorySlug === cat.slug ? "secondary" : "ghost"}
                            className="justify-start"
                            onClick={() => updateListSearchParams(searchParams, setSearchParams, "category", cat.slug, { deleteIfValueIn })}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </SidebarSection>
        </>
    )

    const clearFilters = () => clearAllFilters(setSearchParams)

    let content: React.ReactNode
    if (loading) {
        content = <LoadingGrid itemClassName="h-64" />
    } else if (posts.length > 0) {
        content = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                    <Link key={post.id} to={`/post/${post.slug}`} className="group">
                        <Card className="h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 hover:bg-card">
                            <div className="aspect-video w-full overflow-hidden bg-muted/50 relative">
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                        <Badge variant="outline">No Image</Badge>
                                    </div>
                                )}
                                {post.category && (
                                    <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur text-foreground hover:bg-background/90">
                                        {post.category.name}
                                    </Badge>
                                )}
                            </div>
                            <CardHeader className="p-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.created_at).toLocaleDateString()}
                                </div>
                                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                                    {post.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {post.excerpt}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        )
    } else {
        content = (
            <EmptyState
                title="No posts found"
                description="Try adjusting your filters"
                onClear={clearFilters}
            />
        )
    }

    return (
        <ListViewLayout
            title={headerTitle}
            sidebar={sidebar}
            sortOrder={sortOrder}
            sortOptions={sortOptions}
            onSortChange={(val) => updateListSearchParams(searchParams, setSearchParams, "sort", val)}
            pagination={{
                page,
                totalCount,
                pageSize: PAGE_SIZE,
                onPageChange: (nextPage) => updateListSearchParams(searchParams, setSearchParams, "page", nextPage.toString()),
            }}
        >
            {content}
        </ListViewLayout>
    )
}
