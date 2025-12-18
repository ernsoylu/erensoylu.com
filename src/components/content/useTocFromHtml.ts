import { useMemo } from "react"

export type TocItem = { id: string; text: string; level: number }

export function useTocFromHtml(html: string | undefined) {
  return useMemo(() => {
    if (!html) return { toc: [] as TocItem[], processedHtml: "" }

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const headings = doc.querySelectorAll("h1, h2, h3")
    const tocItems: TocItem[] = []

    headings.forEach((heading, index) => {
      const id = `heading-${index}`
      heading.id = id
      tocItems.push({
        id,
        text: heading.textContent || "",
        level: Number.parseInt(heading.tagName.substring(1)),
      })
    })

    return { toc: tocItems, processedHtml: doc.body.innerHTML }
  }, [html])
}

export function getTocItemClassName(level: number) {
  const base =
    "text-sm hover:text-primary transition-colors block py-0.5 border-l-2 -ml-[13px] pl-3"
  if (level === 1) return `${base} border-transparent font-medium text-foreground`
  if (level === 2) return `${base} border-transparent pl-5 text-muted-foreground`
  return `${base} border-transparent pl-7 text-muted-foreground/80`
}
