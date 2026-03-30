"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth";

const CITIES = ["Lagos", "Abuja", "Owerri", "Ibadan", "Port Harcourt"];

const INTERESTS = [
  { emoji: "💻", label: "Tech" },
  { emoji: "🎵", label: "Music" },
  { emoji: "👗", label: "Fashion" },
  { emoji: "🍲", label: "Food" },
  { emoji: "🎨", label: "Art" },
  { emoji: "📈", label: "Business" },
  { emoji: "⚽", label: "Sports" },
  { emoji: "🎮", label: "Gaming" },
  { emoji: "🎓", label: "Campus" },
  { emoji: "😂", label: "Comedy" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const { isLoading } = useRequireAuth("/login");
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  if (isLoading || !user) {
    return (
      <div className="auth-page">
        <div className="auth-bg" />
        <div className="auth-card">
          <div className="auth-title">Loading profile…</div>
        </div>
      </div>
    );
  }

  function toggleInterest(label: string) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    updateProfile({ name: clean, bio, city, interests });
    router.push("/profile");
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px 80px" }}>
        <Link
          href="/profile"
          className="back-btn"
          style={{ paddingTop: 0, marginBottom: 28 }}
        >
          ← Back to Profile
        </Link>

        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 8,
            }}
          >
            Account Settings
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-1px",
              marginBottom: 8,
            }}
          >
            Edit Profile
          </div>
          <div style={{ color: "var(--text-3)", fontSize: 14 }}>
            Update your public profile and preferences
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 24,
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontWeight: 800,
              color: "white",
              flexShrink: 0,
            }}
          >
            {getInitials(name || user.name)}
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {name || user.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>
              {user.email}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-3)",
                marginTop: 6,
              }}
            >
              Avatar is generated from your initials
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-3)",
                marginBottom: 20,
              }}
            >
              Basic Info
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full name
              </label>
              <input
                id="profile-name"
                className="input-field"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-bio">
                Bio
              </label>
              <textarea
                id="profile-bio"
                className="input-field"
                style={{ minHeight: 90, resize: "vertical" }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-city">
                City
              </label>
              <select
                id="profile-city"
                className="input-field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Select your city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-3)",
                marginBottom: 6,
              }}
            >
              Interests
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-3)",
                marginBottom: 16,
              }}
            >
              Pick what you&apos;re into — helps us surface the right events for
              you
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {INTERESTS.map(({ emoji, label }) => {
                const selected = interests.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleInterest(label)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      border: selected
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border)",
                      background: selected
                        ? "var(--accent-dim)"
                        : "var(--surface)",
                      color: selected ? "var(--accent)" : "var(--text-2)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{emoji}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/profile" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

