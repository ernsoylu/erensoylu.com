import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function useIsAdminSession() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
  }, [])

  return isAdmin
}

