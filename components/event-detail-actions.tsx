"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import type { SynloEvent } from "@/lib/events";

type Props = { event: SynloEvent };

export function EventDetailActions({ event }: Props) {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  function buy(tier: string) {
    if (!isLoggedIn) {
      showToast("🔐", "Login to buy tickets!");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    showToast("🎟️", `${tier} ticket added to cart!`);
  }

  function affiliate() {
    if (!isLoggedIn) {
      showToast("🔐", "Login to become an affiliate!");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    showToast("🤝", "Affiliate dashboard coming soon!");
  }

  function plusOne() {
    if (!isLoggedIn) {
      showToast("🔐", "Login to find a plus-one!");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    showToast("👫", "Plus-one matching coming soon!");
  }

  return (
    <>
      <div className="ticket-section">
        <h3>🎟️ Choose Your Ticket</h3>
        {event.tickets.map((t) => (
          <div key={t.name} className="ticket-row">
            <div>
              <div className="ticket-name">{t.name}</div>
              <div className="ticket-desc">{t.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
              <div className="ticket-price">{t.price}</div>
              <button type="button" className="ticket-btn ticket-btn-primary" onClick={() => buy(t.name)}>
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="extra-actions">
        <button type="button" className="action-card" style={{ border: "none", color: "inherit" }} onClick={affiliate}>
          <div className="action-card-icon">🤝</div>
          <div className="action-card-title">Become an Affiliate</div>
          <div className="action-card-sub">Earn commission by sharing this event</div>
        </button>
        <button type="button" className="action-card" style={{ border: "none", color: "inherit" }} onClick={plusOne}>
          <div className="action-card-icon">👫</div>
          <div className="action-card-title">Find a Plus-One</div>
          <div className="action-card-sub">Connect with other attendees going solo</div>
        </button>
      </div>
    </>
  );
}
