"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SynloLogo } from "./synlo-logo";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, hydrated, user } = useAuth();
  const { showToast } = useToast();

  const loggedIn = hydrated ? isLoggedIn : false;

  const hideAppNav =
    !loggedIn || pathname === "/" || pathname === "/login" || pathname === "/signup";
  if (hideAppNav) return null;

  const exploreActive = pathname === "/explore" || pathname.startsWith("/events/");

  return (
    <nav className="app-nav">
      <SynloLogo href="/explore" />
      <div className="app-nav-links">
        <Link
          className={`app-nav-link ${exploreActive ? "active-link" : ""}`}
          href="/explore"
        >
          Explore
        </Link>
        <button
          type="button"
          className="app-nav-link"
          onClick={() => showToast("🎟️", "My Tickets coming soon!")}
        >
          My Tickets
        </button>
        <button
          type="button"
          className="app-nav-link"
          onClick={() => showToast("🤝", "Affiliate dashboard coming soon!")}
        >
          Affiliate
        </button>
        <button
          type="button"
          className="app-nav-link"
          onClick={() => showToast("🎪", "Organizer tools coming soon!")}
        >
          Organizer
        </button>
      </div>
      <button
        type="button"
        className="avatar-btn"
        aria-label="Profile"
        onClick={() => {
          router.push("/profile");
        }}
      >
        {(user?.name || "User")
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </button>
    </nav>
  );
}
