"use client";

import { AppNav } from "@/components/app-nav";
import { PublicNav } from "@/components/public-nav";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/contexts/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <PublicNav />
        <AppNav />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
