import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import OnboardingGate from "./components/OnboardingGate";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Next Big Tool — Where Builders Launch. Where Buyers Discover.",
  description: "Find the next big thing before it goes mainstream. Or launch your product to an audience that gets it.",
  icons: {
    icon: [
      { url: "/favicon.ico",        sizes: "any" },
      { url: "/favicon-32x32.png",  type: "image/png", sizes: "32x32" },
      { url: "/favicon-96x96.png",  type: "image/png", sizes: "96x96" },
      { url: "/favicon-192x192.png",type: "image/png", sizes: "192x192" },
      { url: "/favicon-512x512.png",type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon-32x32.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-D7D4CK7NQ7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-D7D4CK7NQ7');
          `}
        </Script>
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          {/* zoom wrapper — keeps html/body at natural 100vw so no side gaps */}
          <div className="zoom-root">
            {children}
            <ThemeToggle />
            <OnboardingGate />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
