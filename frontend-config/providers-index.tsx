"use client";

import { PropsWithChildren } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "next-themes";

/**
 * AGREGADOR DE PROVIDERS
 * 
 * Combina todos los proveedores de la aplicación en orden correcto:
 * 1. ThemeProvider (dark mode)
 * 2. QueryProvider (TanStack Query)
 * 3. AuthProvider (Autenticación)
 */

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
