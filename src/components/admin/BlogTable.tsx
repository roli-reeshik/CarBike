"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePostStatus, deletePost } from "@/lib/actions/blog";
import { BlogCategory, BlogStatus } from "@prisma/client";
import {
  formatCategoryLabel,
  getCategoryBadgeClasses,
} from "@/components/blog/BlogCard";
import {
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Car,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export interface AdminPostItem {
  id: string;
  title: string;
  slug: string;
  category: BlogCategory;
  status: BlogStatus;
  viewCount: number;
  readingTime: number;
  createdAt: Date | string;
  publishedAt?: Date | string | null;
  vehicle?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
  tags?: {
    id: string;
    name: string;
  }[];
}

interface BlogTableProps {
  posts: AdminPostItem[];
}

export function BlogTable({ posts: initialPosts }: BlogTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleToggle = (id: string) => {
    startTransition(async () => {
      try {
        const updated = await togglePostStatus(id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: updated.status, publishedAt: updated.publishedAt } : p
          )
        );
        router.refresh();
      } catch (err) {
        alert("Failed to toggle status: " + (err instanceof Error ? err.message : String(err)));
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    startTransition(async () => {
      try {
        await deletePost(id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete post: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
        <AlertTriangle className="mx-auto size-10 text-stone-400" />
        <h3 className="mt-3 font-display text-lg font-semibold text-stone-900">
          No articles in database
        </h3>
        <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
          Start publishing vehicle reviews, market updates, and buying guides for CarBikeKharido readers.
        </p>
        <div className="mt-5">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700"
          >
            Create First Article
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-stone-200 bg-stone-50 font-semibold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-5 py-3.5">Article Details</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Linked Vehicle</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-right">Metrics</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((post) => {
              const isPublished = post.status === BlogStatus.PUBLISHED;
              const dateStr = post.publishedAt || post.createdAt;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-";

              return (
                <tr
                  key={post.id}
                  className="hover:bg-stone-50/70 transition-colors"
                >
                  {/* Article Details */}
                  <td className="px-5 py-4 max-w-md">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/blogs/${post.id}/edit`}
                        className="font-medium text-stone-900 hover:text-orange-600 transition-colors line-clamp-2 text-sm"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                        <span>/blogs/{post.slug}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getCategoryBadgeClasses(
                        post.category
                      )}`}
                    >
                      {formatCategoryLabel(post.category)}
                    </span>
                  </td>

                  {/* Linked Vehicle */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {post.vehicle ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                        <Car className="size-3 text-orange-600" />
                        <span>{post.vehicle.name}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400 italic">None</span>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(post.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shadow-2xs ${
                        isPublished
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200"
                          : "bg-stone-200 text-stone-700 hover:bg-stone-300 border border-stone-300"
                      }`}
                      title="Click to toggle status between Published and Draft"
                    >
                      <CheckCircle2
                        className={`size-3 ${
                          isPublished ? "text-emerald-600" : "text-stone-400"
                        }`}
                      />
                      <span>{isPublished ? "Published" : "Draft"}</span>
                    </button>
                  </td>

                  {/* Metrics */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="text-[11px] text-stone-600 space-y-0.5">
                      <div className="flex items-center justify-end gap-1 font-medium">
                        <Eye className="size-3 text-stone-400" />
                        <span>{post.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-stone-400">
                        <Clock className="size-3" />
                        <span>{post.readingTime}m read</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isPublished && (
                        <Link
                          href={`/blogs/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                          title="View Live Article"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      )}

                      <Link
                        href={`/admin/blogs/${post.id}/edit`}
                        className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        title="Edit Article"
                      >
                        <Edit3 className="size-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                        title="Delete Article"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
