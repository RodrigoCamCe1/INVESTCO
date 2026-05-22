import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ====================================================================
  // OPTIMIZACIONES DE COMPILACIÓN Y RUNTIME
  // ====================================================================
  reactStrictMode: true,
  poweredByHeader: false,

  // ====================================================================
  // CONFIGURACIÓN DE IMAGEN
  // ====================================================================
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ====================================================================
  // HEADERS DE SEGURIDAD
  // ====================================================================
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },

  // ====================================================================
  // CONFIGURACIÓN DE WEBPACK
  // ====================================================================
  webpack: (config, { isServer }) => {
    // Optimizaciones personalizadas de webpack
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react-vendors",
          priority: 10,
          reuseExistingChunk: true,
        },
        tanstack: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
          name: "tanstack-vendors",
          priority: 9,
          reuseExistingChunk: true,
        },
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: "recharts-vendors",
          priority: 8,
          reuseExistingChunk: true,
        },
      };
    }

    return config;
  },

  // ====================================================================
  // COMPRESIÓN Y CACHÉ
  // ====================================================================
  compress: true,
  swcMinify: true,

  // ====================================================================
  // VARIABLES DE ENTORNO
  // ====================================================================
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    NEXT_PUBLIC_APP_NAME: "Investco ERP",
  },

  // ====================================================================
  // EXPERIMENTAL FEATURES (Next.js 15)
  // ====================================================================
  experimental: {
    // Optimizaciones para mejor rendimiento
    optimizePackageImports: [
      "@tanstack/react-query",
      "@tanstack/react-table",
      "recharts",
      "zustand",
    ],
  },

  // ====================================================================
  // REESCRITURAS (Para proxy a API)
  // ====================================================================
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ],
    };
  },

  // ====================================================================
  // REDIRECTS
  // ====================================================================
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
