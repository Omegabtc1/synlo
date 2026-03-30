"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SynloLogo } from "@/components/synlo-logo";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement | null)
      ?.value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement | null
    )?.value;

    if (!email || !password) {
      showToast("⚠️", "Please enter your email and password");
      return;
    }

    void (async () => {
      const result = await login(email, password);
      if (!result.success) {
        showToast("⚠️", result.error ?? "Login failed");
        return;
      }
      showToast("👋", "Welcome back!");
      setTimeout(() => router.push("/explore"), 300);
    })();
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div style={{ marginBottom: 28 }}>
          <SynloLogo href="/" small />
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to continue your journey 🚀</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <div style={{ textAlign: "right", marginBottom: 24 }}>
            <button
              type="button"
              style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", background: "none", border: "none", font: "inherit" }}
              onClick={() => showToast("🔑", "Password reset coming soon!")}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn-full">
            Login →
          </button>
        </form>
        <div className="auth-link">
          Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
        </div>
      </div>
    </div>
  );
}
