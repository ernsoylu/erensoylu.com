import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader2, FileText, File } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface SearchResult {
    id: string
    type: 'post' | 'page'
    title: string
    slug: string
    excerpt: string
}

export const SearchDialog = ({ mobile = false }: { mobile?: boolean }) => {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        if (!open) {
            setQuery("")
            setResults([])
        }
    }, [open])

    useEffect(() => {
        const search = async () => {
            if (query.trim().length === 0) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const { data, error } = await supabase.rpc('search_content', { keyword: query })
                if (error) throw error
                setResults(data || [])
            } catch (error) {
                console.error("Search error:", error)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(search, 300)
        return () => clearTimeout(debounce)
    }, [query])

    const handleSelect = (result: SearchResult) => {
        setOpen(false)
        if (result.type === 'post') {
            // Assuming /posts/slug or just /slug structure. The user didn't specify post URL structure. 
            // Implementation plan said "Post Manager" but explicit public routes for posts weren't created yet? 
            // Wait, I haven't created a Post view page yet! 
            // I should route to /post/:slug or something.
            // For now I'll use /post/:slug.
            navigate(`/post/${result.slug}`)
        } else {
            navigate(`/${result.slug}`)
        }
    }

    if (mobile) {
        return (
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-background pl-8"
                    onFocus={() => setOpen(true)}
                />
                {/* Actual Dialog is separate to avoid nesting issues in sheet potentially, 
                 but for simplicity reusing the trigger logic might be tricky if we want the input *itself* to be the trigger.
                 Let's just use a button or make the input readonly and open dialog on click. */}
                <div className="absolute inset-0 cursor-pointer" onClick={() => setOpen(true)} />
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px] top-[20%] translate-y-0">
                        <DialogHeader>
                            <DialogTitle>Search</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Type to search..."
                                    className="pl-9"
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                                {!loading && results.length === 0 && query && <div className="text-center text-muted-foreground p-4">No results found.</div>}
                                {results.map(result => (
                                    <div
                                        key={result.id}
                                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                                        onClick={() => handleSelect(result)}
                                    >
                                        {result.type === 'post' ? <FileText className="h-4 w-4 mt-1 text-primary" /> : <File className="h-4 w-4 mt-1 text-secondary" />}
                                        <div>
                                            <div className="font-medium">{result.title}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{result.excerpt}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <div className="flex h-9 w-48 items-center rounded-full border border-input bg-background pl-9 pr-4 text-sm text-muted-foreground shadow-sm group-hover:bg-accent group-hover:text-accent-foreground">
                        <span className="hidden lg:inline-flex">Search...</span>
                        <span className="inline-flex lg:hidden">Search...</span>
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">CMD</span>K
                        </kbd>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] top-[20%] translate-y-0">
                <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="pl-9"
                        />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-1">
                        {loading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                        {!loading && results.length === 0 && query && <div className="text-center text-muted-foreground p-4">No results found.</div>}
                        {results.map(result => (
                            <div
                                key={result.id}
                                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                                onClick={() => handleSelect(result)}
                            >
                                {result.type === 'post' ? <FileText className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-secondary" />}
                                <div>
                                    <div className="font-medium">{result.title}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">{result.excerpt}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
