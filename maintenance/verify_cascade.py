import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def verify_cascade():
    # 1. Create Test Page
    print("Creating Test Page...")
    page_res = supabase.table("pages").insert({
        "title": "To Delete",
        "slug": "to-delete",
        "content": "Delete me"
    }).execute()
    page_id = page_res.data[0]['id']
    print(f"Page created: {page_id}")

    # 2. Create Menu Item
    print("Creating Menu Item...")
    menu_res = supabase.table("navbar_items").insert({
        "label": "Delete Me Link",
        "path": "/page/to-delete",
        "sort_order": 999
    }).execute()
    menu_id = menu_res.data[0]['id']
    print(f"Menu Item created: {menu_id}")

    # 3. Verify Existence
    menu_check = supabase.table("navbar_items").select("*").eq("id", menu_id).execute()
    if not menu_check.data:
        print("ERROR: Menu item creation failed")
        return

    # 4. Delete Page
    print("Deleting Page...")
    supabase.table("pages").delete().eq("id", page_id).execute()
    
    # 5. Check Menu Item
    print("Checking Menu Item (should be gone)...")
    time.sleep(1) # Give trigger a moment (though it's usually immediate in same txn, Supabase HTTP might vary)
    final_check = supabase.table("navbar_items").select("*").eq("id", menu_id).execute()
    
    if not final_check.data:
        print("SUCCESS: Menu item was automatically deleted!")
    else:
        print("FAILURE: Menu item still exists.")
        # Cleanup
        supabase.table("navbar_items").delete().eq("id", menu_id).execute()

if __name__ == "__main__":
    verify_cascade()
