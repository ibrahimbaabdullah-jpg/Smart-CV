import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { profile } from "@/lib/cv";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${profile.name.ar} | السيرة الذاتية الذكية`,
  description: profile.summary.ar,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${plexArabic.variable} antialiased`}>{children}</body>
    </html>
  );
}
