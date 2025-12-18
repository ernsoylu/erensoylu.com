import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const CodeBlockComponent = ({ node, updateAttributes }: any) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(node.textContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const languages = [
        'javascript', 'typescript', 'python', 'java', 'kotlin',
        'c', 'cpp', 'go', 'rust', 'julia', 'sql', 'html', 'css'
    ]

    return (
        <NodeViewWrapper className="code-block-wrapper my-4">
            <div className="relative rounded-lg overflow-hidden border border-border bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <select
                        value={node.attrs.language || 'javascript'}
                        onChange={(e) => updateAttributes({ language: e.target.value })}
                        className="bg-gray-700 text-gray-200 text-sm rounded px-2 py-1 border-none outline-none cursor-pointer"
                        contentEditable={false}
                    >
                        {languages.map(lang => (
                            <option key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </option>
                        ))}
                    </select>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyToClipboard}
                        className="h-7 text-gray-300 hover:text-white hover:bg-gray-700"
                        contentEditable={false}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* Code Content */}
                <pre className="p-4 overflow-x-auto">
                    <NodeViewContent className="language-{node.attrs.language}" />
                </pre>
            </div>
        </NodeViewWrapper>
    )
}
