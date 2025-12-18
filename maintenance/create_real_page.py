import os
import sys
import time
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def create_page(title, content):
    slug = title.lower().replace(" ", "-").replace(":", "").replace("?", "")[0:50] 
    
    # Check if exists (upsert logic ish)
    res = supabase.table("pages").select("id").eq("slug", slug).execute()
    if res.data:
        print(f"Page '{title}' already exists, skipping.")
        return

    page_data = {
        "title": title,
        "slug": slug,
        "content": content,
    }
    
    try:
        supabase.table("pages").insert(page_data).execute()
        print(f"Page created: {title}")
    except Exception as e:
        print(f"Error creating page {title}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--content", required=True)
    
    args = parser.parse_args()
    create_page(args.title, args.content)
