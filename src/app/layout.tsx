import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VibeProvider } from "@/context/VibeContext";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sisyphus | Cognitive Task Offloading",
  description: "An intelligent, AI-driven task management application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50 selection:bg-zinc-800 selection:text-white`}
      >
        <VibeProvider>
          {children}
        </VibeProvider>
        <Analytics />
      </body>
    </html>
  );
}
