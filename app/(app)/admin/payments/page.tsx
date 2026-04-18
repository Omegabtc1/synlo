// app/(app)/admin/payments/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PaymentsPage() {
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

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      event:events (title),
      buyer:users (full_name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-8">Payment Overview</h1>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-4">Reference</th>
                    <th className="text-left p-4">Event</th>
                    <th className="text-left p-4">Buyer</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Fee</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="border-b border-zinc-800/40">
                      <td className="p-4 font-mono text-sm">{payment.reference}</td>
                      <td className="p-4">{payment.event?.title}</td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{payment.buyer?.full_name}</div>
                          <div className="text-sm text-zinc-500">{payment.buyer?.email}</div>
                        </div>
                      </td>
                      <td className="p-4">₦{(payment.total / 100).toLocaleString()}</td>
                      <td className="p-4">₦{(payment.platform_fee / 100).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          payment.status === 'success' ? 'badge-green' :
                          payment.status === 'pending' ? 'badge-yellow' :
                          'badge-red'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}