import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing. Check your environment variables in Vercel.")
    console.error("VITE_SUPABASE_URL:", supabaseUrl)
    console.error("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "SET" : "MISSING")
    // Do not throw here, as it crashes the entire app white screen.
    // Instead we let it fail gracefully later or init with dummy values to allow UI to render.
}

// Fallback to empty strings to prevent createClient from crashing immediately if libs check types
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
