"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SynloLogo } from "@/components/synlo-logo";

export default function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement | null)
      ?.value;
    const email = (form.elements.namedItem("email") as HTMLInputElement | null)
      ?.value;
    const password = (
      form.elements.namedItem("password") as HTMLInputElement | null
    )?.value;

    if (!name || !email || !password) {
      showToast("⚠️", "Please fill in all fields");
      return;
    }

    void (async () => {
      const result = await signup(name, email, password);
      if (!result.success) {
        showToast("⚠️", result.error ?? "Signup failed");
        return;
      }
      showToast("🎉", "Account created! Welcome to Synlo!");
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
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Join thousands of Nigerians already on Synlo 🇳🇬</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="su-name">
              Full name
            </label>
            <input
              id="su-name"
              name="name"
              className="input-field"
              type="text"
              placeholder="Chukwuemeka Obi"
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="su-email">
              Email address
            </label>
            <input
              id="su-email"
              name="email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="su-password">
              Password
            </label>
            <input
              id="su-password"
              name="password"
              className="input-field"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <button type="submit" className="btn-full">
              Create Account →
            </button>
          </div>
        </form>
        <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", marginBottom: 16 }}>
          By signing up, you agree to our Terms & Privacy Policy
        </div>
        <div className="auth-link">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
