import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { site } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonld";
import "./globals.css";

const GA_ID = "G-NLVESXBBMR";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.author}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: site.name,
    title: `${site.name} · ${site.author}`,
    description: site.tagline,
    url: site.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "zh-TW",
    author: { "@type": "Person", name: site.author, alternateName: site.authorRealName },
  };

  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
