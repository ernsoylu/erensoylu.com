import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Calendar } from "lucide-react"
import {
    EmptyState,
    ListViewLayout,
    LoadingGrid,
    SidebarSection,
} from "@/components/listing/ListViewLayout"
import { clearAllFilters, getPageParam, updateListSearchParams } from "@/components/listing/searchParams"

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
    const page = getPageParam(searchParams)
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

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "az", label: "A-Z" },
    ]

    const sidebar = (
        <SidebarSection icon={<Search className="w-4 h-4" />} title="Search">
            <Input
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => updateListSearchParams(searchParams, setSearchParams, "s", e.target.value)}
            />
        </SidebarSection>
    )

    const clearFilters = () => clearAllFilters(setSearchParams)

    return (
        <ListViewLayout
            title="All Pages"
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
            {loading ? (
                <LoadingGrid itemClassName="h-48" />
            ) : pages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pages.map(pageItem => (
                        <Link key={pageItem.id} to={`/page/${pageItem.slug}`} className="group">
                            <Card className="h-full overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/50 hover:bg-card">
                                <CardHeader className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(pageItem.created_at).toLocaleDateString()}
                                    </div>
                                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                        {pageItem.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 mt-2">
                                        {pageItem.excerpt || "Read more..."}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No pages found"
                    description="Try adjusting your filters"
                    onClear={clearFilters}
                />
            )}
        </ListViewLayout>
    )
}
