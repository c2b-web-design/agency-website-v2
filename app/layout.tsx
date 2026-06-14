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
