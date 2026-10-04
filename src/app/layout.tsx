import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Geist } from "next/font/google";
import { ComparisonDock } from "@/components/comparison-dock";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarBikeKharido — Find a car or bike",
  description:
    "Match cars, bikes, and upcoming EVs in India by budget, fuel, transmission, and how you ride.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <Suspense
          fallback={
            <div className="sticky top-0 z-50 h-16 border-b border-line/80 bg-white/95 backdrop-blur-md" />
          }
        >
          <Navbar />
        </Suspense>
        {children}
        <ComparisonDock />
        {/* CarImagesAPI Official JavaScript Loader for Instant CDN Vehicle Images */}
        <Script
          id="car-images-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.CI_DEFAULT_TYPE='any';
(function(c,a,r,i){c.CI_API_KEY=i;var s=a.createElement('script');
s.async=1;s.src=r+'?v='+new Date().toISOString().slice(0,10).replace(/-/g,'');
a.head.appendChild(s)})(window,document,'https://carimagesapi.com/assets/js/carimages.js','ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120');
            `,
          }}
        />
      </body>
    </html>
  );
}
