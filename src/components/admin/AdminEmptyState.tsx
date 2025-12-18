type AdminEmptyStateProps = {
  message: string
}

export function AdminEmptyState({ message }: Readonly<AdminEmptyStateProps>) {
  return (
    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
      {message}
    </div>
  )
}
