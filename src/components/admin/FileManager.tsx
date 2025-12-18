import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Upload, Trash2, Copy, Check, Grid3x3, List, FolderOpen,
    Image as ImageIcon, File, Search, ArrowLeft, Download, FolderPlus
} from "lucide-react"

interface FileObject {
    name: string
    id: string
    updated_at: string
    created_at: string
    metadata?: Record<string, unknown>
}

export const FileManager = () => {
    const [files, setFiles] = useState<FileObject[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [currentPath, setCurrentPath] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const [dragActive, setDragActive] = useState(false)
    const [showCreateFolder, setShowCreateFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [draggedItem, setDraggedItem] = useState<string | null>(null)
    const [dropTarget, setDropTarget] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const BUCKET_NAME = "media"

    useEffect(() => {
        const fetchFiles = async () => {
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
        }
        fetchFiles()
    }, [currentPath])

    const fetchFiles = async () => {
        // Exposed for other functions to refresh
        const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .list(currentPath, {
                limit: 1000,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            })
        setFiles(data || [])
    }

    const handleUpload = async (fileList: FileList) => {
        if (!fileList || fileList.length === 0) return

        setUploading(true)
        try {
            for (const file of fileList) {
                // Preserve original filename, but add timestamp prefix to avoid conflicts
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

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files)
        }
    }

    const handleDelete = async (fileName: string) => {
        if (!confirm("Are you sure?")) return
        try {
            const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName
            const { error } = await supabase.storage.from(BUCKET_NAME).remove([fullPath])
            if (error) throw error
            fetchFiles()
            selectedFiles.delete(fileName)
            setSelectedFiles(new Set(selectedFiles))
        } catch (error) {
            console.error("Error deleting file:", error)
        }
    }

    const handleBulkDelete = async () => {
        if (selectedFiles.size === 0 || !confirm(`Delete ${selectedFiles.size} files?`)) return
        try {
            const paths = Array.from(selectedFiles).map(name =>
                currentPath ? `${currentPath}/${name}` : name
            )
            const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths)
            if (error) throw error
            fetchFiles()
            setSelectedFiles(new Set())
        } catch (error) {
            console.error("Error deleting files:", error)
        }
    }

    const getPublicUrl = (fileName: string) => {
        const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName
        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath)
        return data.publicUrl
    }

    const handleCopyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const navigateToFolder = (folderName: string) => {
        setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName)
    }

    const navigateUp = () => {
        const parts = currentPath.split('/')
        parts.pop()
        setCurrentPath(parts.join('/'))
    }

    const toggleFileSelection = (fileName: string) => {
        const newSelected = new Set(selectedFiles)
        if (newSelected.has(fileName)) {
            newSelected.delete(fileName)
        } else {
            newSelected.add(fileName)
        }
        setSelectedFiles(newSelected)
    }

    const createFolder = async () => {
        if (!newFolderName.trim()) return

        try {
            // Create a placeholder file in the new folder (Supabase doesn't support empty folders)
            const folderPath = currentPath ? `${currentPath}/${newFolderName}/.keep` : `${newFolderName}/.keep`
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(folderPath, new Blob([''], { type: 'text/plain' }))

            if (error) throw error
            setShowCreateFolder(false)
            setNewFolderName('')
            fetchFiles()
        } catch (error) {
            console.error("Error creating folder:", error)
            alert("Error creating folder!")
        }
    }

    const moveItem = async (sourceName: string, targetFolder: string) => {
        try {
            const sourcePath = currentPath ? `${currentPath}/${sourceName}` : sourceName
            const targetPath = targetFolder ? `${targetFolder}/${sourceName}` : sourceName

            // Check if source is a folder by trying to list its contents
            const { data: sourceFiles } = await supabase.storage
                .from(BUCKET_NAME)
                .list(sourcePath)

            if (sourceFiles && sourceFiles.length > 0) {
                // It's a folder, move all files recursively
                for (const file of sourceFiles) {
                    const oldPath = `${sourcePath}/${file.name}`
                    const newPath = `${targetPath}/${file.name}`

                    const { data: fileData } = await supabase.storage
                        .from(BUCKET_NAME)
                        .download(oldPath)

                    if (fileData) {
                        await supabase.storage.from(BUCKET_NAME).upload(newPath, fileData)
                        await supabase.storage.from(BUCKET_NAME).remove([oldPath])
                    }
                }
            } else {
                // It's a file, move it
                const { data: fileData } = await supabase.storage
                    .from(BUCKET_NAME)
                    .download(sourcePath)

                if (fileData) {
                    await supabase.storage.from(BUCKET_NAME).upload(targetPath, fileData)
                    await supabase.storage.from(BUCKET_NAME).remove([sourcePath])
                }
            }

            fetchFiles()
        } catch (error) {
            console.error("Error moving item:", error)
            alert("Error moving item!")
        }
    }

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const folders = filteredFiles.filter(f => !f.metadata)
    const regularFiles = filteredFiles.filter(f => f.metadata)

    if (loading) return <div className="flex items-center justify-center h-64">Loading files...</div>

    const dragZoneClassName = `min-h-[400px] border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`

    let content: React.ReactNode
    if (filteredFiles.length === 0) {
        content = (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Upload className="w-12 h-12 mb-4" />
                <p>Drop files here or click Upload</p>
            </div>
        )
    } else if (viewMode === 'grid') {
        content = (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
                    <button
                        key={folder.id}
                        type="button"
                        className={`bg-card text-card-foreground rounded-xl border shadow-sm p-4 hover:bg-muted/50 transition-colors ${dropTarget === folder.name ? 'ring-2 ring-primary bg-primary/10' : ''
                            }`}
                        onClick={() => navigateToFolder(folder.name)}
                        aria-label={`Open ${folder.name} folder`}
                        draggable
                        onDragStart={(e) => {
                            e.stopPropagation()
                            setDraggedItem(folder.name)
                        }}
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDropTarget(folder.name)
                        }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (draggedItem && draggedItem !== folder.name) {
                                const targetPath = currentPath ? `${currentPath}/${folder.name}` : folder.name
                                moveItem(draggedItem, targetPath)
                            }
                            setDraggedItem(null)
                            setDropTarget(null)
                        }}
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
                    const isSelected = selectedFiles.has(file.name)
                    const checkboxId = `select-${file.id}`

                    return (
                        <Card
                            key={file.id}
                            className={`group relative overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                            draggable
                            onDragStart={(e) => {
                                e.stopPropagation()
                                setDraggedItem(file.name)
                            }}
                        >
                            <div className="relative">
                                <input
                                    id={checkboxId}
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleFileSelection(file.name)}
                                    className="sr-only peer"
                                    aria-label={`${isSelected ? "Deselect" : "Select"} ${file.name}`}
                                />
                                <label
                                    htmlFor={checkboxId}
                                    className="aspect-square bg-muted flex items-center justify-center cursor-pointer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2"
                                >
                                    {isImage ? (
                                        <img src={url} alt={file.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <File className="w-12 h-12 text-muted-foreground" />
                                    )}
                                </label>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="w-full h-full flex items-center justify-center gap-2 pointer-events-auto">
                                        <Button size="icon" variant="secondary" onClick={(e) => {
                                            e.stopPropagation()
                                            handleCopyUrl(url, file.id)
                                        }}>
                                            {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                        <Button size="icon" variant="secondary" onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(url, '_blank')
                                        }}>
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(file.name)
                                        }}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-xs truncate" title={file.name}>{file.name}</div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        )
    } else {
        content = (
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
                    const url = getPublicUrl(file.name)
                    const isImage = (file.metadata as { mimetype?: string })?.mimetype?.startsWith("image/")
                    const isSelected = selectedFiles.has(file.name)

                    return (
                        <div
                            key={file.id}
                            className={`flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg ${isSelected ? 'bg-primary/10' : ''
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFileSelection(file.name)}
                                className="w-4 h-4"
                            />
                            {isImage ? <ImageIcon className="w-5 h-5" /> : <File className="w-5 h-5" />}
                            <span className="flex-1 truncate">{file.name}</span>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" onClick={() => handleCopyUrl(url, file.id)}>
                                    {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => window.open(url, '_blank')}>
                                    <Download className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDelete(file.name)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                <div className="flex gap-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                        <TabsList>
                            <TabsTrigger value="grid"><Grid3x3 className="w-4 h-4" /></TabsTrigger>
                            <TabsTrigger value="list"><List className="w-4 h-4" /></TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCreateFolder(true)}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        New Folder
                    </Button>
                    <label htmlFor="file-upload">
                        <Button disabled={uploading} asChild>
                            <span className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                {uploading ? "Uploading..." : "Upload"}
                            </span>
                        </Button>
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    {selectedFiles.size > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete ({selectedFiles.size})
                        </Button>
                    )}
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={dragZoneClassName}
                role="button"
                tabIndex={0}
                aria-label="File upload drop zone"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        fileInputRef.current?.click()
                    }
                }}
            >
                {content}
            </div>

            {/* Create Folder Dialog */}
            {showCreateFolder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                        <Input
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && createFolder()}
                            autoFocus
                        />
                        <div className="flex gap-2 mt-4 justify-end">
                            <Button variant="outline" onClick={() => {
                                setShowCreateFolder(false)
                                setNewFolderName('')
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                                Create
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
