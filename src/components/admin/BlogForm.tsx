"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost, updatePost } from "@/lib/actions/blog";
import { slugify, calculateReadingTime } from "@/lib/blog-utils";
import { BlogCategory, BlogStatus } from "@prisma/client";
import {
  ArrowLeft,
  Save,
  Send,
  Car,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface VehicleOption {
  id: string;
  name: string;
  slug: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface BlogPostInitialData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  category: BlogCategory;
  status: BlogStatus;
  vehicleId?: string | null;
  brandId?: string | null;
  tags?: { name: string }[];
}

interface BlogFormProps {
  initialData?: BlogPostInitialData;
  vehicles: VehicleOption[];
}

export function BlogForm({ initialData, vehicles }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [category, setCategory] = useState<BlogCategory>(
    initialData?.category || BlogCategory.NEWS
  );
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || ""
  );
  const [vehicleId, setVehicleId] = useState(initialData?.vehicleId || "");
  const [tags, setTags] = useState(
    initialData?.tags?.map((t) => t.name).join(", ") || ""
  );

  // Auto slug generation if not manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const readingTime = calculateReadingTime(content);

  const handleSubmit = async (targetStatus: BlogStatus) => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Please provide an article title.");
      return;
    }

    if (!content.trim()) {
      setError("Article content cannot be empty.");
      return;
    }

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      featuredImage,
      category,
      status: targetStatus,
      vehicleId: vehicleId || null,
      tags,
    };

    startTransition(async () => {
      try {
        if (isEdit && initialData?.id) {
          await updatePost(initialData.id, payload);
          setSuccess("Article updated successfully!");
        } else {
          await createPost(payload);
          setSuccess("Article created successfully!");
        }

        setTimeout(() => {
          router.push("/admin/blogs");
          router.refresh();
        }, 600);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save post");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ArrowLeft className="size-3.5" /> Back to Articles Management
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
            {isEdit ? "Edit Automotive Article" : "Create New Article"}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Author news, comparisons, reviews and link vehicles directly from your catalog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(BlogStatus.DRAFT)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-50 transition-all"
          >
            <Save className="size-3.5 text-stone-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleSubmit(BlogStatus.PUBLISHED)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-700 disabled:opacity-50 transition-all"
          >
            <Send className="size-3.5" />
            <span>{isPending ? "Saving..." : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-medium text-red-800">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Article Headline *
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. 2026 Tata Curvv Review: Engine Specs, Highway Range & Price"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="text-[11px] font-medium text-orange-600 hover:underline"
              >
                Regenerate from Title
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-500 shadow-xs focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900">
              <span className="shrink-0 text-stone-400 select-none">/blogs/</span>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="article-url-slug"
                className="w-full bg-transparent px-1 font-mono text-xs text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Excerpt / Summary
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise synopsis for search engines and social cards..."
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs leading-relaxed"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                Body Content (Markdown / HTML supported) *
              </label>
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Clock className="size-3" /> ~{readingTime} min read
              </span>
            </div>
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article in Markdown. Use ## for subheadings, - for bullet points, | for tables, or HTML tags..."
              className="w-full rounded-xl border border-stone-300 bg-white p-4 font-mono text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 shadow-xs leading-relaxed"
            />
            <p className="text-[11px] text-stone-400">
              Supports: Markdown headers (##), bold (**text**), lists (- item), tables (| a | b |), blockquotes (&gt; quote) or HTML.
            </p>
          </div>
        </div>

        {/* Sidebar Settings Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Dropdown */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800 focus:border-stone-900 focus:outline-none"
            >
              <option value={BlogCategory.NEWS}>Car &amp; Bike News</option>
              <option value={BlogCategory.REVIEWS}>Expert Reviews</option>
              <option value={BlogCategory.BUYING_GUIDES}>Buying Guides</option>
              <option value={BlogCategory.EV_INSIGHTS}>EV Insights</option>
              <option value={BlogCategory.MAINTENANCE}>Maintenance &amp; Care</option>
            </select>
          </div>

          {/* Linked Vehicle Dropdown */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700">
              <Car className="size-4 text-orange-600" />
              <span>Link Vehicle (Optional)</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Associating a catalog vehicle renders an interactive preview card with instant specs and comparison links.
            </p>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs font-semibold text-stone-800 focus:border-stone-900 focus:outline-none"
            >
              <option value="">-- No Vehicle Linked --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand?.name ? `${v.brand.name} - ` : ""}
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700">
              <ImageIcon className="size-4 text-stone-500" />
              <span>Featured Image URL</span>
            </div>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-800 focus:border-stone-900 focus:outline-none"
            />
            {featuredImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Tags (Comma-Separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tata, EV, SUV, Mileage, Safety"
              className="w-full rounded-xl border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-800 focus:border-stone-900 focus:outline-none"
            />
            <p className="text-[11px] text-stone-400">
              Separate tags with commas. E.g. &quot;Electric, Creta, Highway Test&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
