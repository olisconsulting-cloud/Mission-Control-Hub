'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AgentChatProps {
  agentId: string
  agentName: string
  agentIcon?: string
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok || res.status < 500) return res
    } catch (err) {
      if (i === retries - 1) throw err
    }
    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
  }
  throw new Error('Max retries reached')
}

export function AgentChat({ agentId, agentName, agentIcon = '🤖' }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetchWithRetry(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.text }])
      } else {
        setError(data.error || 'Failed to get response')
        setMessages([
          ...newMessages,
          { role: 'assistant', content: `Error: ${data.error}` },
        ])
      }
    } catch (err) {
      setError('Failed to connect to agent')
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Failed to connect to agent.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        setInput(lastUserMessage.content)
        setMessages(messages.slice(0, messages.lastIndexOf(lastUserMessage)))
      }
    }
  }

  return (
    <div className="flex flex-col h-[600px] rounded-xl bg-surface-900 border border-surface-800">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800">
        <span className="text-xl">{agentIcon}</span>
        <div>
          <h3 className="font-semibold text-sm">{agentName}</h3>
          <span className="text-xs text-muted">
            {loading ? 'Thinking...' : 'Online'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="text-center text-muted py-8">
            <p className="text-3xl mb-2">{agentIcon}</p>
            <p className="text-sm">Start a conversation with {agentName}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-volt-500 text-void'
                  : 'bg-surface-800 text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-800 px-4 py-2 rounded-lg text-sm">
              <span className="animate-pulse">●●●</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              ↻ Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-surface-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-void border border-surface-700 rounded-lg focus:border-volt-500 focus:outline-none text-sm"
            disabled={loading}
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors disabled:opacity-50 text-sm"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
