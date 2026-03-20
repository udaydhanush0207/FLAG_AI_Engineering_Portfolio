const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface Agent {
  id: string
  name: string
  status: 'online' | 'offline' | 'processing' | 'error'
  last_activity: string | null
  total_queries: number
  error_count: number
  metadata: Record<string, unknown>
  updated_at: string
}

export interface Stats {
  total_conversations: number
  knowledge_chunks: number
  total_leads: number
  agents_online: number
  agents_total: number
}

export interface Conversation {
  id: string
  channel: string
  query_type: string
  model_used: string
  response_time_ms: number
  created_at: string
  question: string
  answer_preview: string
}

export interface ChatResponse {
  answer: string
  source: string
  query_type: string
  model_used: string
  response_time_ms: number
  channel: string
}

export interface Lead {
  id: string
  name: string
  title?: string
  email?: string
  county: string
  state: string
  category?: string
  score: number
  status: string
  research_notes?: string
  created_at: string
}

export interface Health {
  status: string
  version: string
  timestamp: string
  supabase: string
}

// ── Named exports for direct use ───────────────────────────────────────────
export const fetchHealth = () => request<Health>('/api/health')

// ── API calls ──────────────────────────────────────────────────────────────
export const api = {
  health: fetchHealth,
  agents: ()                       => request<{ agents: Agent[] }>('/api/agents'),
  stats: ()                        => request<Stats>('/api/stats'),
  conversations: (limit = 20)      => request<{ conversations: Conversation[]; total: number }>(`/api/conversations?limit=${limit}`),
  leads: ()                        => request<{ leads: Lead[]; total: number }>('/api/leads'),
  leadsFromSheets: ()              => request<{ leads: Lead[]; total: number; source: string }>('/api/leads/sheets'),

  chat: (question: string, history: Array<{ role: string; content: string }>, channel = 'web') =>
    request<ChatResponse>('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question, history, channel }),
    }),
}
