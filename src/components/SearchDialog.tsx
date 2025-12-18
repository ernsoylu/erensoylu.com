import { useCallback, useEffect, useState } from "react"
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

export const SearchDialog = ({
    open: controlledOpen,
    onOpenChange
}: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Use controlled open if provided, otherwise use internal state
    const open = controlledOpen ?? internalOpen
    const isControlled = controlledOpen !== undefined

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }, [controlledOpen, onOpenChange])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleOpenChange(!open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [open, handleOpenChange])

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
        handleOpenChange(false)
        if (result.type === 'post') {
            navigate(`/post/${result.slug}`)
        } else {
            navigate(`/page/${result.slug}`)
        }
    }

    const dialogContent = (
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
                        <button
                            key={result.id}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors w-full text-left"
                            onClick={() => handleSelect(result)}
                        >
                            {result.type === 'post' ? <FileText className="h-5 w-5 text-primary shrink-0" /> : <File className="h-5 w-5 text-secondary shrink-0" />}
                            <div>
                                <div className="font-medium">{result.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">{result.excerpt}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </DialogContent>
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <button
                        className="inline-flex items-center justify-center rounded-full p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
                        title="Search"
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </button>
                </DialogTrigger>
            )}
            {dialogContent}
        </Dialog>
    )
}
