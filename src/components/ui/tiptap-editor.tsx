import { useEditor, EditorContent } from '@tiptap/react'
import 'highlight.js/styles/github-dark.css' // Syntax highlighting theme
import StarterKit from '@tiptap/starter-kit'
// Link and Underline are included in StarterKit
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { ToolbarButton } from './ToolbarButton'
import { createCodeBlockExtension, createResizableImageExtension } from './tiptap-extensions'

import {
    Bold,
    Italic,
    Strikethrough,
    Underline as UnderlineIcon,
    Code,
    List,
    ListOrdered,
    ListTodo,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Highlighter,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Minus
} from "lucide-react"
import { useState, useCallback } from 'react'
import { FileManagerModal } from '../admin/FileManagerModal'

interface TiptapEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export const TiptapEditor = ({ content, onChange, placeholder = "Start typing..." }: TiptapEditorProps) => {
    const [modalOpen, setModalOpen] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default code block to use CodeBlockLowlight instead
            }),
            createCodeBlockExtension(),
            createResizableImageExtension(),
            // Link and Underline are included in StarterKit
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Subscript,
            Superscript,
            Highlight,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none mx-auto focus:outline-none h-full',
            },
        },
    })

    const setLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        const url = globalThis.window.prompt('URL', previousUrl)

        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const addImage = (url: string) => {
        if (!editor) return
        editor.chain().focus().setImage({ src: url }).run()
    }

    if (!editor) return null



    return (
        <div className="space-y-2 border rounded-md overflow-hidden bg-background">
            <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10">
                {/* History */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} label="Undo" />
                    <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} label="Redo" />
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        icon={Heading1}
                        label="H1"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={Heading2}
                        label="H2"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        icon={Heading3}
                        label="H3"
                    />
                </div>

                {/* Formatting */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={Bold}
                        label="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={Italic}
                        label="Italic"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        icon={UnderlineIcon}
                        label="Underline"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        icon={Strikethrough}
                        label="Strikethrough"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        isActive={editor.isActive('highlight')}
                        icon={Highlighter}
                        label="Highlight"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        icon={Code}
                        label="Code Block"
                    />
                </div>

                {/* Script */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        icon={SubscriptIcon}
                        label="Subscript"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        icon={SuperscriptIcon}
                        label="Superscript"
                    />
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1 hidden sm:flex">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        icon={AlignLeft}
                        label="Align Left"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        icon={AlignCenter}
                        label="Align Center"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        icon={AlignRight}
                        label="Align Right"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        icon={AlignJustify}
                        label="Justify"
                    />
                </div>

                {/* Lists & More */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={List}
                        label="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={ListOrdered}
                        label="Ordered List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive('taskList')}
                        icon={ListTodo}
                        label="Task List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon={Quote}
                        label="Blockquote"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        isActive={false}
                        icon={Minus}
                        label="Horizontal Rule"
                    />
                </div>

                <div className="flex-1" />

                {/* Media */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={setLink}
                        isActive={editor.isActive('link')}
                        icon={LinkIcon}
                        label="Link"
                    />
                    <ToolbarButton
                        onClick={() => setModalOpen(true)}
                        isActive={false}
                        icon={ImageIcon}
                        label="Image"
                    />
                </div>

            </div>

            <div className="p-4 bg-background h-[500px] min-h-[300px] w-full overflow-y-auto resize-y">
                <EditorContent editor={editor} className="h-full" />
            </div>

            <FileManagerModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSelect={addImage}
            />
        </div>
    )
}
