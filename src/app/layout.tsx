import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PDFMyReadme - Transform Markdown to PDF & DOCX",
    template: "%s | PDFMyReadme"
  },
  description: "Convert your README and Markdown files into beautiful, professional PDF and DOCX documents instantly. Real-time preview, modern design, and perfect formatting for documentation, portfolios, and reports.",
  keywords: [
    "markdown to pdf",
    "readme converter",
    "markdown to docx",
    "pdf generator",
    "document converter",
    "markdown editor",
    "readme to pdf",
    "online converter",
    "documentation tool",
    "markdown preview",
    "export markdown",
    "pdf creator",
    "readme generator",
    "markdown formatter",
    "document generator"
  ],
  authors: [{ name: "Maitrek Patel", url: "https://maitrekpatel.tech" }],
  creator: "Maitrek Patel",
  publisher: "PDFMyReadme",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pdfmyreadme.maitrekpatel.tech",
    siteName: "PDFMyReadme",
    title: "PDFMyReadme - Transform Markdown to PDF & DOCX",
    description: "Convert your README and Markdown files into beautiful, professional PDF and DOCX documents instantly. Real-time preview, modern design, and perfect formatting for documentation, portfolios, and reports.",
    images: [
      {
        url: "https://pdfmyreadme.maitrekpatel.tech/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFMyReadme - Transform Markdown to PDF & DOCX Converter - Free Online Tool",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@maitrekpatel",
    creator: "@maitrekpatel",
    title: "PDFMyReadme - Transform Markdown to PDF & DOCX",
    description: "Convert your README and Markdown files into beautiful, professional PDF and DOCX documents instantly. Real-time preview, modern design, and perfect formatting for documentation, portfolios, and reports.",
    images: ["https://pdfmyreadme.maitrekpatel.tech/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#10b981" },
    ],
  },
  category: "Technology",
  classification: "Business Tool",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pdfmyreadme.maitrekpatel.tech"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-site-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "PDFMyReadme",
    "theme-color": "#10b981",
    "color-scheme": "light",
    "viewport": "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PDFMyReadme" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PDFMyReadme" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "PDFMyReadme",
              "url": "https://pdfmyreadme.maitrekpatel.tech",
              "description": "Convert your README and Markdown files into beautiful, professional PDF and DOCX documents instantly. Real-time preview, modern design, and perfect formatting for documentation, portfolios, and reports.",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "creator": {
                "@type": "Person",
                "name": "Maitrek Patel",
                "url": "https://maitrekpatel.tech"
              },
              "featureList": [
                "Real-time Markdown preview",
                "PDF export",
                "DOCX export",
                "Modern responsive design",
                "No registration required",
                "Free to use"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
