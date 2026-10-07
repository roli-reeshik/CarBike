import React from "react";
import { getVehiclesForSelect } from "@/lib/actions/blog";
import { BlogForm } from "@/components/admin/BlogForm";

export const revalidate = 0;

export default async function AdminNewBlogPage() {
  const vehicles = await getVehiclesForSelect();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <BlogForm vehicles={vehicles} />
    </div>
  );
}
