import type * as React from "react"

type AdminManagerHeaderProps = {
  title: string
  description: string
  action: React.ReactNode
}

export function AdminManagerHeader({
  title,
  description,
  action,
}: AdminManagerHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      {action}
    </div>
  )
}

