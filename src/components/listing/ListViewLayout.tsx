import type * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type SortOption = { value: string; label: string }

type PaginationProps = {
  page: number
  totalCount: number
  pageSize: number
  onPageChange: (nextPage: number) => void
}

function Pagination({ page, totalCount, pageSize, onPageChange }: PaginationProps) {
  if (totalCount <= pageSize) return null
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex justify-center gap-2 pt-4">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <div className="flex items-center px-4 text-sm font-medium">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

type ListViewLayoutProps = {
  title: string
  sidebar: React.ReactNode
  sortOrder: string
  sortOptions: SortOption[]
  onSortChange: (value: string) => void
  pagination: PaginationProps
  children: React.ReactNode
}

export function ListViewLayout({
  title,
  sidebar,
  sortOrder,
  sortOptions,
  onSortChange,
  pagination,
  children,
}: ListViewLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">{sidebar}</aside>

        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <Select value={sortOrder} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {children}

          <Pagination {...pagination} />
        </div>
      </div>
    </div>
  )
}

type SearchSectionProps = {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}

export function SidebarSection({ icon, title, children }: SearchSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  )
}

type EmptyStateProps = {
  title: string
  description: string
  onClear: () => void
  actionLabel?: string
}

export function EmptyState({
  title,
  description,
  onClear,
  actionLabel = "Clear all filters",
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-muted/30 rounded-2xl border-dashed border-2">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      <Button variant="link" onClick={onClear} className="mt-2">
        {actionLabel}
      </Button>
    </div>
  )
}

type LoadingGridProps = {
  itemCount?: number
  itemClassName: string
}

export function LoadingGrid({ itemCount = 6, itemClassName }: LoadingGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: itemCount }, (_, index) => (
        <div key={index} className={`${itemClassName} bg-muted rounded-xl animate-pulse`} />
      ))}
    </div>
  )
}

