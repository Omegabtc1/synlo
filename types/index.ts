// ─────────────────────────────────────────────
// SYNLO PLATFORM — CORE TYPES
// ─────────────────────────────────────────────

export type UserRole = 'attendee' | 'organizer' | 'verifier' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  phone?: string
  bio?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type EventCategory =
  | 'tech'
  | 'music'
  | 'arts'
  | 'food'
  | 'sports'
  | 'business'
  | 'education'
  | 'fashion'
  | 'comedy'
  | 'campus'
  | 'other'

export interface Event {
  id: string
  organizer_id: string
  title: string
  slug: string
  description: string
  category: EventCategory
  tags: string[]
  cover_image?: string
  venue_name: string
  venue_address: string
  city: string
  state: string
  country: string
  starts_at: string
  ends_at: string
  timezone: string
  status: EventStatus
  is_private: boolean
  capacity: number
  tickets_sold: number
  views: number
  created_at: string
  updated_at: string
  // Joined
  organizer?: User
  ticket_tiers?: TicketTier[]
}

export type TicketTierType = 'general' | 'vip' | 'vvip' | 'early_bird' | 'custom'

export interface TicketTier {
  id: string
  event_id: string
  name: string
  type: TicketTierType
  description?: string
  price: number // in kobo (multiply by 100 for Flutterwave)
  quantity: number
  quantity_sold: number
  max_per_order: number
  sale_starts_at?: string
  sale_ends_at?: string
  is_active: boolean
  created_at: string
}

export type TicketStatus = 'active' | 'used' | 'cancelled' | 'refunded'

export interface Ticket {
  id: string
  ticket_code: string // unique QR code value
  event_id: string
  tier_id: string
  user_id: string
  payment_id: string
  status: TicketStatus
  holder_name: string
  holder_email: string
  checked_in_at?: string
  checked_in_by?: string // verifier user_id
  affiliate_id?: string
  created_at: string
  // Joined
  event?: Event
  tier?: TicketTier
  user?: User
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface Payment {
  id: string
  reference: string // Flutterwave tx ref
  flutterwave_id?: string
  user_id: string
  event_id: string
  tickets: { tier_id: string; quantity: number; unit_price: number }[]
  subtotal: number // organizer gets this
  platform_fee: number // 10%
  total: number // buyer pays this
  currency: 'NGN'
  status: PaymentStatus
  metadata?: Record<string, unknown>
  affiliate_id?: string
  created_at: string
  updated_at: string
}

export interface Affiliate {
  id: string
  user_id: string
  event_id: string
  referral_code: string
  clicks: number
  conversions: number
  total_earned: number // kobo
  total_withdrawn: number
  is_active: boolean
  commission_rate: number // e.g. 0.05 = 5%
  created_at: string
  // Joined
  user?: User
  event?: Event
}

export interface AffiliateWithdrawal {
  id: string
  affiliate_id: string
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface Verifier {
  id: string
  event_id: string
  user_id: string
  assigned_by: string
  is_active: boolean
  created_at: string
  user?: User
}

export interface ScanLog {
  id: string
  ticket_id: string
  verifier_id: string
  event_id: string
  result: 'valid' | 'invalid' | 'already_used' | 'wrong_event'
  device_info?: string
  scanned_at: string
  verifier?: User
  ticket?: Ticket
}

// Plus One / Social System
export type PlusOneStatus = 'looking_for' | 'available_as' | 'matched' | 'inactive'

export interface PlusOneRequest {
  id: string
  user_id: string
  event_id: string
  status: PlusOneStatus
  bio_note?: string
  age_range?: string
  created_at: string
  user?: User
  event?: Event
}

export interface Wave {
  id: string
  from_user_id: string
  to_user_id: string
  event_id: string
  is_mutual: boolean
  created_at: string
}

export interface Match {
  id: string
  user_a_id: string
  user_b_id: string
  event_id: string
  chat_enabled: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  match_id: string
  sender_id: string
  content: string
  read_at?: string
  created_at: string
  sender?: User
}

// Dashboard / Analytics
export interface OrganizerStats {
  total_revenue: number
  total_tickets_sold: number
  total_events: number
  total_attendees: number
  revenue_by_day: { date: string; revenue: number }[]
  tickets_by_tier: { tier_name: string; count: number; revenue: number }[]
  top_events: { event_id: string; title: string; revenue: number; tickets: number }[]
}

export interface AffiliateStats {
  total_clicks: number
  total_conversions: number
  conversion_rate: number
  total_earned: number
  total_withdrawn: number
  available_balance: number
  by_event: { event_id: string; title: string; clicks: number; conversions: number; earned: number }[]
}

// API Response wrappers
export interface ApiSuccess<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

// Flutterwave
export interface FlutterwaveConfig {
  public_key: string
  tx_ref: string
  amount: number
  currency: 'NGN'
  customer: {
    email: string
    name: string
    phone_number?: string
  }
  customizations: {
    title: string
    description: string
    logo?: string
  }
  meta?: Record<string, unknown>
}

export interface FlutterwaveCallback {
  status: 'successful' | 'failed' | 'cancelled'
  transaction_id: number
  tx_ref: string
  flw_ref: string
  amount: number
  currency: string
  customer: {
    email: string
    name: string
  }
}
