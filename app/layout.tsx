import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C2B Web Design — Websites that work as hard as you do",
  description: "C2B Web Design builds fast, focused websites for small businesses. No templates, no bloat — just a site that wins you clients.",
  openGraph: {
    title: "C2B Web Design — Websites that work as hard as you do",
    description: "C2B Web Design builds fast, focused websites for small businesses. No templates, no bloat — just a site that wins you clients.",
    type: "website",
  },
  // ⚠ REMOVE BEFORE LAUNCH — see the same warning in `app/robots.ts`.
  // The site is unfinished and its production alias is publicly reachable
  // (Vercel protection covers previews only on Hobby). `robots.ts` blocks
  // crawlers via robots.txt; this is the second half, because some crawlers
  // honour the meta tag but not the file. Neither is access control.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
