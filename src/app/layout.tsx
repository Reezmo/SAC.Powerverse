import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

// Only Inter (--font-sans, used for body/headings) and Geist Mono
// (--font-geist-mono, used for font-mono) are referenced in globals.css.
// Geist Sans was previously loaded here too but nothing consumed its
// CSS variable, so it was pure dead weight on every page load — dropped.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAC Powerverse",
  description: "Entity and DSAC performance reporting portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", geistMono.variable, "font-sans", inter.variable)}>
      <body className="min-h-full bg-[#f5f7fb] text-slate-900">{children}</body>
    </html>
  );
}
