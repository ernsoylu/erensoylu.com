import { supabase } from "@/lib/supabase"

export function omitChildrenField<T extends object>(updates: T) {
  const dbUpdates = { ...updates } as Record<string, unknown>
  if ("children" in dbUpdates) {
    delete dbUpdates.children
  }
  return dbUpdates as Omit<T, "children">
}

export async function persistSortOrder(
  table: string,
  items: Array<{ id: string }>
) {
  for (const [index, item] of items.entries()) {
    await supabase.from(table).update({ sort_order: index }).eq("id", item.id)
  }
}

