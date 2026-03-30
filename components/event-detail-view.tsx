import Link from "next/link";
import type { SynloEvent } from "@/lib/events";
import { EventDetailActions } from "./event-detail-actions";

type Props = { event: SynloEvent; backHref: string };

export function EventDetailView({ event, backHref }: Props) {
  return (
    <div className="event-detail">
      <div className="event-banner">
        <div className={`event-banner-inner ${event.gradient}`}>{event.emoji}</div>
        <div className="event-banner-overlay" />
      </div>
      <div className="event-content">
        <Link className="back-btn" href={backHref}>
          ← Back to Explore
        </Link>
        <div className="event-tag">{event.category}</div>
        <h1 className="event-h1">{event.title}</h1>

        <div className="event-meta-row">
          <div className="event-meta-item">
            <div className="event-meta-icon">📍</div>
            <div>
              <div className="event-meta-label">Location</div>
              <div className="event-meta-value">{event.location}</div>
            </div>
          </div>
          <div className="event-meta-item">
            <div className="event-meta-icon">🗓</div>
            <div>
              <div className="event-meta-label">Date</div>
              <div className="event-meta-value">{event.date}</div>
            </div>
          </div>
          <div className="event-meta-item">
            <div className="event-meta-icon">⏰</div>
            <div>
              <div className="event-meta-label">Time</div>
              <div className="event-meta-value">{event.time}</div>
            </div>
          </div>
        </div>

        <p className="event-desc">{event.description}</p>

        <EventDetailActions event={event} />

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "var(--text-3)",
              marginBottom: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Who&apos;s Going
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="avatar-group">
              <div className="avatar-sm" style={{ background: "linear-gradient(135deg,#f97316,#fb923c)" }}>
                O
              </div>
              <div className="avatar-sm" style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)" }}>
                A
              </div>
              <div className="avatar-sm" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                C
              </div>
              <div className="avatar-sm" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                E
              </div>
              <div className="avatar-sm" style={{ background: "var(--muted)", color: "var(--text-2)", fontSize: 10 }}>
                +247
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              <strong style={{ color: "var(--text)" }}>251 people</strong> are attending this event
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
