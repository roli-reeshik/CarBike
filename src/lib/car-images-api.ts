import fs from "fs";
import path from "path";

export const CAR_IMAGES_API_BASE_URL =
  process.env.CAR_IMAGES_API_BASE_URL || "https://carimagesapi.com";
export const CAR_IMAGES_API_KEY =
  process.env.CAR_IMAGES_API_KEY ||
  "ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120";

export interface CarImageRequestOptions {
  make: string;
  model?: string;
  year?: number;
  type?: "car" | "moto" | "any";
  width?: number;
  format?: "webp" | "png" | "jpg";
  view?:
    | "front34"
    | "front34-r"
    | "front"
    | "side"
    | "side-r"
    | "rear34"
    | "rear34-r"
    | "rear";
}

// Memory cache for signed URLs to reduce latency and conserve API quota
interface CacheEntry {
  url: string;
  expiresAt: number;
}
const signedUrlCache = new Map<string, CacheEntry>();

/**
 * Returns the public brand logo URL from CarImagesAPI (no auth needed).
 */
export function getBrandLogoUrl(make: string): string {
  if (!make) return `${CAR_IMAGES_API_BASE_URL}/brand-logo?make=car`;
  // Clean make name: "Maruti Suzuki" -> "Suzuki" or "Maruti", "Škoda" -> "Skoda"
  const cleanMake = make
    .replace(/[Šš]/g, "S")
    .replace(/\s+Motors|\s+India|\s+Cars|\s+2Wheelers/gi, "")
    .trim();
  return `${CAR_IMAGES_API_BASE_URL}/brand-logo?make=${encodeURIComponent(cleanMake)}`;
}

/**
 * Clean make and model for optimal fuzzy matching against CarImagesAPI.
 */
export function cleanVehicleTerms(make: string, rawModel?: string): {
  cleanMake: string;
  cleanModel: string;
} {
  const cleanMake = make
    .replace(/[Šš]/g, "S")
    .replace(/\s+Motors|\s+India|\s+Cars|\s+2Wheelers|\s+Two\s+Wheelers/gi, "")
    .trim();

  let cleanModel = (rawModel || "").trim();
  // If model starts with brand name (e.g. "Maruti Swift" or "Tata Nexon"), strip the brand
  const makeWords = cleanMake.split(/\s+/);
  for (const w of makeWords) {
    if (w.length > 2 && cleanModel.toLowerCase().startsWith(w.toLowerCase())) {
      cleanModel = cleanModel.slice(w.length).trim();
    }
  }

  // Remove generic suffixes that confuse image search
  cleanModel = cleanModel
    .replace(/\s+(SUV|EV|Classic|OG|Car|Motorcycle|Bike|Standard)$/i, "")
    .trim();

  return { cleanMake, cleanModel };
}

/**
 * Generates or retrieves a signed vehicle image URL from CarImagesAPI.
 */
export async function getCarImageSignedUrl(
  options: CarImageRequestOptions
): Promise<string | null> {
  const { cleanMake, cleanModel } = cleanVehicleTerms(options.make, options.model);
  const type = options.type || "any";
  const view = options.view || "front34";
  const width = options.width || 800;
  const format = options.format || "webp";

  const cacheKey = `${type}:${cleanMake}:${cleanModel}:${options.year || ""}:${view}:${width}:${format}`.toLowerCase();
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const params = new URLSearchParams({
      api_key: CAR_IMAGES_API_KEY,
      make: cleanMake,
      type,
      width: String(width),
      format,
      view,
    });

    if (cleanModel) {
      params.append("model", cleanModel);
    }
    if (options.year) {
      params.append("year", String(options.year));
    }

    const endpoint = `${CAR_IMAGES_API_BASE_URL}/api/v1/signed-url?${params.toString()}`;
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[CarImagesAPI] Signed URL request failed (${res.status}): ${cleanMake} ${cleanModel}`
      );
      return null;
    }

    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      // Cache for 45 minutes (signed URLs typically valid 1h)
      signedUrlCache.set(cacheKey, {
        url: data.url,
        expiresAt: Date.now() + 45 * 60 * 1000,
      });
      return data.url;
    }

    return null;
  } catch (error) {
    console.error(`[CarImagesAPI] Error generating signed URL:`, error);
    return null;
  }
}

/**
 * Generates batch signed URLs for up to 50 vehicles in one roundtrip.
 */
export async function getBatchSignedUrls(
  images: CarImageRequestOptions[]
): Promise<string[]> {
  if (images.length === 0) return [];

  try {
    const payload = images.map((img) => {
      const { cleanMake, cleanModel } = cleanVehicleTerms(img.make, img.model);
      return {
        make: cleanMake,
        model: cleanModel || undefined,
        year: img.year,
        type: img.type || "any",
        width: img.width || 800,
        format: img.format || "webp",
        view: img.view || "front34",
      };
    });

    const endpoint = `${CAR_IMAGES_API_BASE_URL}/api/v1/signed-urls?api_key=${encodeURIComponent(
      CAR_IMAGES_API_KEY
    )}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ images: payload }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[CarImagesAPI] Batch signed-urls failed with status ${res.status}`);
      return [];
    }

    const data = (await res.json()) as { urls?: string[] };
    return data.urls || [];
  } catch (err) {
    console.error("[CarImagesAPI] Batch signed-urls error:", err);
    return [];
  }
}

/**
 * Checks if a local vehicle image file physically exists in the public directory.
 */
export function isLocalImageExisting(imagePath?: string | null): boolean {
  if (!imagePath) return false;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return true;
  }

  try {
    const decoded = decodeURIComponent(imagePath.split("?")[0]);
    const normalized = decoded.startsWith("/") ? decoded.slice(1) : decoded;
    const fullPath = path.join(process.cwd(), "public", normalized);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

/**
 * Resolves the vehicle image with high reliability:
 * 1. If existing local image is valid and exists on disk, use it.
 * 2. If missing or placeholder or non-existent, calls CarImagesAPI for a signed URL.
 * 3. Falls back gracefully to brand logo or fallback image.
 */
export async function resolveVerifiedVehicleImage(vehicle: {
  name: string;
  brandName?: string;
  category?: string;
  heroImage?: string | null;
}): Promise<string> {
  const currentImage = vehicle.heroImage;

  // If local image physically exists and is not a placeholder, keep it
  if (
    currentImage &&
    !currentImage.includes("placeholder.png") &&
    isLocalImageExisting(currentImage)
  ) {
    return currentImage;
  }

  // Otherwise request a signed image from CarImagesAPI
  const brandName = vehicle.brandName || "Car";
  const type = vehicle.category === "BIKE" ? "moto" : "car";

  const signedUrl = await getCarImageSignedUrl({
    make: brandName,
    model: vehicle.name,
    type,
    width: 800,
    format: "webp",
    view: "front34",
  });

  if (signedUrl) {
    return signedUrl;
  }

  // Fallback to existing or placeholder if API didn't match
  if (currentImage && isLocalImageExisting(currentImage)) {
    return currentImage;
  }

  return (
    getBrandLogoUrl(brandName) ||
    "/vehicles/cars/skoda/skoda-slavia/Candy White.png"
  );
}
