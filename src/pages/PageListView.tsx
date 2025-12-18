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
import { Search, Calendar } from "lucide-react"

interface Page {
    id: string
    title: string
    slug: string
    excerpt: string
    created_at: string
}

export const PageListView = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    // State
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)

    // Filters
    const searchQuery = searchParams.get("s") || ""
    const sortOrder = searchParams.get("sort") || "newest"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const PAGE_SIZE = 9

    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true)
            try {
                let query = supabase
                    .from("pages")
                    .select("*", { count: 'exact' })

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
                    console.error("Error fetching pages:", error)
                } else {
                    setPages(data || [])
                    setTotalCount(count || 0)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchPages()
    }, [searchQuery, sortOrder, page])

    const updateFilter = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams)
        if (value) {
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
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Header & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">All Pages</h1>
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

                    {/* Page Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : pages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pages.map(page => (
                                <Link key={page.id} to={`/page/${page.slug}`} className="group">
                                    <Card className="h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 hover:bg-card">
                                        <CardHeader className="p-6">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(page.created_at).toLocaleDateString()}
                                            </div>
                                            <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                                {page.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-3 mt-2">
                                                {page.excerpt || "Read more..."}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-muted/30 rounded-2xl border-dashed border-2">
                            <h3 className="text-lg font-medium">No pages found</h3>
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
                    {totalCount > PAGE_SIZE && (
                        <div className="flex justify-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                disabled={page <= 1}
                                onClick={() => updateFilter("page", (page - 1).toString())}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center px-4 text-sm font-medium">
                                Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                            </div>
                            <Button
                                variant="outline"
                                disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
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
