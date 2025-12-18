import { useEffect, useState } from "react"

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    const hasWindow = globalThis.window !== undefined
    return hasWindow ? globalThis.window.innerWidth < breakpoint : false
  })

  useEffect(() => {
    const onResize = () => setIsMobile(globalThis.window.innerWidth < breakpoint)
    globalThis.window.addEventListener("resize", onResize)
    return () => globalThis.window.removeEventListener("resize", onResize)
  }, [breakpoint])

  return isMobile
}
