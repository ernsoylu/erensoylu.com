import { useEditor, EditorContent } from '@tiptap/react'
import 'highlight.js/styles/github-dark.css'
import StarterKit from '@tiptap/starter-kit'
// Link and Underline are included in StarterKit
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { useEffect } from 'react'
import { createCodeBlockExtension, createResizableImageExtension } from './tiptap-extensions'

interface TiptapRendererProps {
    content: string
}

export const TiptapRenderer = ({ content }: TiptapRendererProps) => {
    const editor = useEditor({
        editable: false, // Read-only mode
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                // Configure Link and Underline via StarterKit if they are included
                // or just let them use defaults if enabled by default. 
                // Based on grep, they are included. We can customize them here if needed.
            }),
            createCodeBlockExtension(),
            createResizableImageExtension(),
            // Link and Underline removed as they are in StarterKit
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Subscript,
            Superscript,
            Highlight,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            },
        },
    })

    // Update content if it changes externally (though usually static in these views)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return <EditorContent editor={editor} />
}
