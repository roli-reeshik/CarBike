import type { NextConfig } from "next";

type ImageRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
};

/**
 * Remote hosts allowed through next/image.
 * `*` matches one subdomain label; `**` matches any number of labels.
 */
const remotePatterns: ImageRemotePattern[] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.r2.dev",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.r2.cloudflarestorage.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.s3.amazonaws.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.s3.*.amazonaws.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "s3.*.amazonaws.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "auto.dev",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.auto.dev",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "carimagesapi.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "**.carimagesapi.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "cdn.carimagesapi.com",
    pathname: "/**",
  },
];


function withCdnHost(patterns: ImageRemotePattern[]): ImageRemotePattern[] {
  const raw = process.env.NEXT_PUBLIC_CDN_URL;
  if (!raw) return patterns;

  let cdn: URL;
  try {
    cdn = new URL(raw);
  } catch {
    return patterns;
  }

  const protocol: ImageRemotePattern["protocol"] | null =
    cdn.protocol === "https:"
      ? "https"
      : cdn.protocol === "http:"
        ? "http"
        : null;
  if (!protocol) return patterns;
  if (patterns.some((pattern) => pattern.hostname === cdn.hostname)) {
    return patterns;
  }

  return [
    ...patterns,
    {
      protocol,
      hostname: cdn.hostname,
      pathname: "/**",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: withCdnHost(remotePatterns),
  },
};

export default nextConfig;
