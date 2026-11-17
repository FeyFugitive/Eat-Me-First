import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { BottomTabBar } from "@/components/BottomTabBar";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

/*
 * Out of scope for v1 (PLAN.md): login/auth, backend DB, barcode scan,
 * OCR, recipes, precise gram weights, multi-user sharing, native push.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EatMeFirst",
  description:
    "Your fridge's eat-me-first list — before it rots. 先吃我：按保质期区间排出库存。",
  applicationName: "EatMeFirst",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "EatMeFirst",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2e7d32",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <div className="app-shell relative flex flex-col">
          <main className="flex-1 px-4 pb-20 pt-6">{children}</main>
          <Suspense fallback={<div className="h-16" aria-hidden="true" />}>
            <BottomTabBar />
          </Suspense>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
