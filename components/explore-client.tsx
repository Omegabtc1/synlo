"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { SynloEvent } from "@/lib/events";
import { events as allEvents } from "@/lib/events";
import { EventCard } from "./event-card";

const CITIES = ["", "Lagos", "Abuja", "Owerri", "Ibadan", "Port Harcourt"] as const;

type Props = { initialEvents?: SynloEvent[] };

export function ExploreClient({ initialEvents = allEvents }: Props) {
  const { isLoggedIn, hydrated } = useAuth();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const filtered = useMemo(() => {
    const qLower = q.toLowerCase();
    return initialEvents.filter((e) => {
      const matchQ =
        !qLower ||
        e.title.toLowerCase().includes(qLower) ||
        e.city.toLowerCase().includes(qLower);
      const matchCity = !city || e.city === city;
      return matchQ && matchCity;
    });
  }, [initialEvents, q, city]);

  return (
    <div className="explore-page">
      <div className="explore-header">
        <div className="explore-title-row">
          <div>
            <div className="section-label">Browse</div>
            <div className="explore-h1">Explore Events</div>
          </div>
          {hydrated && isLoggedIn ? (
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>Good evening, Ade 👋</div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link className="btn-ghost" href="/login" style={{ fontSize: 13 }}>
                Login
              </Link>
              <Link className="btn-primary" href="/signup" style={{ fontSize: 13 }}>
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
        <div className="search-filter-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="search"
              placeholder="Search events, artists, venues..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search events"
            />
          </div>
          <select
            className="filter-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Filter by city"
          >
            {CITIES.map((c) => (
              <option key={c || "all"} value={c}>
                {c === "" ? "All Cities" : c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="explore-content">
        {filtered.length === 0 ? (
          <EmptyExplore />
        ) : (
          <div className="events-grid">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyExplore() {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-3)" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
        No events found
      </div>
      <div style={{ fontSize: 14 }}>Try a different search or location</div>
    </div>
  );
}
