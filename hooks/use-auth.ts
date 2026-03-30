 "use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function useRequireAuth(redirectTo: string = "/login") {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      const next = pathname && pathname !== "/login" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(redirectTo + next);
    }
  }, [isLoading, isLoggedIn, redirectTo, router, pathname]);

  return { isLoggedIn, isLoading };
}

