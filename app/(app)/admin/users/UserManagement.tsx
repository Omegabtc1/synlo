'use client'

import { useState } from 'react'
import { Search, MoreVertical, Shield, User, Crown } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  is_verified: boolean
  created_at: string
}

interface Props {
  initialUsers: User[]
}

export default function UserManagement({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const updateUser = async (userId: string, updates: { role?: string; is_verified?: boolean }) => {
    setLoading(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, ...updates } : u
        ))
        toast.success('User updated')
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      toast.error('Error updating user')
    }
    setLoading(null)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'organizer': return <Crown className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-8">User Management</h1>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full max-w-md"
              />
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/40">
                      <td className="p-4">{user.full_name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`badge ${user.is_verified ? 'badge-green' : 'badge-red'}`}>
                          {user.is_verified ? 'Verified' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => updateUser(user.id, { role: e.target.value })}
                            disabled={loading === user.id}
                            className="input text-sm py-1 px-2"
                          >
                            <option value="attendee">Attendee</option>
                            <option value="organizer">Organizer</option>
                            <option value="verifier">Verifier</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => updateUser(user.id, { is_verified: !user.is_verified })}
                            disabled={loading === user.id}
                            className={`btn btn-sm ${user.is_verified ? 'btn-outline' : 'btn-primary'}`}
                          >
                            {user.is_verified ? 'Suspend' : 'Unsuspend'}
                          </button>
                        </div>
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