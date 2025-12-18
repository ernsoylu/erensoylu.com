import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("Deleting all posts...")
supabase.table("posts").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

print("Deleting all pages...")
supabase.table("pages").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

print("Cleanup complete.")
