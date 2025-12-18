import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import 'highlight.js/styles/github-dark.css'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
// Link and Underline are included in StarterKit
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import julia from 'highlight.js/lib/languages/julia'
import sql from 'highlight.js/lib/languages/sql'
import java from 'highlight.js/lib/languages/java'
import kotlin from 'highlight.js/lib/languages/kotlin'
import { CodeBlockComponent } from './CodeBlockComponent'
import { ResizableImageComponent } from './ResizableImageComponent'
import { useEffect } from 'react'

// Create lowlight instance and register languages (same as editor)
const lowlight = createLowlight(common)
lowlight.register('c', c)
lowlight.register('cpp', cpp)
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('go', go)
lowlight.register('rust', rust)
lowlight.register('julia', julia)
lowlight.register('sql', sql)
lowlight.register('java', java)
lowlight.register('kotlin', kotlin)

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
            CodeBlockLowlight.configure({
                lowlight,
                defaultLanguage: 'javascript',
            }).extend({
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent)
                },
            }),

            Image.extend({
                addAttributes() {
                    return {
                        src: {
                            default: null,
                        },
                        alt: {
                            default: null,
                        },
                        title: {
                            default: null,
                        },
                        width: {
                            default: '100%',
                            renderHTML: attributes => {
                                return {
                                    width: attributes.width,
                                    style: `width: ${attributes.width}`
                                }
                            },
                        },
                        align: {
                            default: 'center',
                            renderHTML: attributes => {
                                return {
                                    'data-align': attributes.align,
                                }
                            },
                        },
                    }
                },
                addNodeView() {
                    return ReactNodeViewRenderer(ResizableImageComponent)
                },
            }),
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
