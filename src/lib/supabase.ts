import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing. Check your environment variables in Vercel.")
    console.error("VITE_SUPABASE_URL:", supabaseUrl)
    console.error("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "SET" : "MISSING")
    throw new Error("Missing Supabase environment variables. Please check Vercel settings.")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
