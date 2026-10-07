import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getPublishedPosts } from "@/lib/actions/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryFilterBar } from "@/components/blog/CategoryFilterBar";
import { Sparkles, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 60; // Revalidate every minute or on-demand via server actions

export const metadata: Metadata = {
  title: "Automotive News, Expert Reviews & Buying Guides | CarBikeKharido",
  description:
    "In-depth car and bike reviews, electric vehicle insights, real-world mileage tests, and latest Indian auto industry updates.",
  openGraph: {
    title: "CarBikeKharido Auto Newsroom & Technical Editorial",
    description:
      "Honest automotive journalism, real-world road tests, EV range analyses, and buyer guides for India.",
    type: "website",
    url: "https://carbikekharido.com/blogs",
  },
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = params.category || "ALL";
  const currentSearch = params.q || "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const { posts, total, page, totalPages } = await getPublishedPosts({
    category: currentCategory,
    search: currentSearch,
    page: currentPage,
    limit: 10,
  });

  // Featured post is the first one when on page 1 without search filter
  const isFirstPage = page === 1 && !currentSearch;
  const featuredPost = isFirstPage && posts.length > 0 ? posts[0] : null;
  const gridPosts = isFirstPage && posts.length > 0 ? posts.slice(1) : posts;

  // JSON-LD ItemList Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CarBikeKharido Automotive News & Reviews",
    itemListElement: posts.map((post, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt || post.title,
        image: post.featuredImage,
        datePublished: post.publishedAt || post.createdAt,
        url: `https://carbikekharido.com/blogs/${post.slug}`,
      },
    })),
  };

  return (
    <main
      suppressHydrationWarning
      className="mx-auto min-h-screen max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8"
    >
      <Script
        id="blog-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Section */}
      <header className="mb-10 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold tracking-widest text-accent uppercase">
            <Sparkles className="size-3.5" /> Editorial &amp; Newsroom
          </span>
          <span className="text-xs text-muted">CarBikeKharido Journal</span>
        </div>

        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Auto Insights &amp; Reviews
        </h1>

        <p className="mt-3 max-w-2xl text-base text-muted leading-relaxed">
          Unfiltered driving evaluations, electric vehicle real-world range reports,
          maintenance best practices, and daily Indian automotive market developments.
        </p>

        {/* Filter Bar with Suspense for URL search params */}
        <div className="mt-8">
          <Suspense fallback={<div className="h-12 w-full animate-pulse bg-card rounded-full" />}>
            <CategoryFilterBar
              currentCategory={currentCategory}
              currentSearch={currentSearch}
            />
          </Suspense>
        </div>
      </header>

      {/* Main Content Area */}
      {posts.length === 0 ? (
        <div className="my-16 rounded-3xl border border-dashed border-line bg-card/60 p-12 text-center">
          <BookOpen className="mx-auto size-12 text-muted/60" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
            No matching articles found
          </h2>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            {currentSearch
              ? `We couldn't find any stories matching "${currentSearch}". Try a different keyword or explore all categories.`
              : "No articles are available in this category yet. Check back soon for fresh updates."}
          </p>
          <div className="mt-6">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-card hover:bg-ink/90 transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Featured Hero Article */}
          {featuredPost && (
            <section aria-label="Featured Story">
              <BlogCard post={featuredPost} featured={true} />
            </section>
          )}

          {/* Grid of Remaining Articles */}
          {gridPosts.length > 0 && (
            <section
              aria-label="Latest Stories Grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </section>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-12 flex items-center justify-between border-t border-line pt-6 text-sm"
            >
              <div>
                <p className="text-xs text-muted">
                  Showing page <span className="font-semibold text-ink">{page}</span> of{" "}
                  <span className="font-semibold text-ink">{totalPages}</span> ({total}{" "}
                  total stories)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/blogs?${new URLSearchParams({
                      ...(currentCategory !== "ALL" ? { category: currentCategory } : {}),
                      ...(currentSearch ? { q: currentSearch } : {}),
                      page: String(page - 1),
                    }).toString()}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-ink hover:border-ink transition-colors"
                  >
                    <ArrowLeft className="size-3.5" /> Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line/40 bg-card/40 px-4 py-2 text-xs font-medium text-muted/40 cursor-not-allowed">
                    <ArrowLeft className="size-3.5" /> Previous
                  </span>
                )}

                {page < totalPages ? (
                  <Link
                    href={`/blogs?${new URLSearchParams({
                      ...(currentCategory !== "ALL" ? { category: currentCategory } : {}),
                      ...(currentSearch ? { q: currentSearch } : {}),
                      page: String(page + 1),
                    }).toString()}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-ink hover:border-ink transition-colors"
                  >
                    Next <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line/40 bg-card/40 px-4 py-2 text-xs font-medium text-muted/40 cursor-not-allowed">
                    Next <ArrowRight className="size-3.5" />
                  </span>
                )}
              </div>
            </nav>
          )}
        </div>
      )}
    </main>
  );
}
