import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { getPostBySlug, getRelatedPosts } from "@/lib/actions/blog";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { VehiclePreviewCard } from "@/components/blog/VehiclePreviewCard";
import {
  BlogCard,
  formatCategoryLabel,
  getCategoryBadgeClasses,
} from "@/components/blog/BlogCard";
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  ChevronRight,
  Tag as TagIcon,
} from "lucide-react";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Story Not Found | CarBikeKharido",
    };
  }

  const title = `${post.title} | CarBikeKharido`;
  const description =
    post.excerpt || `Read complete analysis on ${post.title} on CarBikeKharido.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: ["CarBikeKharido Editorial"],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostDetailPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status === "ARCHIVED") {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.category, 3);

  const formattedDate = (post.publishedAt || post.createdAt)
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Recently Published";

  // JSON-LD NewsArticle / BlogPosting Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "CarBikeKharido Editorial Team",
      url: "https://carbikekharido.com",
    },
    publisher: {
      "@type": "Organization",
      name: "CarBikeKharido",
      logo: {
        "@type": "ImageObject",
        url: "https://carbikekharido.com/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://carbikekharido.com/blogs/${post.slug}`,
    },
  };

  return (
    <article
      suppressHydrationWarning
      className="mx-auto min-h-screen max-w-4xl px-4 pt-8 pb-24 sm:px-6"
    >
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumbs"
        className="mb-6 flex items-center gap-2 text-xs text-muted overflow-x-auto whitespace-nowrap"
      >
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <ChevronRight className="size-3.5 text-muted/60" />
        <Link href="/blogs" className="hover:text-ink transition-colors">
          Blogs
        </Link>
        <ChevronRight className="size-3.5 text-muted/60" />
        <Link
          href={`/blogs?category=${post.category}`}
          className="hover:text-ink transition-colors"
        >
          {formatCategoryLabel(post.category)}
        </Link>
        <ChevronRight className="size-3.5 text-muted/60" />
        <span className="truncate max-w-[200px] text-ink font-medium">
          {post.title}
        </span>
      </nav>

      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to all articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getCategoryBadgeClasses(
              post.category
            )}`}
          >
            {formatCategoryLabel(post.category)}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="size-3.5" />
            {post.readingTime} min read
          </span>

          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Eye className="size-3.5" />
            {post.viewCount.toLocaleString()} views
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-ink">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg sm:text-xl leading-relaxed text-muted font-normal">
            {post.excerpt}
          </p>
        )}

        {/* Byline and Date */}
        <div className="flex flex-wrap items-center justify-between border-y border-line/70 py-4 gap-4 text-xs text-muted">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-display font-bold text-accent text-sm">
              CK
            </div>
            <div>
              <p className="font-semibold text-ink">CarBikeKharido Editorial</p>
              <p className="flex items-center gap-1 text-muted">
                <Calendar className="size-3" />
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Automotive Desk</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="my-8 relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper border border-line shadow-sm">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* Linked Vehicle Preview Card (Top placement if relevant) */}
      {post.vehicle && (
        <section aria-label="Referenced Vehicle in this Story">
          <VehiclePreviewCard vehicle={post.vehicle} />
        </section>
      )}

      {/* Article Body */}
      <div className="mt-8">
        <MarkdownContent content={post.content} />
      </div>

      {/* Tags Section */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 border-t border-line/70 pt-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            <TagIcon className="size-3.5" /> Related Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blogs?q=${encodeURIComponent(tag.name)}`}
                className="rounded-full border border-line bg-card px-3.5 py-1 text-xs font-medium text-ink/80 hover:border-ink hover:text-ink transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Related Stories
              </h2>
              <p className="text-xs text-muted mt-1">
                More from {formatCategoryLabel(post.category)}
              </p>
            </div>
            <Link
              href={`/blogs?category=${post.category}`}
              className="text-xs font-semibold text-accent hover:underline"
            >
              View category &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <BlogCard key={related.id} post={related} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
