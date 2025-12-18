import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog"
import { TiptapRenderer } from "@/components/ui/TiptapRenderer"
import { getTocItemClassName, type TocItem } from "./useTocFromHtml"

type ContentViewLayoutProps = {
  title: string
  backHref?: string
  backLabel?: string
  authorLabel?: string
  dateLabel: string
  date: string
  categoryName?: string | null
  toc: TocItem[]
  contentHtml: string
  heroImage?: { src: string; alt: string } | null
  isAdmin: boolean
  adminEditHref: string
  adminEditLabel: string
  onDeleteClick: () => void
  deleteDialog: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    onConfirm: () => void
  }
}

export function ContentViewLayout({
  title,
  backHref = "/",
  backLabel = "Back to Home",
  authorLabel = "Eren Soylu",
  dateLabel,
  date,
  categoryName,
  toc,
  contentHtml,
  heroImage,
  isAdmin,
  adminEditHref,
  adminEditLabel,
  onDeleteClick,
  deleteDialog,
}: Readonly<ContentViewLayoutProps>) {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <Link
        to={backHref}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
      </Link>

      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-8 md:mb-12 text-center md:text-left">
        {title}
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r pb-8 lg:pb-0 mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24 space-y-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Author
                </h4>
                <p className="font-medium text-foreground">{authorLabel}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {dateLabel}
                </h4>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(date).toLocaleDateString()}
                </div>
              </div>

              {categoryName ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Category
                  </h4>
                  <Badge variant="secondary" className="font-normal">
                    {categoryName}
                  </Badge>
                </div>
              ) : null}
            </div>

            {isAdmin ? (
              <div>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Admin
                </h4>
                <Link to={adminEditHref}>
                  <Button variant="outline" size="icon" title={adminEditLabel}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  title="Delete"
                  onClick={onDeleteClick}
                  className="ml-2"
                >
                  <Trash className="h-4 w-4" />
                </Button>
                <DeleteConfirmDialog {...deleteDialog} />
              </div>
            ) : null}

            {toc.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                  Table of Contents
                </h3>
                <nav className="flex flex-col space-y-1.5 border-l pl-3">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={getTocItemClassName(item.level)}
                      onClick={(e) => {
                        e.preventDefault()
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>
        </aside>

        <article className="flex-1 max-w-3xl min-w-0">
          {heroImage ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden mb-8 bg-muted">
              <img
                src={heroImage.src}
                alt={heroImage.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          <TiptapRenderer content={contentHtml} />
        </article>
      </div>
    </div>
  )
}
