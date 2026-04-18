'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  affiliateId: string
  availableBalance: number
  onClose: () => void
}

export default function WithdrawalModal({ affiliateId, availableBalance, onClose }: Props) {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numAmount = parseFloat(amount) * 100 // Convert to kobo
    if (numAmount <= 0 || numAmount > availableBalance) {
      toast.error('Invalid amount')
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast.error('All fields are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/affiliates/${affiliateId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName
        })
      })

      if (res.ok) {
        toast.success('Withdrawal request submitted. Processing within 2-3 business days.')
        onClose()
      } else {
        toast.error('Failed to submit withdrawal request')
      }
    } catch (error) {
      toast.error('Error submitting request')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 btn btn-ghost btn-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-display text-xl font-bold mb-4">Withdraw Funds</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Available: ₦{(availableBalance / 100).toLocaleString()}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={availableBalance / 100}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Access Bank"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit account number"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder name"
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </form>
      </div>
    </div>
  )
}