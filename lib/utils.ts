// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── MONEY ─────────────────────────────────────
/** Convert kobo to Naira string: 1000000 → "₦10,000" */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira)
}

/** Convert Naira to kobo: 10000 → 1000000 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

/** Convert kobo to naira number */
export function koboToNaira(kobo: number): number {
  return kobo / 100
}

/** Calculate platform fee (10%) */
export function calcPlatformFee(subtotalKobo: number): number {
  return Math.round(subtotalKobo * 0.1)
}

/** Calculate total buyer pays */
export function calcTotal(subtotalKobo: number): number {
  return subtotalKobo + calcPlatformFee(subtotalKobo)
}

// ── DATES ─────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'EEE, MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'EEE, MMM d · h:mm a')
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ── STRINGS ───────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── IDs & CODES ───────────────────────────────
/** Generate unique ticket code */
export function generateTicketCode(): string {
  return `SYNLO-${nanoid(10).toUpperCase()}`
}

/** Generate payment reference */
export function generatePaymentRef(): string {
  return `SYN-${Date.now()}-${nanoid(6).toUpperCase()}`
}

/** Generate affiliate referral code */
export function generateReferralCode(userId: string, eventId: string): string {
  const short = userId.slice(0, 4) + eventId.slice(0, 4)
  return `${short}-${nanoid(6)}`.toUpperCase()
}

// ── SHARE TEXT ────────────────────────────────
export function generateShareText(eventTitle: string, city: string, date: string, url: string): string {
  return `🎉 I'm going to ${eventTitle} in ${city}!\n📅 ${date}\n🎟️ Get your tickets: ${url}`
}

export function generateAffiliateShareText(
  eventTitle: string,
  city: string,
  price: number,
  referralUrl: string
): string {
  return `🔥 ${eventTitle} in ${city}!\nTickets from ${formatNaira(price)} 🎟️\n\nBook here 👇\n${referralUrl}`
}

// ── QR CODE ───────────────────────────────────
export function getQRData(ticketCode: string): string {
  // Encode ticket code with timestamp for security
  const payload = { code: ticketCode, ts: Date.now() }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// ── CATEGORIES ────────────────────────────────
export const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  tech:       { label: 'Tech',       emoji: '💻', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  music:      { label: 'Music',      emoji: '🎵', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  arts:       { label: 'Arts',       emoji: '🎨', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  food:       { label: 'Food',       emoji: '🍲', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  sports:     { label: 'Sports',     emoji: '⚽', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  business:   { label: 'Business',   emoji: '📈', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  education:  { label: 'Education',  emoji: '📚', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  fashion:    { label: 'Fashion',    emoji: '👗', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  comedy:     { label: 'Comedy',     emoji: '😂', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  campus:     { label: 'Campus',     emoji: '🎓', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  other:      { label: 'Other',      emoji: '✨', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
}

export const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Owerri',
  'Enugu', 'Benin City', 'Calabar', 'Warri', 'Asaba', 'Uyo',
  'Abeokuta', 'Ilorin', 'Jos', 'Kaduna', 'Maiduguri', 'Aba',
]

// ── VALIDATORS ────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^(\+234|0)[789][01]\d{8}$/.test(phone.replace(/\s/g, ''))
}
