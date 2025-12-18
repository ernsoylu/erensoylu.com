import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Upload, Grid3x3, List, FolderOpen, Image as ImageIcon,
    File, Search, ArrowLeft, Check
} from "lucide-react"

interface FileObject {
    name: string
    id: string
    metadata?: Record<string, unknown>
}

interface FileManagerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (url: string) => void
}

export const FileManagerModal = ({ open, onOpenChange, onSelect }: FileManagerModalProps) => {
    const [files, setFiles] = useState<FileObject[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [currentPath, setCurrentPath] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    const BUCKET_NAME = "media"

    const fetchFiles = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(currentPath, {
                    limit: 1000,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' }
                })

            if (error) throw error
            setFiles(data || [])
        } catch (error) {
            console.error("Error fetching files:", error)
        } finally {
            setLoading(false)
        }
    }, [currentPath])

    useEffect(() => {
        if (open) {
            fetchFiles()
        }
    }, [open, fetchFiles])



    const handleUpload = async (fileList: FileList) => {
        if (!fileList || fileList.length === 0) return

        setUploading(true)
        try {
            for (const file of fileList) {
                const timestamp = Date.now()
                const fileName = `${timestamp}_${file.name}`
                const filePath = currentPath ? `${currentPath}/${fileName}` : fileName

                const { error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(filePath, file)

                if (error) throw error
            }
            fetchFiles()
        } catch (error) {
            console.error("Error uploading file:", error)
            alert("Error uploading file!")
        } finally {
            setUploading(false)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleUpload(e.target.files)
            e.target.value = ""
        }
    }

    const getPublicUrl = (fileName: string) => {
        const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath)
        return data.publicUrl
    }

    const navigateToFolder = (folderName: string) => {
        setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName)
    }

    const navigateUp = () => {
        const parts = currentPath.split('/')
        parts.pop()
        setCurrentPath(parts.join('/'))
    }

    const handleSelect = () => {
        if (selectedFile) {
            const url = getPublicUrl(selectedFile)
            onSelect(url)
            onOpenChange(false)
            setSelectedFile(null)
            setCurrentPath('')
        }
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const folders = filteredFiles.filter(f => !f.metadata)
    const regularFiles = filteredFiles.filter(f => f.metadata)

    let filePickerContent: React.ReactNode
    if (loading) {
        filePickerContent = <div className="flex items-center justify-center h-64">Loading...</div>
    } else if (filteredFiles.length === 0) {
        filePickerContent = (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Upload className="w-12 h-12 mb-4" />
                <p>No files found. Upload some images!</p>
            </div>
        )
    } else if (viewMode === 'grid') {
        filePickerContent = (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        type="button"
                        className="bg-card text-card-foreground rounded-xl border shadow-sm p-4 hover:bg-muted/50 transition-colors"
                        onClick={() => navigateToFolder(folder.name)}
                        aria-label={`Open ${folder.name} folder`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <FolderOpen className="w-12 h-12 text-primary" />
                            <span className="text-sm truncate w-full text-center">{folder.name}</span>
                        </div>
                    </button>
                ))}
                {regularFiles.map((file) => {
                    const url = getPublicUrl(file.name)
                    const isImage = (file.metadata as { mimetype?: string })?.mimetype?.startsWith("image/") ||
                        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                    const isSelected = selectedFile === file.name

                    return (
                        <button
                            key={file.id}
                            type="button"
                            className={`bg-card text-card-foreground rounded-xl border shadow-sm cursor-pointer transition-all overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''
                                }`}
                            onClick={() => setSelectedFile(file.name)}
                            aria-pressed={isSelected}
                            aria-label={`Select ${file.name}`}
                        >
                            <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                                {isImage ? (
                                    <img src={url} alt={file.name} className="object-cover w-full h-full" />
                                ) : (
                                    <File className="w-12 h-12 text-muted-foreground" />
                                )}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <Check className="w-8 h-8 text-primary" />
                                    </div>
                                )}
                            </div>
                            <div className="p-2">
                                <div className="text-xs truncate" title={file.name}>{file.name}</div>
                            </div>
                        </button>
                    )
                })}
            </div>
        )
    } else {
        filePickerContent = (
            <div className="space-y-1">
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        type="button"
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg text-left"
                        onClick={() => navigateToFolder(folder.name)}
                        aria-label={`Open ${folder.name} folder`}
                    >
                        <FolderOpen className="w-5 h-5 text-primary" />
                        <span className="flex-1">{folder.name}</span>
                    </button>
                ))}
                {regularFiles.map((file) => {
                    const isImage = (file.metadata as { mimetype?: string })?.mimetype?.startsWith("image/")
                    const isSelected = selectedFile === file.name

                    return (
                        <button
                            key={file.id}
                            type="button"
                            className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg text-left ${isSelected ? 'bg-primary/10' : ''
                                }`}
                            onClick={() => setSelectedFile(file.name)}
                            aria-pressed={isSelected}
                        >
                            {isImage ? <ImageIcon className="w-5 h-5" /> : <File className="w-5 h-5" />}
                            <span className="flex-1 truncate">{file.name}</span>
                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                        </button>
                    )
                })}
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentPath && (
                                <Button variant="outline" size="sm" onClick={navigateUp}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}
                            <div className="text-sm text-muted-foreground">
                                /{currentPath || 'root'}
                            </div>
                        </div>
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                            <TabsList>
                                <TabsTrigger value="grid"><Grid3x3 className="w-4 h-4" /></TabsTrigger>
                                <TabsTrigger value="list"><List className="w-4 h-4" /></TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Search & Upload */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <label htmlFor="media-upload">
                            <Button disabled={uploading} asChild>
                                <span className="cursor-pointer">
                                    <Upload className="w-4 h-4 mr-2" />
                                    {uploading ? "Uploading..." : "Upload"}
                                </span>
                            </Button>
                        </label>
                        <input
                            id="media-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>

                    {/* File Grid */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-4">
                        {filePickerContent}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSelect} disabled={!selectedFile}>
                            Insert Image
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
