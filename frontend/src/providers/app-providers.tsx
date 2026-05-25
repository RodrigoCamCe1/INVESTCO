"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthSessionProvider } from "@/providers/auth-session-provider";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthSessionProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthSessionProvider>
    </QueryProvider>
  );
}
