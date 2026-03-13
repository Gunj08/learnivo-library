import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learnivo Library - India's Open Education Library Portal",
  description:
    "Upload, manage, and share educational books with AI-powered smart scanning. Open API for external platforms.",
  keywords: [
    "education",
    "library",
    "books",
    "NCERT",
    "CBSE",
    "learning",
    "India",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
