import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface LinkSelectorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (path: string, label?: string) => void
}

type Tab = "post" | "page" | "url"

export const LinkSelectorModal = ({ open, onOpenChange, onSelect }: LinkSelectorModalProps) => {
    const [activeTab, setActiveTab] = useState<Tab>("post")
    const [searchQuery, setSearchQuery] = useState("")
    const [urlInput, setUrlInput] = useState("")

    // Data state
    const [posts, setPosts] = useState<{ id: string, title: string, slug: string, created_at: string }[]>([])
    const [pages, setPages] = useState<{ id: string, title: string, slug: string, created_at: string }[]>([])
    const [loading, setLoading] = useState(false)

    // Selection state
    const [selectedItem, setSelectedItem] = useState<{ path: string, label: string } | null>(null)

    useEffect(() => {
        if (open) {
            fetchContent()
        }
    }, [open])

    const fetchContent = async () => {
        setLoading(true)
        try {
            const [postsRes, pagesRes] = await Promise.all([
                supabase.from("posts").select("id, title, slug, created_at").eq("published", true).order("created_at", { ascending: false }),
                supabase.from("pages").select("id, title, slug, created_at").order("created_at", { ascending: false })
            ])
            setPosts(postsRes.data || [])
            setPages(pagesRes.data || [])
        } catch (error) {
            console.error("Error fetching content:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredContent = (activeTab === "post" ? posts : pages).filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleApply = () => {
        if (activeTab === "url") {
            if (!urlInput) return
            onSelect(urlInput)
            onOpenChange(false)
            return
        }

        if (!selectedItem) return
        onSelect(selectedItem.path, selectedItem.label)
        onOpenChange(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background w-full max-w-4xl rounded-xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Select Link Target</h2>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 min-h-0">
                    {/* Left Sidebar: Type Selection */}
                    <div className="w-48 border-r bg-muted/20 p-4 space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground font-semibold px-2 mb-2 block">Link Type</Label>
                        <button
                            onClick={() => { setActiveTab("post"); setSelectedItem(null); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "post" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => { setActiveTab("page"); setSelectedItem(null); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "page" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                            Pages
                        </button>
                        <button
                            onClick={() => { setActiveTab("url"); setSelectedItem(null); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        >
                            Custom URL
                        </button>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">

                        {/* Search Bar (Only for Post/Page) */}
                        {activeTab !== "url" && (
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search ${activeTab === "post" ? "posts" : "pages"}...`}
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content List or URL Input */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === "url" ? (
                                <div className="space-y-4 max-w-lg mx-auto mt-8">
                                    <div className="space-y-2">
                                        <Label>Destination URL</Label>
                                        <Input
                                            placeholder="https://example.com"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            autoFocus
                                        />
                                        <p className="text-xs text-muted-foreground">Enter external links (starting with http://) or internal paths (starting with /).</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {loading ? (
                                        <div className="text-center py-8 text-muted-foreground">Loading contents...</div>
                                    ) : filteredContent.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No matches found.</div>
                                    ) : (
                                        filteredContent.map(item => {
                                            const path = activeTab === "post" ? `/post/${item.slug}` : `/page/${item.slug}`
                                            const isSelected = selectedItem?.path === path

                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedItem({ path, label: item.title })}
                                                    className={`p-3 rounded-lg border cursor-pointer hover:border-primary transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-sm">{item.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono truncate max-w-[150px]">{path}</div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t bg-muted/5 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                onClick={handleApply}
                                disabled={activeTab === "url" ? !urlInput : !selectedItem}
                            >
                                Apply Selection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
