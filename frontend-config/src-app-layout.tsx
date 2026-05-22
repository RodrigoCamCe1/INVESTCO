import type { Metadata } from "next";
import { Providers } from "@/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Investco ERP - Sistema de Gestión de Obras",
    template: "%s | Investco ERP",
  },
  description:
    "Sistema de gestión y control de avance de obras civiles e inmobiliarias",
  keywords: [
    "ERP",
    "Gestión de Obras",
    "Inmobiliario",
    "Control de Proyectos",
    "Bolivia",
  ],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: "https://investco.bo",
    siteName: "Investco ERP",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#0066CC" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Investco" />

        {/* Font preload */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className="bg-neutral-50 text-neutral-900 antialiased">
        {/* Providers (Query Client, Auth, Theme, etc.) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
