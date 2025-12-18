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

def upload_image(filepath):
    filename = os.path.basename(filepath)
    ts = int(time.time())
    path = f"real/{ts}_{filename}"
    
    with open(filepath, "rb") as f:
        supabase.storage.from_("media").upload(
            path=path,
            file=f,
            file_options={"content-type": "image/webp"}
        )
    return supabase.storage.from_("media").get_public_url(path)

def create_post(title, content, image_path, category_name="General"):
    # 1. Upload Image
    print(f"Uploading image: {image_path}")
    image_url = upload_image(image_path)
    print(f"Image uploaded: {image_url}")

    # 2. Get/Create Category
    # Try fetching by name
    cat_res = supabase.table("categories").select("*").eq("name", category_name).execute()
    if cat_res.data:
        cat_id = cat_res.data[0]['id']
    else:
        # Try fetching by slug
        slug = category_name.lower()
        cat_res = supabase.table("categories").select("*").eq("slug", slug).execute()
        if cat_res.data:
            cat_id = cat_res.data[0]['id']
        else:
            # Create
            try:
                res = supabase.table("categories").insert({"name": category_name, "slug": slug}).execute()
                cat_id = res.data[0]['id']
            except Exception as e:
                # Fallback if race condition or other error, fetch again
                print(f"Category creation failed, retrying fetch: {e}")
                cat_res = supabase.table("categories").select("*").eq("slug", slug).execute()
                if cat_res.data:
                    cat_id = cat_res.data[0]['id']
                else:
                    raise e

    # 3. Create Post
    slug = title.lower().replace(" ", "-").replace(":", "").replace("?", "")[0:50] + f"-{int(time.time())}"
    
    post_data = {
        "title": title,
        "slug": slug,
        "content": content,
        "excerpt": content[0:150] + "...",
        "image_url": image_url,
        "category_id": cat_id,
        "published": True
    }
    
    supabase.table("posts").insert(post_data).execute()
    print(f"Post created: {title}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--content", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--category", default="General")
    
    args = parser.parse_args()
    create_post(args.title, args.content, args.image, args.category)
