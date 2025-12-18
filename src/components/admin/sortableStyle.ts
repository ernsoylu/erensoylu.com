import { CSS } from "@dnd-kit/utilities"
import type { Transform } from "@dnd-kit/utilities"

export function getSortableStyle(
  transform: Transform | null,
  transition: string | undefined,
  isDragging: boolean
) {
  return {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  }
}

