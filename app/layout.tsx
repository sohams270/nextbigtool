import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Big Tool — Where Builders Launch. Where Buyers Discover.",
  description: "Find the next big thing before it goes mainstream. Or launch your product to an audience that gets it.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" style={{ zoom: "1.5" }}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
