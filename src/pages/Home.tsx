import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Render, type Data } from "@measured/puck"
import { config } from "@/components/puck/puck.config"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export const Home = () => {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLayout = async () => {
      const { data: settings } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'puck_home')
        .single()

      if (settings?.value) {
        setData(settings.value)
      }
      setLoading(false)
    }
    fetchLayout()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!data || data.content.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome</h1>
        <p className="text-muted-foreground mb-8">This page layout is managed via the Admin Dashboard.</p>
        <Button asChild><Link to="/posts">Read Blog</Link></Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Render config={config} data={data} />
    </div>
  )
}
