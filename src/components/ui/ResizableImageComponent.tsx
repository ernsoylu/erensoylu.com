import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ResizableImageComponent = (props: NodeViewProps) => {
    const { node, updateAttributes, selected } = props
    const [resizing, setResizing] = useState(false)
    const [localWidth, setLocalWidth] = useState<string>(node.attrs.width || '100%')
    const imgRef = useRef<HTMLImageElement>(null)
    const [startX, setStartX] = useState(0)
    const [startWidth, setStartWidth] = useState(0)

    const align = node.attrs.align || 'center'
    // Use local width during resize for smooth interactions, otherwise source of truth is the node
    const width = resizing ? localWidth : (node.attrs.width || '100%')

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        setResizing(true)
        setStartX(e.clientX)
        // Reset local width to current actual width to start fresh
        setLocalWidth(node.attrs.width || '100%')
        if (imgRef.current) {
            setStartWidth(imgRef.current.offsetWidth)
        }
    }

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!resizing) return

        const currentX = e.clientX
        const diff = currentX - startX
        const newWidth = startWidth + diff

        // Update local state for smooth feedback
        setLocalWidth(`${newWidth}px`)
    }, [resizing, startX, startWidth])

    const onMouseUp = useCallback(() => {
        if (resizing) {
            setResizing(false)
            // Persist the final width to the document
            updateAttributes({ width: localWidth })
        }
    }, [resizing, localWidth, updateAttributes])

    useEffect(() => {
        if (resizing) {
            globalThis.window.addEventListener('mousemove', onMouseMove)
            globalThis.window.addEventListener('mouseup', onMouseUp)
        } else {
            globalThis.window.removeEventListener('mousemove', onMouseMove)
            globalThis.window.removeEventListener('mouseup', onMouseUp)
        }

        return () => {
            // Cleanup
            globalThis.window.removeEventListener('mousemove', onMouseMove)
            globalThis.window.removeEventListener('mouseup', onMouseUp)
        }
    }, [resizing, onMouseMove, onMouseUp])

    // Compute styles based on alignment
    const getStyle = () => {
        const baseStyle: React.CSSProperties = {
            width: width,
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
        }

        if (align === 'left') {
            baseStyle.float = 'left'
            baseStyle.marginRight = '1rem'
            baseStyle.marginBottom = '0.5rem'
        } else if (align === 'right') {
            baseStyle.float = 'right'
            baseStyle.marginLeft = '1rem'
            baseStyle.marginBottom = '0.5rem'
        } else {
            // center
            baseStyle.margin = '0 auto 1.5rem auto'
        }

        return baseStyle
    }

    return (
        <NodeViewWrapper className="image-view relative inline-block my-4 w-full" style={{
            textAlign: align === 'center' ? 'center' : 'left', // Helper for center block
            display: align === 'center' ? 'block' : 'inline-block' // inline-block for floats
        }}>
            <div className="relative inline-block" style={align === 'center' ? { maxWidth: '100%', width: width } : {}}>
                {/* Alignment Toolbar */}
                {props.editor.isEditable && selected && !resizing && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/70 backdrop-blur-sm rounded-md p-1 shadow-md z-20">
                        <Button
                            variant={align === 'left' ? 'secondary' : 'ghost'}
                            size="icon"
                            type="button"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                updateAttributes({ align: 'left' })
                            }}
                            title="Align Left (Wrap)"
                        >
                            <AlignLeft className="h-3 w-3 text-white" />
                        </Button>
                        <Button
                            variant={align === 'center' ? 'secondary' : 'ghost'}
                            size="icon"
                            type="button"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                updateAttributes({ align: 'center' })
                            }}
                            title="Align Center"
                        >
                            <AlignCenter className="h-3 w-3 text-white" />
                        </Button>
                        <Button
                            variant={align === 'right' ? 'secondary' : 'ghost'}
                            size="icon"
                            type="button"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                updateAttributes({ align: 'right' })
                            }}
                            title="Align Right (Wrap)"
                        >
                            <AlignRight className="h-3 w-3 text-white" />
                        </Button>
                    </div>
                )}

                <img
                    ref={imgRef}
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    style={getStyle()}
                    className={`transition-shadow ${selected ? 'opacity-90' : ''}`}
                />

                {/* Resize Handle */}
                {(props.editor.isEditable && (selected || resizing)) && (
                    <div
                        className="absolute right-0 bottom-0 w-3 h-3 bg-primary rounded-full cursor-ew-resize translate-x-1/2 translate-y-1/2 shadow-sm z-10 hover:scale-125 transition-transform"
                        onMouseDown={onMouseDown}
                        title="Drag to resize"
                        style={align === 'left' || align === 'right' ? { position: 'absolute' } : {}}
                    />
                )}
            </div>
        </NodeViewWrapper>
    )
}
