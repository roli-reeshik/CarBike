import os
from PIL import Image
import numpy as np

OUTPUT_DIR = os.path.join("public", "vehicles", "cars", "Brand Logos")

SLOTS = [
    (0, 220),
    (220, 450),
    (450, 680),
    (680, 910),
    (910, 1130)
]

CROPS = {
    # 1.png
    (1, 0): ["mini.png"],
    (1, 1): ["maruti-suzuki.png", "maruti.png"],
    (1, 2): ["hyundai.png"],
    (1, 3): ["tata.png"],
    (1, 4): ["mahindra.png"],
    
    # 2.png
    (2, 0): ["toyota.png"],
    (2, 1): ["honda.png", "honda-cars.png"],
    (2, 2): ["kia.png"],
    (2, 3): ["nissan.png"],
    (2, 4): ["renault.png"],
    
    # 3.png
    (3, 0): ["skoda-wordmark.png"],
    (3, 1): ["volkswagen.png"],
    (3, 2): ["jeep.png"],
    (3, 3): ["mg.png"],
    (3, 4): ["isuzu-red.png"],
    
    # 4.png
    (4, 0): ["isuzu.png"],
    (4, 1): ["force.png"],
    (4, 2): ["citroen.png"],
    (4, 3): ["audi.png"],
    (4, 4): ["bmw.png"],
    
    # 5.png
    (5, 0): ["mercedes-benz.png", "mercedes.png"],
    (5, 1): ["jaguar.png"],
    (5, 2): ["land-rover.png"],
    (5, 3): ["skoda.png"],
    (5, 4): ["lamborghini.png"],
}

def extract_logos():
    print(f"Extracting brand logos into: {OUTPUT_DIR}")
    for (img_num, slot_idx), filenames in CROPS.items():
        src_path = os.path.join(OUTPUT_DIR, f"{img_num}.png")
        if not os.path.exists(src_path):
            continue
            
        img = Image.open(src_path).convert("RGB")
        arr = np.array(img)
        
        x1, x2 = SLOTS[slot_idx]
        
        # Inward margin 18px to avoid the outer card border
        y_margin = 15
        x_margin = 18
        
        sub = arr[y_margin:-y_margin, x1+x_margin:x2-x_margin]
        
        # Pixels that belong to the logo (darker than near-white background)
        dark = np.any(sub < 205, axis=2)
        if not np.any(dark):
            dark = np.any(sub < 225, axis=2)
            
        if not np.any(dark):
            print(f"Warning: No logo pixels in {img_num}.png slot {slot_idx}")
            continue
            
        ys, xs = np.where(dark)
        min_x = xs.min()
        max_x = xs.max()
        min_y = ys.min()
        max_y = ys.max()
        
        cropped = sub[min_y:max_y+1, min_x:max_x+1]
        
        # Canvas with clean white padding
        pad_x = 16
        pad_y = 12
        crop_h, crop_w, _ = cropped.shape
        target_w = crop_w + pad_x * 2
        target_h = crop_h + pad_y * 2
        
        canvas = np.ones((target_h, target_w, 3), dtype=np.uint8) * 255
        canvas[pad_y:pad_y+crop_h, pad_x:pad_x+crop_w, :] = cropped
        
        logo_img = Image.fromarray(canvas)
        
        for fname in filenames:
            out_path = os.path.join(OUTPUT_DIR, fname)
            logo_img.save(out_path, format="PNG")
            print(f"Saved clean {fname} ({target_w}x{target_h})")

if __name__ == "__main__":
    extract_logos()
