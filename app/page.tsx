import Link from "next/link";
import { Footer } from "@/components/footer";
import { WaitlistSection } from "@/components/waitlist-section";
import { EventCard } from "@/components/event-card";
import { events } from "@/lib/events";

const PREVIEW_IDS = ["lagos-tech", "abuja-creators", "owerri-campus"] as const;
const ANIM = ["fade-up", "fade-up-2", "fade-up-3"] as const;

export default function HomePage() {
  const preview = PREVIEW_IDS.map((id) => events.find((e) => e.id === id)).filter(Boolean);
  const cards = preview.map((e, i) => (
    <EventCard key={e!.id} event={e!} animationClass={ANIM[i] ?? "fade-up"} />
  ));

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-badge">🇳🇬 Nigeria&apos;s social discovery platform</div>
        <h1 className="fade-up">
          Where your <em>vibe</em>
          <br />
          finds its match
        </h1>
        <p className="hero-sub fade-up-2">
          Discover events, meet people, and create experiences that actually matter to you.
        </p>
        <div className="hero-actions fade-up-3">
          <Link className="btn-primary btn-lg" href="/explore">
            Explore Events →
          </Link>
          <Link className="btn-ghost btn-lg" href="/#waitlist">
            Join Waitlist
          </Link>
        </div>
        <div className="hero-scroll-hint fade-up-4">
          <span>scroll</span>
          <span>↓</span>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div className="section-label">Happening Now</div>
            <div className="section-title" style={{ marginBottom: 0 }}>
              Events near you
            </div>
          </div>
          <Link className="btn-ghost" href="/explore" style={{ fontSize: 13 }}>
            View all →
          </Link>
        </div>
        <div className="events-grid">{cards}</div>
      </div>

      <WaitlistSection />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div className="section-label" style={{ textAlign: "center" }}>
          How Synlo Works
        </div>
        <div className="section-title" style={{ textAlign: "center", marginBottom: 12 }}>
          Your social life, supercharged
        </div>
        <div className="section-sub" style={{ textAlign: "center", margin: "0 auto 56px" }}>
          Three simple steps to finding your next memorable experience.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 24,
          }}
        >
          <StepCard emoji="🔍" title="Discover" text="Browse hundreds of curated events across Nigeria, filtered by city, vibe, and budget." />
          <StepCard emoji="🎟️" title="Book" text="Secure your spot in seconds. No wahala, no long queues — just smooth digital ticketing." />
          <StepCard emoji="🤝" title="Connect" text="Find a plus-one, meet other attendees, and build real connections at every event." />
        </div>
      </div>

      <Footer />
    </>
  );
}

function StepCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 28,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ color: "var(--text-3)", fontSize: 14, lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}
