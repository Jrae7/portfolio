import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "JonraeOS | Jonrae Small",
    description:
      "Enter JonraeOS, the interactive virtual desktop portfolio of Jonrae Small, a cybersecurity student and systems builder.",
    openGraph: {
      title: "JonraeOS | Interactive Portfolio",
      description: "Explore Jonrae Small's AI and systems projects inside a fully interactive virtual desktop.",
      type: "website",
      url: origin,
      images: [{ url: `${origin}/og-os.png`, width: 1536, height: 1024, alt: "JonraeOS virtual desktop portfolio for Jonrae Small" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "JonraeOS | Interactive Portfolio",
      description: "Explore Jonrae Small's AI and systems projects inside a fully interactive virtual desktop.",
      images: [`${origin}/og-os.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
