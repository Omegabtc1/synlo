// app/(app)/admin/page.tsx
import Link from 'next/link'
import { Users, Calendar, DollarSign, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get stats
  const { data: users } = await supabase
    .from('users')
    .select('id', { count: 'exact' })

  const { data: events } = await supabase
    .from('events')
    .select('id', { count: 'exact' })

  const { data: payments } = await supabase
    .from('payments')
    .select('total', { count: 'exact' })

  const { data: tickets } = await supabase
    .from('tickets')
    .select('id', { count: 'exact' })

  const totalRevenue = payments?.reduce((sum, p) => sum + p.total, 0) || 0

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-8">Admin Panel</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card">
              <Users className="w-8 h-8 text-accent mb-2" />
              <div className="stat-value">{users?.length || 0}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat-card">
              <Calendar className="w-8 h-8 text-accent mb-2" />
              <div className="stat-value">{events?.length || 0}</div>
              <div className="stat-label">Events</div>
            </div>
            <div className="stat-card">
              <DollarSign className="w-8 h-8 text-accent mb-2" />
              <div className="stat-value">₦{(totalRevenue / 100).toLocaleString()}</div>
              <div className="stat-label">Revenue</div>
            </div>
            <div className="stat-card">
              <Ticket className="w-8 h-8 text-accent mb-2" />
              <div className="stat-value">{tickets?.length || 0}</div>
              <div className="stat-label">Tickets</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users" className="btn btn-outline">
                Manage Users
              </Link>
              <Link href="/admin/events" className="btn btn-outline">
                Manage Events
              </Link>
              <Link href="/admin/payments" className="btn btn-outline">
                View Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}