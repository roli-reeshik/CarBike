"use server";

import { revalidatePath } from "next/cache";
import { Prisma, BlogCategory, BlogStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { calculateReadingTime, slugify } from "@/lib/blog-utils";

export interface GetPublishedPostsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getPublishedPosts({
  category,
  search,
  page = 1,
  limit = 9,
}: GetPublishedPostsParams = {}) {
  const where: Prisma.BlogPostWhereInput = {
    status: "PUBLISHED",
  };

  if (category && category !== "ALL") {
    if (Object.values(BlogCategory).includes(category as BlogCategory)) {
      where.category = category as BlogCategory;
    }
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 9);
  const skip = (safePage - 1) * safeLimit;

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { publishedAt: "desc" },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            slug: true,
            heroImage: true,
            priceMin: true,
            priceMax: true,
            category: true,
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: true,
      },
    }),
    db.blogPost.count({ where }),
  ]);

  return {
    posts,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      include: {
        vehicle: {
          include: {
            brand: true,
            variants: {
              take: 3,
              orderBy: { exShowroomPrice: "asc" },
            },
          },
        },
        brand: true,
        tags: true,
      },
    });
    return post;
  } catch {
    return await db.blogPost.findUnique({
      where: { slug },
      include: {
        vehicle: {
          include: {
            brand: true,
            variants: {
              take: 3,
              orderBy: { exShowroomPrice: "asc" },
            },
          },
        },
        brand: true,
        tags: true,
      },
    });
  }
}

export async function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  limit = 3
) {
  return db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: currentSlug },
      category,
    },
    take: limit,
    orderBy: { publishedAt: "desc" },
    include: {
      tags: true,
      vehicle: {
        select: {
          id: true,
          name: true,
          slug: true,
          heroImage: true,
          brand: {
            select: { name: true, slug: true },
          },
        },
      },
    },
  });
}

export async function getAllAdminPosts({
  page = 1,
  limit = 20,
  search,
  status,
  category,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
} = {}) {
  const where: Prisma.BlogPostWhereInput = {};

  if (status && status !== "ALL") {
    if (Object.values(BlogStatus).includes(status as BlogStatus)) {
      where.status = status as BlogStatus;
    }
  }

  if (category && category !== "ALL") {
    if (Object.values(BlogCategory).includes(category as BlogCategory)) {
      where.category = category as BlogCategory;
    }
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 20);
  const skip = (safePage - 1) * safeLimit;

  const [posts, total] = await Promise.all([
    db.blogPost.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    }),
    db.blogPost.count({ where }),
  ]);

  return {
    posts,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function getPostById(id: string) {
  return db.blogPost.findUnique({
    where: { id },
    include: {
      vehicle: {
        select: {
          id: true,
          name: true,
          slug: true,
          heroImage: true,
        },
      },
      brand: true,
      tags: true,
    },
  });
}

export async function getVehiclesForSelect() {
  return db.vehicle.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      heroImage: true,
      category: true,
      brandId: true,
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  });
}

export async function createPost(formData: FormData | Record<string, unknown>) {
  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const title = String(data.title || "").trim();
  if (!title) throw new Error("Title is required");

  let slug = String(data.slug || "").trim();
  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  let finalSlug = slug;
  let counter = 1;
  while (await db.blogPost.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }

  const content = String(data.content || "");
  const excerpt = data.excerpt ? String(data.excerpt).trim() : null;
  const featuredImage = data.featuredImage
    ? String(data.featuredImage).trim()
    : null;
  const category = (data.category as BlogCategory) || BlogCategory.NEWS;
  const status = (data.status as BlogStatus) || BlogStatus.DRAFT;
  const vehicleId =
    data.vehicleId && String(data.vehicleId).trim() !== ""
      ? String(data.vehicleId)
      : null;

  let brandId =
    data.brandId && String(data.brandId).trim() !== ""
      ? String(data.brandId)
      : null;

  if (vehicleId && !brandId) {
    const v = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { brandId: true },
    });
    if (v) brandId = v.brandId;
  }

  const readingTime = calculateReadingTime(content);
  const publishedAt =
    status === "PUBLISHED"
      ? data.publishedAt
        ? new Date(String(data.publishedAt))
        : new Date()
      : null;

  const rawTags = data.tags
    ? String(data.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const post = await db.blogPost.create({
    data: {
      title,
      slug: finalSlug,
      excerpt,
      content,
      featuredImage,
      category,
      status,
      publishedAt,
      readingTime,
      vehicleId,
      brandId,
      tags:
        rawTags.length > 0
          ? {
              connectOrCreate: rawTags.map((name) => ({
                where: { name },
                create: { name, slug: slugify(name) },
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${finalSlug}`);
  revalidatePath("/admin/blogs");

  return post;
}

export async function updatePost(
  id: string,
  formData: FormData | Record<string, unknown>
) {
  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found");

  const data =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const title =
    data.title !== undefined ? String(data.title).trim() : existing.title;
  let slug =
    data.slug !== undefined ? slugify(String(data.slug).trim()) : existing.slug;
  if (!slug) slug = slugify(title);

  if (slug !== existing.slug) {
    let finalSlug = slug;
    let counter = 1;
    while (
      await db.blogPost.findFirst({
        where: { slug: finalSlug, NOT: { id } },
      })
    ) {
      finalSlug = `${slug}-${counter++}`;
    }
    slug = finalSlug;
  }

  const content =
    data.content !== undefined ? String(data.content) : existing.content;
  const excerpt =
    data.excerpt !== undefined
      ? data.excerpt
        ? String(data.excerpt).trim()
        : null
      : existing.excerpt;
  const featuredImage =
    data.featuredImage !== undefined
      ? data.featuredImage
        ? String(data.featuredImage).trim()
        : null
      : existing.featuredImage;
  const category = (data.category as BlogCategory) || existing.category;
  const status = (data.status as BlogStatus) || existing.status;

  let vehicleId = existing.vehicleId;
  if (data.vehicleId !== undefined) {
    vehicleId =
      data.vehicleId && String(data.vehicleId).trim() !== ""
        ? String(data.vehicleId)
        : null;
  }

  let brandId = existing.brandId;
  if (vehicleId && vehicleId !== existing.vehicleId) {
    const v = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { brandId: true },
    });
    if (v) brandId = v.brandId;
  } else if (data.brandId !== undefined) {
    brandId =
      data.brandId && String(data.brandId).trim() !== ""
        ? String(data.brandId)
        : null;
  }

  const readingTime = calculateReadingTime(content);
  let publishedAt = existing.publishedAt;
  if (status === "PUBLISHED" && !publishedAt) {
    publishedAt = new Date();
  }

  const rawTags =
    data.tags !== undefined
      ? String(data.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : null;

  const post = await db.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      status,
      publishedAt,
      readingTime,
      vehicleId,
      brandId,
      tags:
        rawTags !== null
          ? {
              set: [],
              connectOrCreate: rawTags.map((name) => ({
                where: { name },
                create: { name, slug: slugify(name) },
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${post.slug}`);
  if (existing.slug !== post.slug) {
    revalidatePath(`/blogs/${existing.slug}`);
  }
  revalidatePath("/admin/blogs");

  return post;
}

export async function deletePost(id: string) {
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${post.slug}`);
  revalidatePath("/admin/blogs");

  return { success: true };
}

export async function togglePostStatus(id: string) {
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");

  const newStatus: BlogStatus =
    post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const updated = await db.blogPost.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt:
        newStatus === "PUBLISHED" && !post.publishedAt
          ? new Date()
          : post.publishedAt,
    },
  });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${updated.slug}`);
  revalidatePath("/admin/blogs");

  return updated;
}
