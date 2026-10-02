import os
import re
import json
import asyncio
import aiohttp
import aiofiles
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright

# ==============================================================================
# 1. PROJECT PATHS CONFIGURATION (MAPPED TO NEXT.JS & PRISMA)
# ==============================================================================
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
PRISMA_DIR = os.path.join(PROJECT_ROOT, "prisma")
SEED_OUTPUT_FILE = os.path.join(PRISMA_DIR, "scraped_seed_data.json")

# Ensure required directories exist
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(PRISMA_DIR, exist_ok=True)

# ==============================================================================
# 2. BRAND REGISTRY & CATALOG DEFINITIONS
# ==============================================================================
BRAND_REGISTRY = {
    "cars": {
        "tata": {
            "name": "Tata Motors",
            "catalog_url": "https://cars.tatamotors.com",
            "model_selector": "a[href*='/cars/']",
        },
        "maruti": {
            "name": "Maruti Suzuki",
            "catalog_url": "https://www.marutisuzuki.com",
            "model_selector": "a[href*='/car-']",
        },
        "mahindra": {
            "name": "Mahindra Auto",
            "catalog_url": "https://auto.mahindra.com/suv",
            "model_selector": "a[href*='/suv/']",
        },
        "hyundai": {
            "name": "Hyundai India",
            "catalog_url": "https://www.hyundai.com/in/en/find-a-car",
            "model_selector": "a[href*='/find-a-car/']",
        }
    },
    "bikes": {
        "royal-enfield": {
            "name": "Royal Enfield",
            "catalog_url": "https://www.royalenfield.com/in/en/motorcycles/",
            "model_selector": "a[href*='/motorcycles/']",
        },
        "tvs": {
            "name": "TVS Motor",
            "catalog_url": "https://www.tvsmotor.com",
            "model_selector": "a[href*='/tvs-']",
        },
        "hero": {
            "name": "Hero MotoCorp",
            "catalog_url": "https://www.heromotocorp.com/en-in/motorcycles.html",
            "model_selector": "a[href*='/motorcycles/']",
        }
    }
}

# ==============================================================================
# 3. HELPER FUNCTIONS
# ==============================================================================
def slugify(text: str) -> str:
    """Converts title to URL-friendly lowercase slug."""
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def get_highest_res_url(img_src: str, srcset: str = "") -> str:
    """Removes downsampling parameters to extract original HD master assets."""
    target_url = img_src
    if srcset:
        candidates = []
        for part in srcset.split(","):
            tokens = part.strip().split()
            if len(tokens) == 2 and tokens[1].endswith("w"):
                try:
                    candidates.append((int(tokens[1][:-1]), tokens[0]))
                except ValueError:
                    pass
            elif len(tokens) >= 1:
                candidates.append((0, tokens[0]))
        if candidates:
            candidates.sort(key=lambda x: x[0], reverse=True)
            target_url = candidates[0][1]

    # Strip width/height restraints and force quality
    target_url = re.sub(r'([?&])(width|w|h|height|maxwidth)=\d+', r'\1', target_url)
    target_url = re.sub(r'([?&])q=\d+', r'\1q=100', target_url)
    target_url = target_url.replace("&&", "&").rstrip("?&")
    return target_url

async def download_image_to_public(session: aiohttp.ClientSession, url: str, dest_folder: str, filename: str) -> str:
    """Downloads binary file to public/ and returns relative URL path for Next.js."""
    os.makedirs(dest_folder, exist_ok=True)
    full_path = os.path.join(dest_folder, filename)

    if not os.path.exists(full_path):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as resp:
                if resp.status == 200:
                    async with aiofiles.open(full_path, "wb") as f:
                        await f.write(await resp.read())
        except Exception as e:
            print(f"    [!] Failed to download {url}: {e}")
            return ""

    # Return relative web path for Next.js <Image /> component
    relative_path = os.path.relpath(full_path, PUBLIC_DIR).replace("\\", "/")
    return f"/{relative_path}"

# ==============================================================================
# 4. VEHICLE EXTRACTOR & PRISMA DATA NORMALIZER
# ==============================================================================
async def scrape_vehicle(page, vehicle_url: str, category: str, brand_key: str, brand_name: str):
    print(f"\n[*] Extracting: {vehicle_url}")
    try:
        await page.goto(vehicle_url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_timeout(3000)
    except Exception as e:
        print(f"  [!] Timeout or load error: {e}")
        return None

    raw_title = await page.title()
    clean_name = raw_title.split("|")[0].split("-")[0].strip()
    model_slug = slugify(clean_name)
    
    # Destination directory inside Next.js public/ folder
    public_vehicle_dir = os.path.join(PUBLIC_DIR, "vehicles", category, brand_key, model_slug)

    # Scrape raw specs
    raw_specs = {}
    spec_rows = await page.locator("table tr, dl div, .spec-item, .specification-row").all()
    for row in spec_rows[:40]:
        text = await row.inner_text()
        parts = [p.strip() for p in text.split("\n") if p.strip()]
        if len(parts) >= 2 and len(parts[0]) < 40:
            raw_specs[parts[0].lower()] = parts[1]

    # Scrape variants
    variants_list = []
    variant_elements = await page.locator(".variant-name, .trim-name, [data-variant]").all()
    for v in variant_elements:
        v_name = (await v.inner_text()).strip()
        if v_name and v_name not in [var["name"] for var in variants_list]:
            variants_list.append({
                "name": v_name,
                "exShowroomPrice": 0.0,
                "onRoadPriceEst": 0.0,
                "transmission": "Manual",
                "keyFeatures": []
            })

    # Fallback variant if none detected on landing page
    if not variants_list:
        variants_list.append({
            "name": f"{clean_name} Standard",
            "exShowroomPrice": 0.0,
            "onRoadPriceEst": 0.0,
            "transmission": "Manual",
            "keyFeatures": ["Standard Safety Kit", "Digital Instrument Cluster"]
        })

    # Scrape HD images
    images_found = []
    for img in await page.locator("img").all():
        src = await img.get_attribute("src") or await img.get_attribute("data-src")
        srcset = await img.get_attribute("srcset") or ""
        alt = await img.get_attribute("alt") or clean_name
        if src and not src.startswith("data:"):
            full_url = urljoin(vehicle_url, src)
            hd_url = get_highest_res_url(full_url, srcset)
            if any(ext in hd_url.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                if not any(k in hd_url.lower() for k in ["logo", "icon", "arrow", "pixel"]):
                    images_found.append((hd_url, alt))

    unique_images = list({url: alt for url, alt in images_found}.items())[:8]

    downloaded_public_urls = []
    async with aiohttp.ClientSession(headers={"User-Agent": "Mozilla/5.0"}) as session:
        for idx, (img_url, alt) in enumerate(unique_images):
            ext = os.path.splitext(urlparse(img_url).path)[1] or ".jpg"
            filename = f"img_{idx + 1}{ext}"
            web_path = await download_image_to_public(session, img_url, public_vehicle_dir, filename)
            if web_path:
                downloaded_public_urls.append(web_path)

    hero_img = downloaded_public_urls[0] if downloaded_public_urls else "/placeholder-vehicle.jpg"

    # Structure data matching Prisma Vehicle model
    structured_record = {
        "brand": {
            "name": brand_name,
            "slug": brand_key,
            "vehicleType": "CAR" if category == "cars" else "BIKE"
        },
        "vehicle": {
            "name": clean_name,
            "slug": model_slug,
            "category": "CAR" if category == "cars" else "BIKE",
            "tagline": f"All-new {clean_name} with refined engineering and smart features.",
            "bodyType": "SUV" if category == "cars" else "Cruiser",
            "fuelTypes": ["Petrol"],
            "transmissionTypes": ["Manual", "Automatic"],
            "heroImage": hero_img,
            "priceMin": 8.0,
            "priceMax": 15.0,
            "budgetRange": "8_15" if category == "cars" else "1.5_2.5",
            "launchStatus": "LAUNCHED",
            "engineOrBattery": raw_specs.get("engine", raw_specs.get("displacement", "1199 cc")),
            "powerBhp": raw_specs.get("power", raw_specs.get("max power", "118 BHP")),
            "torqueNm": raw_specs.get("torque", raw_specs.get("max torque", "170 Nm")),
            "mileageOrRange": raw_specs.get("mileage", raw_specs.get("fuel efficiency", "18 kmpl")),
            "groundClearanceMm": 190,
            "seatingCapacity": 5 if category == "cars" else None,
            "bikeStyle": "Commuter" if category == "bikes" else None,
            "galleryImages": downloaded_public_urls,
            "variants": variants_list
        }
    }

    print(f"  [✔] Processed {clean_name} | {len(downloaded_public_urls)} images saved to public/vehicles/")
    return structured_record

# ==============================================================================
# 5. CLI MENU & MAIN EXECUTION FLOW
# ==============================================================================
async def main():
    print("=======================================================")
    print("  CARBIKEKHARIDO - PLAYWRIGHT SCRAPER & DB PREPARER   ")
    print("=======================================================")

    print("\nSelect Category:")
    print("  1. Cars Only")
    print("  2. Bikes Only")
    print("  3. Both (All Vehicles)")
    choice = input("Enter choice (1/2/3) [Default 3]: ").strip() or "3"

    categories = ["cars", "bikes"] if choice == "3" else (["cars"] if choice == "1" else ["bikes"])

    brands_map = {}
    for cat in categories:
        for b_key, b_info in BRAND_REGISTRY[cat].items():
            brands_map[f"{cat}:{b_key}"] = (cat, b_key, b_info)

    print("\nSelect Brands to Scrape:")
    keys_list = list(brands_map.keys())
    for i, k in enumerate(keys_list, 1):
        cat, b_key, b_info = brands_map[k]
        print(f"  {i}. {b_info['name']} ({cat.upper()})")
    print(f"  {len(keys_list) + 1}. Scrape ALL listed brands")

    b_select = input(f"Enter brand number(s) comma separated or {len(keys_list) + 1} for all: ").strip()

    chosen_keys = []
    if b_select == str(len(keys_list) + 1) or not b_select:
        chosen_keys = keys_list
    else:
        idxs = [int(x.strip()) for x in b_select.split(",") if x.strip().isdigit()]
        chosen_keys = [keys_list[idx - 1] for idx in idxs if 1 <= idx <= len(keys_list)]

    limit_input = input("\nModels to scrape per brand (e.g. 2, 5, or 'all') [Default 2]: ").strip() or "2"
    limit = 999 if limit_input.lower() == "all" else int(limit_input)

    scraped_dataset = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        for k in chosen_keys:
            cat, b_key, b_info = brands_map[k]
            print(f"\n--- Scanning Brand: {b_info['name']} ---")
            try:
                await page.goto(b_info["catalog_url"], wait_until="domcontentloaded", timeout=45000)
                await page.wait_for_timeout(3000)

                links = await page.locator(b_info["model_selector"]).all()
                model_urls = set()
                for l in links:
                    h = await l.get_attribute("href")
                    if h:
                        model_urls.add(urljoin(b_info["catalog_url"], h))

                selected_urls = list(model_urls)[:limit]
                print(f"Found {len(model_urls)} models. Scraping top {len(selected_urls)}...")

                for u in selected_urls:
                    data = await scrape_vehicle(page, u, cat, b_key, b_info["name"])
                    if data:
                        scraped_dataset.append(data)

            except Exception as err:
                print(f"[!] Error reading {b_info['name']}: {err}")

        await browser.close()

    # Save structured dataset to prisma/scraped_seed_data.json
    async with aiofiles.open(SEED_OUTPUT_FILE, "w", encoding="utf-8") as f:
        await f.write(json.dumps(scraped_dataset, indent=2, ensure_ascii=False))

    print("\n=======================================================")
    print(f"[✔] Successfully scraped {len(scraped_dataset)} vehicles!")
    print(f"[✔] Images stored in: public/vehicles/")
    print(f"[✔] Database seed saved in: prisma/scraped_seed_data.json")
    print("=======================================================")

if __name__ == "__main__":
    asyncio.run(main())