
import { createClient } from "@supabase/supabase-js"
import fs from "node:fs"
import path from "node:path"

const envPath = path.resolve(process.cwd(), ".env")
const envContent = fs.readFileSync(envPath, "utf-8")
const env: Record<string, string> = {}

envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=")
    if (key && value) {
        env[key.trim()] = value.trim()
    }
})

const supabaseUrl = env["VITE_SUPABASE_URL"]
const supabaseKey = env["VITE_SUPABASE_ANON_KEY"]

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Checking Pages...")
const { data: pages, error: pageError } = await supabase
    .from("pages")
    .select("id, title, slug")
    .ilike("title", "%About%")

if (pageError) console.error("Page Error:", pageError)
else console.log("Pages found matching 'About':", pages)

console.log("\nChecking RPC search_content...")
const { data: searchResults, error: rpcError } = await supabase.rpc('search_content', { keyword: 'About' })

if (rpcError) console.error("RPC Error:", rpcError)
else console.log("RPC Results:", searchResults)
