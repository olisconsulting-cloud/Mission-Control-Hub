'use client'

import { useState, useEffect } from 'react'
import { AgentChat } from '@/components/agents/AgentChat'
import { CardSkeleton } from '@/components/ui/Skeleton'

interface Agent {
  id: string
  name: string
  provider: string
  model: string
  icon: string
  active: boolean
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selected, setSelected] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agents')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load agents')
        return res.json()
      })
      .then(data => {
        setAgents(data.docs || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="col-span-8">
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-surface-900 border border-red-500/30 p-8 text-center">
        <p className="text-3xl mb-4">⚠️</p>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          AI Agents
        </h1>
        <p className="text-muted mt-1">Connect and chat with AI agents.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Agent List */}
        <div className="col-span-4 space-y-3">
          {agents.length === 0 ? (
            <div className="rounded-xl bg-surface-900 border border-surface-800 p-12 text-center text-muted">
              <p className="text-4xl mb-4">🤖</p>
              <p className="text-sm">No agents yet.</p>
              <p className="text-xs mt-2">Create one via the Admin Panel → Agents</p>
            </div>
          ) : (
            agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelected(agent)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected?.id === agent.id
                    ? 'bg-surface-800 border-volt-500'
                    : 'bg-surface-900 border-surface-800 hover:border-surface-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{agent.name}</h3>
                    <p className="text-xs text-muted">{agent.provider} / {agent.model}</p>
                  </div>
                  <span
                    className={`ml-auto w-2 h-2 rounded-full ${
                      agent.active ? 'bg-volt-400' : 'bg-red-400'
                    }`}
                  />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat */}
        <div className="col-span-8">
          {selected ? (
            <AgentChat
              agentId={selected.id}
              agentName={selected.name}
              agentIcon={selected.icon}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] rounded-xl bg-surface-900 border border-surface-800 text-muted">
              <div className="text-center">
                <p className="text-4xl mb-4">💬</p>
                <p>Select an agent to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
