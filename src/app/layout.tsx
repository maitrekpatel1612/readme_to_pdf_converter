import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "README to PDF Converter",
  description: "Transform your README files into beautiful PDFs instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
