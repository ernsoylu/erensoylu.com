import os
import random
import time
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from faker import Faker
from PIL import Image, ImageDraw, ImageFont
import io

# Load environment variables
load_dotenv()

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url:
    print("Error: VITE_SUPABASE_URL not found in .env")
    exit(1)

if not key:
    print("\n⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env")
    print("To bypass Row Level Security (RLS) for seeding, we need the Service Role Key.")
    print("You can find it in your Supabase Dashboard -> Project Settings -> API.")
    key = input("Please paste your SUPABASE_SERVICE_ROLE_KEY here: ").strip()
    if not key:
        print("No key provided. Exiting.")
        exit(1)

supabase: Client = create_client(url, key)
fake = Faker()

# Configuration
NUM_CATEGORIES = 5
NUM_POSTS = 10
NUM_PAGES = 10
BUCKET_NAME = "media"

def generate_image(width=1200, height=630, text="Image"):
    """Generates a random colored image with text."""
    color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    img = Image.new('RGB', (width, height), color=color)
    d = ImageDraw.Draw(img)
    
    # Simple text centering (requires default font if no font found, Pillow default is tiny)
    # Trying to load a better font or just use default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        font = ImageFont.load_default()
        
    # Draw text (simplified centering)
    d.text((width/2, height/2), text, fill=(255, 255, 255), anchor="mm", font=font)
    
    # Save to buffer
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=85)
    return buf.getvalue()

def upload_image(filename, data):
    """Uploads image bytes to Supabase Storage and returns public URL."""
    try:
        path = f"seed/{int(time.time())}_{filename}"
        supabase.storage.from_(BUCKET_NAME).upload(
            path=path,
            file=data,
            file_options={"content-type": "image/jpeg"}
        )
        # Get public URL
        # Correct way for supabase-py usually depends on version, let's try get_public_url
        return supabase.storage.from_(BUCKET_NAME).get_public_url(path)
    except Exception as e:
        print(f"Error uploading {filename}: {e}")
        return None

def seed_categories():
    print("Seeding Categories...")
    categories = []
    for _ in range(NUM_CATEGORIES):
        name = fake.unique.word().capitalize()
        try:
            res = supabase.table("categories").insert({
                "name": name,
                "slug": name.lower(),
                "parent_id": None
            }).execute()
            categories.append(res.data[0])
            print(f"  + Created Category: {name}")
        except Exception as e:
            print(f"  - Failed to create category {name}: {e}")
    return categories

def seed_posts(categories):
    print(f"\nSeeding {NUM_POSTS} Posts...")
    for i in range(NUM_POSTS):
        title = fake.sentence(nb_words=6).rstrip(".")
        slug = fake.slug() + f"-{int(time.time())}" # Ensure unique
        content = f"""
            <h2>{fake.sentence(nb_words=4)}</h2>
            <p>{fake.paragraph(nb_sentences=5)}</p>
            <p>{fake.paragraph(nb_sentences=3)}</p>
            <h3>{fake.sentence(nb_words=3)}</h3>
            <p>{fake.paragraph(nb_sentences=4)}</p>
            <ul>
                <li>{fake.sentence(nb_words=4)}</li>
                <li>{fake.sentence(nb_words=4)}</li>
                <li>{fake.sentence(nb_words=4)}</li>
            </ul>
        """
        category = random.choice(categories) if categories else None
        
        # Generate Image
        print(f"  > Generating image for '{title}'...")
        img_data = generate_image(text=title)
        img_url = upload_image(f"post_{i}.jpg", img_data)
        
        post_data = {
            "title": title,
            "slug": slug,
            "content": content,
            "excerpt": fake.sentence(nb_words=15),
            "category_id": category['id'] if category else None,
            "image_url": img_url,
            "published": True
        }
        
        try:
            supabase.table("posts").insert(post_data).execute()
            print(f"  + Created Post: {title}")
        except Exception as e:
            print(f"  - Failed to create post {title}: {e}")

def seed_pages():
    print(f"\nSeeding {NUM_PAGES} Pages...")
    for i in range(NUM_PAGES):
        title = fake.sentence(nb_words=3).rstrip(".")
        slug = fake.slug() + f"-{int(time.time())}"
        content = f"<p>{fake.paragraph(nb_sentences=10)}</p>"
        
        try:
            supabase.table("pages").insert({
                "title": title,
                "slug": slug,
                "content": content
            }).execute()
            print(f"  + Created Page: {title}")
        except Exception as e:
            print(f"  - Failed to create page {title}: {e}")

def main():
    print("--- Starting Seeding Process ---")
    # cats = seed_categories()
    
    # Fetch existing categories to assign to posts
    res = supabase.table("categories").select("*").execute()
    cats = res.data
    
    seed_posts(cats)
    # seed_pages()
    print("\n--- Seeding Complete! ---")

if __name__ == "__main__":
    main()
