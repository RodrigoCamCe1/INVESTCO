"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthSessionProvider } from "@/providers/auth-session-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthSessionProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </AuthSessionProvider>
  );
}
