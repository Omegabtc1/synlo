"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "Recently";
  }
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { isLoading } = useRequireAuth("/login");
  const router = useRouter();

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

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div
        style={{
          height: 180,
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #1a0533 0%, #2d1b69 50%, #1e3a5f 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 80% at 50% 100%, rgba(249,115,22,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: -48,
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--accent), var(--purple))",
                border: "4px solid var(--bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontSize: 32,
                fontWeight: 800,
                color: "white",
                flexShrink: 0,
              }}
            >
              {getInitials(user.name)}
            </div>
            <div style={{ paddingBottom: 4 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text-3)",
                  marginTop: 4,
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
          <Link href="/profile/edit" className="btn-ghost" style={{ fontSize: 13 }}>
            ✏️ Edit Profile
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <InfoCard
            icon="📍"
            label="City"
            value={user.city || "Not set"}
          />
          <InfoCard
            icon="🗓"
            label="Member since"
            value={formatJoined(user.joinedAt)}
          />
          <InfoCard icon="🎟️" label="Events attended" value="0 events" />
        </div>

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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 12,
            }}
          >
            About
          </div>
          <div
            style={{
              fontSize: 15,
              color: user.bio ? "var(--text-2)" : "var(--text-3)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            {user.bio || "No bio yet. Tell people a bit about yourself!"}
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
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 14,
            }}
          >
            Interests
          </div>
          {user.interests && user.interests.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user.interests.map((i) => (
                <span
                  key={i}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 100,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: 13,
                    color: "var(--text-2)",
                    fontWeight: 500,
                  }}
                >
                  {i}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-3)" }}>
              No interests yet.{" "}
              <Link
                href="/profile/edit"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Add some →
              </Link>
            </div>
          )}
        </div>

        <div
          style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "var(--radius)",
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
              Log out
            </div>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>
              You can always log back in
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost"
            style={{
              borderColor: "rgba(239,68,68,0.4)",
              color: "#f87171",
              fontSize: 13,
            }}
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--text)",
            fontWeight: 500,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

