import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const CodeBlockComponent = ({ node, updateAttributes }: NodeViewProps) => {
    const [copied, setCopied] = useState(false)
    const lineCount = (node.textContent || '').split('\n').length

    const copyToClipboard = () => {
        navigator.clipboard.writeText(node.textContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const languages = [
        'javascript', 'typescript', 'python', 'java', 'kotlin',
        'c', 'cpp', 'go', 'rust', 'julia', 'sql', 'html', 'css'
    ]

    const currentLanguage = node.attrs.language || 'javascript'

    return (
        <NodeViewWrapper className="code-block-wrapper my-6">
            <div className="relative rounded-lg overflow-hidden border border-border bg-card shadow-sm">
                {/* Header with language and copy button */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                    <div className="flex items-center gap-3">
                        <select
                            value={currentLanguage}
                            onChange={(e) => updateAttributes({ language: e.target.value })}
                            className="bg-transparent text-muted-foreground text-sm font-medium rounded px-2 py-1 hover:text-foreground hover:bg-background/50 transition-colors uppercase outline-none cursor-pointer"
                            contentEditable={false}
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                        <span className="text-muted-foreground/50 text-xs select-none">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
                    </div>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyToClipboard}
                        className="h-7 px-2 text-muted-foreground hover:text-primary hover:bg-background/50 transition-colors"
                        contentEditable={false}
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 mr-1.5" />
                                Copy
                            </>
                        )}
                    </Button>
                </div>

                {/* Code content with line numbers */}
                <div className="flex relative bg-card">
                    {/* Line numbers */}
                    <div
                        className="select-none py-4 px-4 border-r border-border text-muted-foreground/40 text-sm font-mono leading-6 text-right min-w-[3.5rem]"
                        contentEditable={false}
                    >
                        {Array.from({ length: lineCount }, (_, i) => (
                            <div key={i + 1}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Code */}
                    <pre className="flex-1 p-0 m-0 overflow-x-auto bg-transparent">
                        <NodeViewContent className="block py-4 px-4 text-sm font-mono leading-6 text-foreground/90 tabular-nums" />
                    </pre>
                </div>
            </div>
        </NodeViewWrapper>
    )
}
