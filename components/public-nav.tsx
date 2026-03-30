"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { SynloLogo } from "./synlo-logo";

export function PublicNav() {
  const pathname = usePathname();
  const { isLoggedIn, hydrated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const loggedIn = hydrated ? isLoggedIn : false;
  const hidePubNav = loggedIn && pathname !== "/";
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  if (hidePubNav) return null;

  return (
    <>
      <nav className="pub-nav">
        <SynloLogo href="/" />
        <div className="pub-nav-links">
          <Link className="nav-link" href="/explore">
            Explore
          </Link>
          <button type="button" className="nav-link" onClick={() => scrollToWaitlist()}>
            Waitlist
          </button>
          <Link className="btn-ghost" href="/login" style={{ marginLeft: 8 }}>
            Login
          </Link>
          <Link className="btn-primary" href="/signup" style={{ marginLeft: 8 }}>
            Sign Up
          </Link>
        </div>
        <button
          type="button"
          className="hamburger"
          aria-expanded={menuOpen}
          aria-label="Menu"
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link className="mobile-link" href="/explore" onClick={closeMenu}>
          Explore
        </Link>
        <button
          type="button"
          className="mobile-link"
          onClick={() => {
            scrollToWaitlist();
            closeMenu();
          }}
        >
          Waitlist
        </button>
        <Link className="mobile-link" href="/login" onClick={closeMenu}>
          Login
        </Link>
        <Link
          className="mobile-link"
          style={{ color: "var(--accent)" }}
          href="/signup"
          onClick={closeMenu}
        >
          Sign Up →
        </Link>
      </div>
    </>
  );
}

function scrollToWaitlist() {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/") {
    window.location.href = "/#waitlist";
    return;
  }
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
}
