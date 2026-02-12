import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { landingSeo } from "@/lib/landing-content";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://briefgen.ai"),
  title: {
    default: landingSeo.title,
    template: "%s | BriefGen.ai",
  },
  description: landingSeo.description,
  openGraph: {
    title: landingSeo.ogTitle,
    description: landingSeo.ogDescription,
    url: "https://briefgen.ai",
    siteName: "BriefGen.ai",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BriefGen.ai research report preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: landingSeo.ogTitle,
    description: landingSeo.ogDescription,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://briefgen.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans`}>{children}</body>
    </html>
  );
}
