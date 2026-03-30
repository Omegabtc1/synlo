"use client";

import Link from "next/link";
import { useToast } from "@/contexts/toast-context";

type Props = { variant?: "full" | "minimal" };

export function Footer({ variant = "full" }: Props) {
  const { showToast } = useToast();

  if (variant === "minimal") {
    return (
      <footer className="footer">
        © 2026 Synlo Inc. ·{" "}
        <Link href="/" style={{ cursor: "pointer", color: "var(--accent)" }}>
          Back to Home
        </Link>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 8,
          color: "var(--text)",
        }}
      >
        Synlo
        <span
          style={{
            display: "inline-block",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--accent)",
            marginLeft: 3,
            marginBottom: 2,
            verticalAlign: "middle",
          }}
          aria-hidden
        />
      </div>
      <div style={{ marginBottom: 16 }}>Where your vibe finds its match 🇳🇬</div>
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <button
          type="button"
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", font: "inherit" }}
          onClick={() => showToast("📄", "Coming soon!")}
        >
          About
        </button>
        <button
          type="button"
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", font: "inherit" }}
          onClick={() => showToast("📬", "hello@synlo.ng")}
        >
          Contact
        </button>
        <button
          type="button"
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", font: "inherit" }}
          onClick={() => showToast("📜", "Terms coming soon!")}
        >
          Terms
        </button>
        <button
          type="button"
          style={{ cursor: "pointer", background: "none", border: "none", color: "inherit", font: "inherit" }}
          onClick={() => showToast("🔒", "Privacy policy coming soon!")}
        >
          Privacy
        </button>
      </div>
      <div>© 2026 Synlo Inc. Built with ❤️ in Nigeria.</div>
    </footer>
  );
}
