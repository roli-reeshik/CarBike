import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog, simpledialog

def slugify(text: str) -> str:
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

def select_file(root, title, filetypes):
    root.update()
    path = filedialog.askopenfilename(title=title, filetypes=filetypes)
    return path.strip() if path else ""

def select_multiple_files(root, title, filetypes):
    root.update()
    paths = filedialog.askopenfilenames(title=title, filetypes=filetypes)
    return [p.strip() for p in paths if p.strip()]

def select_directory(root, title):
    root.update()
    path = filedialog.askdirectory(title=title)
    return path.strip() if path else ""

def main():
    root = tk.Tk()
    root.withdraw()  # Hide root window

    print("=" * 70)
    print("      CarBikeKharido - Universal Vehicle Asset Packager & Prompter")
    print("=" * 70)

    # 1. Project Root Directory
    print("\n[Step 1] Select your project workspace root directory...")
    project_root = select_directory(root, "Select App Root (e.g. D:\\Apps\\CarBikeKhardo_29_09_2026)")
    if not project_root:
        project_root = r"D:\Apps\CarBikeKhardo_29_09_2026"
    print(f" -> Project Root: {project_root}")

    # 2. Vehicle Basic Metadata
    category_input = input("\nEnter Vehicle Category [car/bike] (default 'car'): ").strip().lower()
    category = "bike" if category_input.startswith("b") else "car"
    category_folder = "cars" if category == "car" else "bikes"
    category_enum = "CAR" if category == "car" else "BIKE"

    brand_name = input("Enter Brand Name (e.g. Hyundai India, Honda Cars, Tata Motors): ").strip()
    if not brand_name:
        brand_name = "Hyundai India"
    brand_slug = slugify(input(f"Enter Brand Slug (press Enter for '{slugify(brand_name)}'): ").strip() or brand_name)

    vehicle_name = input("Enter Vehicle / Model Name (e.g. Hyundai Verna, Honda City): ").strip()
    if not vehicle_name:
        vehicle_name = "Hyundai Verna"
    vehicle_slug = slugify(input(f"Enter Model Slug (press Enter for '{slugify(vehicle_name)}'): ").strip() or vehicle_name)

    body_type = input("Enter Body Type (e.g. Sedan, Compact SUV, Sport, Cruiser): ").strip() or "Sedan"

    # Define canonical target folder
    target_dir = os.path.join(project_root, "public", "vehicles", category_folder, brand_slug, vehicle_slug)
    os.makedirs(target_dir, exist_ok=True)
    print(f"\n[+] Assets will be organized in:\n    {target_dir}")

    # 3. File Selection Dialogs
    print("\n[Step 3] Select Engine / Powertrain File (Excel or leave blank)...")
    engine_file = select_file(root, f"Select Engine Workbook for {vehicle_name}", [("Excel Files", "*.xlsx *.xls")])

    print("[Step 4] Select Features Matrix File (Excel or leave blank)...")
    features_file = select_file(root, f"Select Features Workbook for {vehicle_name}", [("Excel Files", "*.xlsx *.xls")])

    print("[Step 5] Select Price File (Excel or Text or leave blank)...")
    price_file = select_file(root, f"Select Price File for {vehicle_name}", [("Spreadsheets & Text", "*.xlsx *.xls *.txt")])

    print("[Step 6] Select Official Brochure PDF (or leave blank)...")
    brochure_file = select_file(root, f"Select Brochure PDF for {vehicle_name}", [("PDF Files", "*.pdf")])

    print("[Step 7] Select All Color Images (Select one or multiple PNG/JPG files)...")
    color_images = select_multiple_files(root, f"Select Color Images for {vehicle_name}", [("Images", "*.png *.jpg *.jpeg *.webp")])

    copied_files = []

    # Copy Workbooks & Document Files
    if engine_file and os.path.exists(engine_file):
        dest = os.path.join(target_dir, "Engine.xlsx")
        shutil.copy2(engine_file, dest)
        copied_files.append("Engine.xlsx")

    if features_file and os.path.exists(features_file):
        dest = os.path.join(target_dir, "Features.xlsx")
        shutil.copy2(features_file, dest)
        copied_files.append("Features.xlsx")

    if price_file and os.path.exists(price_file):
        ext = os.path.splitext(price_file)[1]
        dest = os.path.join(target_dir, f"Price-Ex-ShowRoom{ext}")
        shutil.copy2(price_file, dest)
        copied_files.append(f"Price-Ex-ShowRoom{ext}")

    if brochure_file and os.path.exists(brochure_file):
        dest = os.path.join(target_dir, "brochure.pdf")
        shutil.copy2(brochure_file, dest)
        copied_files.append("brochure.pdf")

    # Copy Color Images
    color_names = []
    hero_image_rel = ""
    for idx, img_path in enumerate(color_images):
        if os.path.exists(img_path):
            fname = os.path.basename(img_path)
            dest = os.path.join(target_dir, fname)
            shutil.copy2(img_path, dest)
            copied_files.append(fname)
            c_name = os.path.splitext(fname)[0]
            color_names.append(c_name)
            if idx == 0:
                hero_image_rel = f"/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/{fname}".replace("\\", "/")

    print(f"\n[+] Successfully organized {len(copied_files)} assets in target directory:")
    for f in copied_files:
        print(f"    • {f}")

    # 4. Generate Antigravity Prompt (prompt.txt)
    prompt_content = f"""# Autonomous Mission: Ingest and Integrate {vehicle_name} into Database and Frontend UI

## Target Location & File Inventory
All assets for this vehicle have been verified and placed on disk under:
`public/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/`

### Available Local Files:
{chr(10).join(f"- `{f}`" for f in copied_files)}

---

## 1. Prisma Seeding & Ingestion Script (`prisma/seed-{vehicle_slug}.ts`)
Create and execute a standalone TypeScript seed script `prisma/seed-{vehicle_slug}.ts` that reads the files from `public/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/`:

1. **Brand & Vehicle Upsert:**
   - **Brand**: `{{"name": "{brand_name}", "slug": "{brand_slug}", "vehicleType": "{category_enum}"}}`
   - **Vehicle**:
     - `name`: "{vehicle_name}"
     - `slug`: "{vehicle_slug}"
     - `category`: "{category_enum}"
     - `bodyType`: "{body_type}"
     - `heroImage`: "{hero_image_rel or f'/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/hero.jpg'}"
     - `brochureUrl`: {f'"/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/brochure.pdf"' if "brochure.pdf" in copied_files else "null"}
     - `launchStatus`: "LAUNCHED"

2. **Ingest Engine Specifications (`Engine.xlsx`):**
   - Read worksheets from `Engine.xlsx` (Engine & Trim Plan, Engine Specifications, etc.).
   - Extract specs as clean JSON and store in `vehicle.engineSpecs`.

3. **Ingest Feature Matrix (`Features.xlsx`):**
   - Read feature worksheets (Safety, Exterior, Interior, Infotainment & connectivity, Comfort & convenience).
   - Parse each row into: `{{ "feature": string, "trims": Record<string, string> }}`.
   - Store inside `vehicle.featureMatrix`.

4. **Ingest Pricing & Variants (`Price-Ex-ShowRoom.*`):**
   - Parse all variant trims and ex-showroom prices from the price sheet.
   - Upsert records into the `Variant` table linked to this vehicle ID.

5. **Ingest Color Gallery:**
   - Map color options from the image files:
{chr(10).join(f'     - `{name}` -> `/vehicles/{category_folder}/{brand_slug}/{vehicle_slug}/{name}.png`' for name in color_names)}
   - Populate `VehicleColor` records with appropriate color names, approximate hex color codes, and image URLs.

---

## 2. Search & Filter Synchronization (`components/VehicleFinder.tsx`)
- Ensure the brand dropdown lists **"{brand_name}"**.
- When filtered by Brand ("{brand_name}") or Body Type ("{body_type}"), the vehicle card must display "{vehicle_name}" with image `"{hero_image_rel}"`.
- Ensure strict isolation: searching or selecting other brands must NEVER display this vehicle's card or images.

---

## 3. Dedicated Model Detail Page (`app/{category_folder}/{brand_slug}/{vehicle_slug}/page.tsx`)
Create or update the dynamic vehicle details page:
1. **Interactive Color Showcase**:
   - Render the car preview with clickable color swatches for each available color ({', '.join(f'"{c}"' for c in color_names)}).
   - Clicking a swatch smoothly switches the preview image to that exact color.
2. **Technical Specifications Table**:
   - Display the engine, powertrain, transmission, and performance details parsed from `Engine.xlsx`.
3. **Trim-by-Trim Feature Comparison Matrix**:
   - Render a table comparing features across trims using the parsed `Features.xlsx` data.
4. **Variant Pricing & Official Brochure**:
   - Display variant pricing cards with on-road price estimates.
   - Provide a working "Download Brochure" button if `brochureUrl` exists.

---

## 4. Head-to-Head Comparison Integration (`app/compare/page.tsx`)
- Allow selecting "{vehicle_name}" against other sedans/vehicles in the catalog (e.g., Honda City, Skoda Slavia, Hyundai Verna).
- Render side-by-side spec comparison, powertrain shootout, dimension differences, and trim-level feature availability.

---

## 5. Execution
Run `npx ts-node prisma/seed-{vehicle_slug}.ts` to seed the database, verify no TypeScript or build errors occur, and confirm the vehicle renders properly on `localhost:3000`.
"""

    prompt_path = os.path.join(target_dir, "prompt.txt")
    with open(prompt_path, "w", encoding="utf-8") as f:
        f.write(prompt_content)

    print("\n" + "=" * 70)
    print(f"🎉 All done! Antigravity prompt generated at:\n   {prompt_path}")
    print("=" * 70)

if __name__ == "__main__":
    main()