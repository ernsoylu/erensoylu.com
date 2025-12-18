import type { SetURLSearchParams } from "react-router-dom"

type UpdateOptions = {
  resetPageKey?: string
  deleteIfValueIn?: Record<string, string[]>
}

export function updateListSearchParams(
  searchParams: URLSearchParams,
  setSearchParams: SetURLSearchParams,
  key: string,
  value: string,
  options: UpdateOptions = {}
) {
  const newParams = new URLSearchParams(searchParams)
  const deleteIfValueIn = options.deleteIfValueIn ?? {}
  const valuesToDelete = deleteIfValueIn[key] ?? []

  if (!value || valuesToDelete.includes(value)) {
    newParams.delete(key)
  } else {
    newParams.set(key, value)
  }

  const resetPageKey = options.resetPageKey ?? "page"
  if (key !== resetPageKey) newParams.set(resetPageKey, "1")

  setSearchParams(newParams)
}

export function clearAllFilters(setSearchParams: SetURLSearchParams) {
  setSearchParams(new URLSearchParams())
}

export function getPageParam(searchParams: URLSearchParams) {
  return Number.parseInt(searchParams.get("page") || "1")
}

