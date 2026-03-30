"use client";

import { useState } from "react";
import { useToast } from "@/contexts/toast-context";

export function WaitlistSection() {
  const { showToast } = useToast();
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function joinWaitlist() {
    const n = name.trim();
    const e = email.trim();
    if (!n || !e) {
      showToast("⚠️", "Please fill in your name and email");
      return;
    }
    setDone(true);
    showToast("🎉", "You're on the waitlist!");
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 24px",
      }}
      id="waitlist"
    >
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", marginBottom: 40 }}>
        <div className="section-label">Early Access</div>
        <div className="section-title">Be the first to know</div>
        <div className="section-sub" style={{ margin: "0 auto" }}>
          Get exclusive early access, event invites, and updates before everyone else.
        </div>
      </div>
      <div className="waitlist-box">
        <div className="waitlist-counter">
          <div className="counter-dot" />
          <span>
            <strong>3,248 people</strong> already joined
          </span>
        </div>
        <div className={`waitlist-form ${done ? "hidden" : ""}`}>
          <input
            className="input-field"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <input
            className="input-field"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
          <button type="button" className="btn-full" onClick={joinWaitlist}>
            Join the Waitlist 🚀
          </button>
        </div>
        <div className={`waitlist-success ${done ? "visible" : ""}`}>
          <div className="success-icon">🎉</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
            You&apos;re on the list!
          </div>
          <div style={{ color: "var(--text-3)", fontSize: 14 }}>
            We&apos;ll notify you when Synlo goes live. Spread the word!
          </div>
        </div>
      </div>
    </div>
  );
}
