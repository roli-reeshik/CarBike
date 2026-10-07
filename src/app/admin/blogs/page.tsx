import React from "react";
import Link from "next/link";
import { getAllAdminPosts } from "@/lib/actions/blog";
import { BlogTable } from "@/components/admin/BlogTable";
import { db } from "@/lib/db";
import { Plus, Newspaper, Eye, CheckCircle2, FileText, ArrowUpRight } from "lucide-react";

export const revalidate = 0; // Dynamic admin page

interface AdminBlogsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function AdminBlogsPage({
  searchParams,
}: AdminBlogsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const { posts, total, totalPages } = await getAllAdminPosts({
    page,
    limit: 25,
    status: params.status,
    category: params.category,
    search: params.q,
  });

  // Calculate quick stats
  const [totalPublished, totalDraft, totalViews] = await Promise.all([
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
    db.blogPost.aggregate({ _sum: { viewCount: true } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
              <Newspaper className="size-3.5" /> Editorial Desk
            </span>
            <span className="text-xs text-stone-500">
              CarBikeKharido Content Subsystem
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-stone-900">
            Automotive Articles &amp; News
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Publish reviews, buying guides, and EV insights linked directly to cars and bikes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blogs"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <span>Live Blog</span>
            <ArrowUpRight className="size-3.5 text-stone-400" />
          </Link>

          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors shadow-xs"
          >
            <Plus className="size-4" />
            <span>Write New Story</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Total Posts
            </span>
            <FileText className="size-4" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-stone-900">
            {total}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Published
            </span>
            <CheckCircle2 className="size-4" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-emerald-700">
            {totalPublished}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Drafts
            </span>
            <FileText className="size-4" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-stone-600">
            {totalDraft}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Total Reads
            </span>
            <Eye className="size-4" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-stone-900">
            {(totalViews._sum.viewCount || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <BlogTable posts={posts} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/blogs?page=${page - 1}`}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1 font-medium text-stone-700 hover:bg-stone-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/blogs?page=${page + 1}`}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1 font-medium text-stone-700 hover:bg-stone-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
