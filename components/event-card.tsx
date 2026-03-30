import Link from "next/link";
import type { SynloEvent } from "@/lib/events";

type Props = { event: SynloEvent; animationClass?: string };

export function EventCard({ event, animationClass = "fade-up" }: Props) {
  const preview = `${event.description.slice(0, 90)}...`;

  return (
    <Link href={`/events/${event.id}`} className={`event-card ${animationClass}`}>
      <div className={`card-img-placeholder ${event.gradient}`}>
        <span>{event.emoji}</span>
        <div className="card-badge">
          <span className={`chip ${event.categoryTag}`}>{event.category}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta">📍 {event.city}</div>
        <div className="card-title">{event.title}</div>
        <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>
          {preview}
        </div>
        <div className="card-footer">
          <div className="card-date">🗓 {event.date}</div>
          <div className="card-price">{event.price}</div>
        </div>
      </div>
    </Link>
  );
}
