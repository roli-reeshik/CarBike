import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function cleanString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strips accents (e.g. Škoda -> Skoda)
    .trim();
}

function extractImageUrl(item: any): string | null {
  if (!item || typeof item !== 'object') return null;

  const direct =
    item.primaryPhotoUrl ||
    item.photoUrl ||
    item.imageUrl ||
    item.image_url ||
    item.image ||
    item.url ||
    item.heroImage ||
    item.photo ||
    item.primary_photo;

  if (typeof direct === 'string' && direct.startsWith('http')) return direct;

  const arr = item.photos || item.photo_urls || item.images || item.pictures;
  if (Array.isArray(arr) && arr.length > 0) {
    const first = arr[0];
    if (typeof first === 'string' && first.startsWith('http')) return first;
    if (first && typeof first === 'object') {
      const nested = first.url || first.image || first.image_url || first.photoUrl;
      if (typeof nested === 'string' && nested.startsWith('http')) return nested;
    }
  }

  if (item.attributes && typeof item.attributes === 'object') {
    return extractImageUrl(item.attributes);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'DATABASE';
  const category = searchParams.get('category') || 'all';
  const brandSlug = searchParams.get('brand') || 'all';
  const bodyType = searchParams.get('bodyType') || 'all';

  const customApiKey = searchParams.get('apiKey')?.trim() || '';
  const customBaseUrl = searchParams.get('baseUrl')?.trim() || '';

  try {
    const whereClause: any = {};
    if (category !== 'all') {
      whereClause.category = category.toUpperCase();
    }
    if (brandSlug !== 'all') {
      whereClause.brand = { slug: brandSlug };
    }
    if (bodyType !== 'all') {
      whereClause.bodyType = { equals: bodyType, mode: 'insensitive' };
    }

    const vehicles = await db.vehicle.findMany({
      where: whereClause,
      include: { brand: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const results = await Promise.all(
      vehicles.map(async (v) => {
        let displayImage = '';
        let sourceStatus = '';
        let isApiMatch = false;

        // 1. Clean brand name and strip suffix labels like "Cars", "Motors", etc.
        const cleanBrandName = cleanString(v.brand.name)
          .replace(/\s+(cars|india|motors|motor|auto|automobiles)$/i, '')
          .trim();

        // 2. Clean model name by stripping redundant brand prefixes
        const brandRegex = new RegExp(`^(${v.brand.name}|${cleanBrandName})\\s*`, 'i');
        const cleanModelName = cleanString(
          v.name.replace(brandRegex, '')
        ).trim();

        // ================= 1. DATABASE =================
        if (source === 'DATABASE') {
          displayImage = v.heroImage || '/vehicles/placeholder.svg';
          sourceStatus = v.heroImage ? 'Live Database Record' : 'No DB Image';
          isApiMatch = true;
        }

        // ================= 2. AUTO.DEV =================
        else if (source === 'AUTODEV') {
          const keyToUse = customApiKey || process.env.AUTO_DEV_API_KEY;
          if (!keyToUse) {
            displayImage = '/vehicles/placeholder.svg';
            sourceStatus = 'Auto.dev key not provided';
          } else {
            try {
              const url = `https://auto.dev/api/listings?make=${encodeURIComponent(
                cleanBrandName
              )}&model=${encodeURIComponent(cleanModelName)}&limit=1`;

              const res = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${keyToUse}`,
                  Accept: 'application/json',
                },
                cache: 'no-store',
              });

              if (res.ok) {
                const data = await res.json();
                const listing =
                  data.records?.[0] || data.listings?.[0] || (Array.isArray(data) ? data[0] : null);
                const found = extractImageUrl(listing);

                if (found) {
                  displayImage = found;
                  sourceStatus = 'Live from Auto.dev';
                  isApiMatch = true;
                } else {
                  displayImage = '/vehicles/placeholder.svg';
                  sourceStatus = `Auto.dev: 0 photos for "${cleanBrandName} ${cleanModelName}"`;
                }
              } else {
                displayImage = '/vehicles/placeholder.svg';
                sourceStatus = `Auto.dev HTTP ${res.status}`;
              }
            } catch (err: any) {
              displayImage = '/vehicles/placeholder.svg';
              sourceStatus = `Auto.dev Error: ${err.message}`;
            }
          }
        }

        // ================= 3. CARIMAGES API =================
        else if (source === 'CARIMAGES') {
          const keyToUse =
            customApiKey ||
            process.env.CAR_IMAGES_API_KEY ||
            'ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120';

          try {
            const url = `https://carimagesapi.com/api/v1/cars?make=${encodeURIComponent(
              cleanBrandName.toLowerCase()
            )}&model=${encodeURIComponent(cleanModelName.toLowerCase())}&api_key=${encodeURIComponent(keyToUse)}`;

            const res = await fetch(url, {
              headers: {
                Accept: 'application/json',
              },
              cache: 'no-store',
            });

            if (res.ok) {
              const data = await res.json();
              const car = (Array.isArray(data) ? data[0] : null) || data.data?.[0] || data;
              const found = extractImageUrl(car);

              if (found) {
                displayImage = found;
                sourceStatus = 'Live from CarImagesAPI';
                isApiMatch = true;
              } else {
                displayImage = `https://carimagesapi.com/c/${encodeURIComponent(
                  cleanBrandName.toLowerCase()
                )}/${encodeURIComponent(cleanModelName.toLowerCase())}?api_key=${encodeURIComponent(keyToUse)}`;
                sourceStatus = `CarImages CDN Query (${cleanBrandName} ${cleanModelName})`;
                isApiMatch = true;
              }
            } else {
              displayImage = '/vehicles/placeholder.svg';
              sourceStatus = `CarImages HTTP ${res.status}`;
            }
          } catch (err: any) {
            displayImage = '/vehicles/placeholder.svg';
            sourceStatus = `CarImages Error: ${err.message}`;
          }
        }

        // ================= 4. CUSTOM / CARAPIS =================
        else if (source === 'CUSTOM') {
          if (!customBaseUrl) {
            displayImage = '/vehicles/placeholder.svg';
            sourceStatus = 'Custom Base URL missing';
          } else {
            try {
              const cleanBase = customBaseUrl.trim().replace(/\/+$/, '');
              const url = new URL(cleanBase);
              url.searchParams.set('make', cleanBrandName);
              url.searchParams.set('model', cleanModelName);
              url.searchParams.set('limit', '1');

              const headers: Record<string, string> = {
                Accept: 'application/json',
              };
              if (customApiKey) {
                headers['Authorization'] = `Bearer ${customApiKey}`;
                headers['X-API-Key'] = customApiKey;
              }

              const res = await fetch(url.toString(), {
                headers,
                cache: 'no-store',
              });

              if (res.ok) {
                const json = await res.json();
                const record =
                  json.results?.[0] ||
                  json.data?.[0] ||
                  json.vehicles?.[0] ||
                  (Array.isArray(json) ? json[0] : null);

                const found = extractImageUrl(record);

                if (found) {
                  displayImage = found;
                  sourceStatus = 'Live from Custom API';
                  isApiMatch = true;
                } else if (!record) {
                  displayImage = '/vehicles/placeholder.svg';
                  sourceStatus = `Custom API: No match for "${cleanBrandName} ${cleanModelName}"`;
                } else {
                  displayImage = '/vehicles/placeholder.svg';
                  sourceStatus = `Custom API: Match found, but photos array empty`;
                }
              } else {
                displayImage = '/vehicles/placeholder.svg';
                sourceStatus = `Custom API HTTP ${res.status}`;
              }
            } catch (err: any) {
              displayImage = '/vehicles/placeholder.svg';
              sourceStatus = `Custom API Error: ${err.message}`;
            }
          }
        }

        return {
          id: v.id,
          name: v.name,
          slug: v.slug,
          category: v.category,
          brandName: v.brand.name,
          brandSlug: v.brand.slug,
          bodyType: v.bodyType,
          currentHeroImage: v.heroImage,
          displayImage,
          sourceStatus,
          isApiMatch,
        };
      })
    );

    const allBrands = await db.brand.findMany({
      select: { name: true, slug: true, vehicleType: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      { vehicles: results, brands: allBrands },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Direct URL assignment to heroImage
    if (contentType.includes('application/json')) {
      const { vehicleId, imageUrl } = await req.json();
      if (!vehicleId || !imageUrl) {
        return NextResponse.json({ error: 'Missing vehicleId or imageUrl' }, { status: 400 });
      }

      const updated = await db.vehicle.update({
        where: { id: vehicleId },
        data: { heroImage: imageUrl },
      });

      return NextResponse.json({ success: true, heroImage: updated.heroImage });
    }

    // Direct multipart file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const vehicleId = formData.get('vehicleId') as string;

      if (!file || !vehicleId) {
        return NextResponse.json({ error: 'Missing file or vehicleId' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.png';
      const cleanFileName = `vehicle_${vehicleId}_${Date.now()}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'vehicles', 'uploads');

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, cleanFileName), buffer);

      const savedUrl = `/vehicles/uploads/${cleanFileName}`;

      const updated = await db.vehicle.update({
        where: { id: vehicleId },
        data: { heroImage: savedUrl },
      });

      return NextResponse.json({ success: true, heroImage: updated.heroImage });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}