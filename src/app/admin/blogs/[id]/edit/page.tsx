import React from "react";
import { notFound } from "next/navigation";
import { getPostById, getVehiclesForSelect } from "@/lib/actions/blog";
import { BlogForm } from "@/components/admin/BlogForm";

export const revalidate = 0;

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPage({ params }: EditPageProps) {
  const { id } = await params;
  const [post, vehicles] = await Promise.all([
    getPostById(id),
    getVehiclesForSelect(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BlogForm initialData={post} vehicles={vehicles} />
    </div>
  );
}
