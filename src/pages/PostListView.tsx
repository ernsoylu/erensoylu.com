import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Filter } from "lucide-react"

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
    const [totalcount, setTotalCount] = useState(0)

    // Filters
    const searchQuery = searchParams.get("s") || ""
    const categorySlug = searchParams.get("category") || "all"
    const sortOrder = searchParams.get("sort") || "newest"
    const page = parseInt(searchParams.get("page") || "1")
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
                let query = supabase
                    .from("posts")
                    .select("*, category:categories(name, slug)", { count: 'exact' })
                    .eq("published", true)

                // Filter: Category
                if (categorySlug !== "all") {
                    query = query.eq("category.slug", categorySlug)
                }

                // Filter: Search
                if (searchQuery) {
                    query = query.ilike("title", `%${searchQuery}%`)
                }

                // Sort
                if (sortOrder === "newest") {
                    query = query.order("created_at", { ascending: false })
                } else if (sortOrder === "oldest") {
                    query = query.order("created_at", { ascending: true })
                } else if (sortOrder === "az") {
                    query = query.order("title", { ascending: true })
                }

                // Pagination
                const from = (page - 1) * PAGE_SIZE
                const to = from + PAGE_SIZE - 1
                query = query.range(from, to)

                const { data, error, count } = await query

                if (error) {
                    if (categorySlug !== 'all' && error.message.includes("could not find table")) {
                        const catRes = await supabase.from("categories").select("id").eq("slug", categorySlug).single()
                        if (catRes.data) {
                            let retryQuery = supabase
                                .from("posts")
                                .select("*, category:categories(name, slug)", { count: 'exact' })
                                .eq("published", true)
                                .eq("category_id", catRes.data.id)

                            if (searchQuery) retryQuery = retryQuery.ilike("title", `%${searchQuery}%`)
                            if (sortOrder === "newest") retryQuery = retryQuery.order("created_at", { ascending: false })
                            else if (sortOrder === "oldest") retryQuery = retryQuery.order("created_at", { ascending: true })

                            retryQuery = retryQuery.range(from, to)
                            const retryRes = await retryQuery
                            setPosts(retryRes.data || [])
                            setTotalCount(retryRes.count || 0)
                        }
                    } else {
                        console.error("Error fetching posts:", error)
                    }
                } else {
                    if (categorySlug !== 'all') {
                        const catRes = await supabase.from("categories").select("id").eq("slug", categorySlug).single()
                        if (catRes.data) {
                            let cleanQuery = supabase
                                .from("posts")
                                .select("*, category:categories(name, slug)", { count: 'exact' })
                                .eq("published", true)
                                .eq("category_id", catRes.data.id)

                            if (searchQuery) cleanQuery = cleanQuery.ilike("title", `%${searchQuery}%`)

                            if (sortOrder === "newest") cleanQuery = cleanQuery.order("created_at", { ascending: false })
                            else if (sortOrder === "oldest") cleanQuery = cleanQuery.order("created_at", { ascending: true })
                            else if (sortOrder === "az") cleanQuery = cleanQuery.order("title", { ascending: true })

                            cleanQuery = cleanQuery.range(from, to)
                            const res = await cleanQuery
                            setPosts(res.data || [])
                            setTotalCount(res.count || 0)
                        } else {
                            setPosts([])
                            setTotalCount(0)
                        }
                    } else {
                        setPosts(data || [])
                        setTotalCount(count || 0)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [searchQuery, categorySlug, sortOrder, page])

    const updateFilter = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            newParams.set(key, value)
        } else {
            newParams.delete(key)
        }
        // Reset page on filter change
        if (key !== 'page') newParams.set('page', '1')

        setSearchParams(newParams)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    {/* Search */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Search className="w-4 h-4" /> Search
                        </h3>
                        <Input
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => updateFilter("s", e.target.value)}
                        />
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Categories
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant={categorySlug === 'all' ? "secondary" : "ghost"}
                                className="justify-start"
                                onClick={() => updateFilter("category", "all")}
                            >
                                All Categories
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={categorySlug === cat.slug ? "secondary" : "ghost"}
                                    className="justify-start"
                                    onClick={() => updateFilter("category", cat.slug)}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Header & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {categorySlug !== 'all'
                                ? `${categories.find(c => c.slug === categorySlug)?.name || 'Category'} Posts`
                                : "All Posts"
                            }
                        </h1>
                        <Select value={sortOrder} onValueChange={(val) => updateFilter("sort", val)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="az">A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Post Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
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
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-2xl border-dashed border-2">
                            <h3 className="text-lg font-medium">No posts found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters</p>
                            <Button
                                variant="link"
                                onClick={() => setSearchParams(new URLSearchParams())}
                                className="mt-2"
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalcount > PAGE_SIZE && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                disabled={page <= 1}
                                onClick={() => updateFilter("page", (page - 1).toString())}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center px-4 text-sm font-medium">
                                Page {page} of {Math.ceil(totalcount / PAGE_SIZE)}
                            </div>
                            <Button
                                variant="outline"
                                disabled={page >= Math.ceil(totalcount / PAGE_SIZE)}
                                onClick={() => updateFilter("page", (page + 1).toString())}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
