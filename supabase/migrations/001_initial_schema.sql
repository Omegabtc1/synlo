-- ═══════════════════════════════════════════════════════
-- SYNLO PLATFORM — COMPLETE DATABASE SCHEMA
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT NOT NULL,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('attendee','organizer','verifier','admin')),
  phone         TEXT,
  bio           TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable" ON public.users
  FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('tech','music','arts','food','sports','business','education','fashion','comedy','campus','other')),
  tags            TEXT[] DEFAULT '{}',
  cover_image     TEXT,
  venue_name      TEXT NOT NULL,
  venue_address   TEXT NOT NULL,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL DEFAULT 'Lagos',
  country         TEXT NOT NULL DEFAULT 'Nigeria',
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  timezone        TEXT DEFAULT 'Africa/Lagos',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','cancelled','completed')),
  is_private      BOOLEAN DEFAULT FALSE,
  capacity        INTEGER NOT NULL DEFAULT 100,
  tickets_sold    INTEGER NOT NULL DEFAULT 0,
  views           INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are public" ON public.events
  FOR SELECT USING (status = 'published' AND is_private = FALSE);

CREATE POLICY "Organizers manage own events" ON public.events
  FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Admins see all events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
CREATE INDEX idx_events_category ON public.events(category);

-- ─────────────────────────────────────────────
-- TICKET TIERS
-- ─────────────────────────────────────────────
CREATE TABLE public.ticket_tiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general','vip','vvip','early_bird','custom')),
  description     TEXT,
  price           INTEGER NOT NULL DEFAULT 0, -- kobo
  quantity        INTEGER NOT NULL DEFAULT 100,
  quantity_sold   INTEGER NOT NULL DEFAULT 0,
  max_per_order   INTEGER NOT NULL DEFAULT 10,
  sale_starts_at  TIMESTAMPTZ,
  sale_ends_at    TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are public for published events" ON public.ticket_tiers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status = 'published')
  );

CREATE POLICY "Organizers manage own tiers" ON public.ticket_tiers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

CREATE INDEX idx_tiers_event ON public.ticket_tiers(event_id);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       TEXT NOT NULL UNIQUE, -- our internal ref
  flutterwave_id  TEXT UNIQUE,
  user_id         UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  tickets         JSONB NOT NULL DEFAULT '[]', -- [{tier_id, quantity, unit_price}]
  subtotal        INTEGER NOT NULL, -- kobo — what organizer gets
  platform_fee    INTEGER NOT NULL, -- kobo — Synlo's cut (10%)
  total           INTEGER NOT NULL, -- kobo — buyer pays
  currency        TEXT NOT NULL DEFAULT 'NGN',
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  affiliate_id    UUID REFERENCES public.users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers see event payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_event ON public.payments(event_id);
CREATE INDEX idx_payments_reference ON public.payments(reference);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ─────────────────────────────────────────────
-- TICKETS
-- ─────────────────────────────────────────────
CREATE TABLE public.tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code     TEXT NOT NULL UNIQUE, -- used in QR
  event_id        UUID NOT NULL REFERENCES public.events(id),
  tier_id         UUID NOT NULL REFERENCES public.ticket_tiers(id),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  payment_id      UUID NOT NULL REFERENCES public.payments(id),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','cancelled','refunded')),
  holder_name     TEXT NOT NULL,
  holder_email    TEXT NOT NULL,
  checked_in_at   TIMESTAMPTZ,
  checked_in_by   UUID REFERENCES public.users(id),
  affiliate_id    UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers see event tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Verifiers can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.verifiers WHERE event_id = tickets.event_id AND user_id = auth.uid() AND is_active = TRUE)
  );

CREATE INDEX idx_tickets_user ON public.tickets(user_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX idx_tickets_status ON public.tickets(status);

-- ─────────────────────────────────────────────
-- AFFILIATES
-- ─────────────────────────────────────────────
CREATE TABLE public.affiliates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  referral_code   TEXT NOT NULL UNIQUE,
  clicks          INTEGER NOT NULL DEFAULT 0,
  conversions     INTEGER NOT NULL DEFAULT 0,
  total_earned    INTEGER NOT NULL DEFAULT 0, -- kobo
  total_withdrawn INTEGER NOT NULL DEFAULT 0,
  commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0500, -- 5%
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates see own records" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers see event affiliates" ON public.affiliates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

CREATE INDEX idx_affiliates_user ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_event ON public.affiliates(event_id);
CREATE INDEX idx_affiliates_code ON public.affiliates(referral_code);

-- ─────────────────────────────────────────────
-- VERIFIERS
-- ─────────────────────────────────────────────
CREATE TABLE public.verifiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.users(id),
  assigned_by     UUID NOT NULL REFERENCES public.users(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.verifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifiers see own assignments" ON public.verifiers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers manage verifiers" ON public.verifiers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- SCAN LOGS
-- ─────────────────────────────────────────────
CREATE TABLE public.scan_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID REFERENCES public.tickets(id),
  ticket_code     TEXT NOT NULL, -- kept even if ticket deleted
  verifier_id     UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  result          TEXT NOT NULL CHECK (result IN ('valid','invalid','already_used','wrong_event')),
  device_info     TEXT,
  scanned_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers see scan logs" ON public.scan_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Verifiers insert scan logs" ON public.scan_logs
  FOR INSERT WITH CHECK (auth.uid() = verifier_id);

CREATE INDEX idx_scan_logs_event ON public.scan_logs(event_id);
CREATE INDEX idx_scan_logs_ticket ON public.scan_logs(ticket_id);

-- ─────────────────────────────────────────────
-- PLUS ONE REQUESTS
-- ─────────────────────────────────────────────
CREATE TABLE public.plus_one_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  status          TEXT NOT NULL DEFAULT 'looking_for' CHECK (status IN ('looking_for','available_as','matched','inactive')),
  bio_note        TEXT,
  age_range       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.plus_one_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plus one requests are visible to ticket holders" ON public.plus_one_requests
  FOR SELECT USING (TRUE);

CREATE POLICY "Users manage own requests" ON public.plus_one_requests
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- WAVES (Like / Interest signals)
-- ─────────────────────────────────────────────
CREATE TABLE public.waves (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id    UUID NOT NULL REFERENCES public.users(id),
  to_user_id      UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  is_mutual       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, event_id)
);

ALTER TABLE public.waves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own waves" ON public.waves
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users send waves" ON public.waves
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ─────────────────────────────────────────────
-- MATCHES
-- ─────────────────────────────────────────────
CREATE TABLE public.matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id       UUID NOT NULL REFERENCES public.users(id),
  user_b_id       UUID NOT NULL REFERENCES public.users(id),
  event_id        UUID NOT NULL REFERENCES public.events(id),
  chat_enabled    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ─────────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id        UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.users(id),
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match participants see messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = match_id AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
    )
  );

CREATE POLICY "Match participants send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = match_id AND (user_a_id = auth.uid() OR user_b_id = auth.uid())
    )
  );

CREATE INDEX idx_messages_match ON public.chat_messages(match_id);

-- ─────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update tickets_sold on ticket creation
CREATE OR REPLACE FUNCTION public.increment_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.events 
  SET tickets_sold = tickets_sold + 1
  WHERE id = NEW.event_id;
  
  UPDATE public.ticket_tiers
  SET quantity_sold = quantity_sold + 1
  WHERE id = NEW.tier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.increment_tickets_sold();

-- Check for mutual waves and create match
CREATE OR REPLACE FUNCTION public.check_mutual_wave()
RETURNS TRIGGER AS $$
DECLARE
  reverse_wave UUID;
BEGIN
  -- Check if a reverse wave exists
  SELECT id INTO reverse_wave
  FROM public.waves
  WHERE from_user_id = NEW.to_user_id
    AND to_user_id = NEW.from_user_id
    AND event_id = NEW.event_id;

  IF reverse_wave IS NOT NULL THEN
    -- Mark both waves as mutual
    UPDATE public.waves SET is_mutual = TRUE
    WHERE id = NEW.id OR id = reverse_wave;
    
    -- Create a match
    INSERT INTO public.matches (user_a_id, user_b_id, event_id)
    VALUES (NEW.from_user_id, NEW.to_user_id, NEW.event_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_wave_created
  AFTER INSERT ON public.waves
  FOR EACH ROW EXECUTE FUNCTION public.check_mutual_wave();

-- Increment affiliate clicks
CREATE OR REPLACE FUNCTION public.track_affiliate_click(p_referral_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.affiliates
  SET clicks = clicks + 1
  WHERE referral_code = p_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
