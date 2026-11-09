import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitPulse Analytics — High-Performance GitHub Developer Intelligence",
  description: "Real-time GitHub analytics, DORA velocity metrics, PR lifecycle funnels, and AI text-to-insight powered by DuckDB.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080808] text-[#f4f4f5] antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
