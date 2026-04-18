'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  created_at: string
  sender: {
    id: string
    full_name: string
  }
}

interface Props {
  matchId: string
  otherUser: {
    id: string
    full_name: string
  }
  eventTitle: string
  initialMessages: Message[]
  currentUserId: string
}

export default function ChatPageClient({
  matchId,
  otherUser,
  eventTitle,
  initialMessages,
  currentUserId
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, content: newMessage.trim() })
      })

      if (res.ok) {
        setNewMessage('')
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      toast.error('Error sending message')
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 p-4">
        <div className="page-container flex items-center gap-4">
          <Link href="/matches" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-semibold">{otherUser.full_name}</h1>
            <p className="text-sm text-zinc-500">{eventTitle}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender.id === currentUserId
                  ? 'bg-accent text-zinc-950'
                  : 'bg-zinc-800 text-zinc-100'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800/40 p-4">
        <div className="page-container flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="input flex-1"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary"
            disabled={!newMessage.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}