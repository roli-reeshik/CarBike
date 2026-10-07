export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const clean = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_~`>[\]()!-]/g, " ")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
