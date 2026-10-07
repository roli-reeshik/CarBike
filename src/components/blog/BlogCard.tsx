import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Calendar, ArrowUpRight } from "lucide-react";
import { BlogCategory } from "@prisma/client";

export interface BlogCardData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: BlogCategory;
  readingTime: number;
  viewCount: number;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  vehicle?: {
    id: string;
    name: string;
    slug: string;
    heroImage?: string;
    brand?: {
      name: string;
      slug: string;
    } | null;
  } | null;
  brand?: {
    name: string;
    slug: string;
  } | null;
  tags?: {
    name: string;
  }[];
}

interface BlogCardProps {
  post: BlogCardData;
  featured?: boolean;
}

export function formatCategoryLabel(cat: BlogCategory | string): string {
  switch (cat) {
    case "NEWS":
      return "Industry News";
    case "REVIEWS":
      return "Expert Review";
    case "BUYING_GUIDES":
      return "Buying Guide";
    case "EV_INSIGHTS":
      return "EV Insights";
    case "MAINTENANCE":
      return "Maintenance";
    default:
      return String(cat).replace(/_/g, " ");
  }
}

export function getCategoryBadgeClasses(cat: BlogCategory | string): string {
  switch (cat) {
    case "EV_INSIGHTS":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "REVIEWS":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "BUYING_GUIDES":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "MAINTENANCE":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "NEWS":
    default:
      return "bg-orange-100 text-orange-900 border-orange-200";
  }
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const dateStr = post.publishedAt || post.createdAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  if (featured) {
    return (
      <article
        suppressHydrationWarning
        className="group relative overflow-hidden rounded-3xl border border-line bg-card shadow-xs transition-all duration-300 hover:shadow-xl hover:border-line/80 grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] lg:aspect-auto lg:col-span-7 overflow-hidden bg-paper">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-200 text-muted">
              Auto Editorial
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Content Container */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getCategoryBadgeClasses(
                  post.category
                )}`}
              >
                {formatCategoryLabel(post.category)}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <Clock className="size-3.5" />
                {post.readingTime} min read
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
              <Link href={`/blogs/${post.slug}`}>
                <span className="absolute inset-0" aria-hidden="true" />
                {post.title}
              </Link>
            </h2>

            {post.excerpt && (
              <p className="line-clamp-3 text-sm sm:text-base leading-relaxed text-muted">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-line/60 pt-4 text-xs text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5" />
                {post.viewCount.toLocaleString()} views
              </span>
            </div>

            <div className="flex items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
              <span>Read Story</span>
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      suppressHydrationWarning
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-xs transition-all duration-300 hover:shadow-lg hover:border-line/80"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-200 text-muted">
            Auto Editorial
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs ${getCategoryBadgeClasses(
              post.category
            )}`}
          >
            {formatCategoryLabel(post.category)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readingTime} min read
            </span>
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-accent line-clamp-2">
            <Link href={`/blogs/${post.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h3>

          {post.excerpt && (
            <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-line/50 pt-3 text-xs text-muted">
          {post.vehicle ? (
            <span className="truncate max-w-[65%] font-medium text-ink/75">
              Ref: {post.vehicle.name}
            </span>
          ) : (
            <span className="font-medium text-ink/75">CarBike Editorial</span>
          )}

          <span className="flex items-center gap-1 font-semibold text-accent">
            Read <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
