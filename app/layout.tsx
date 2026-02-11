import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://briefgen.ai"),
  title: "BriefGen.ai",
  description: "Generate concise, high-signal briefs in minutes.",
  openGraph: {
    title: "BriefGen.ai",
    description: "Generate concise, high-signal briefs in minutes.",
    url: "https://briefgen.ai",
    siteName: "BriefGen.ai",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BriefGen.ai",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
