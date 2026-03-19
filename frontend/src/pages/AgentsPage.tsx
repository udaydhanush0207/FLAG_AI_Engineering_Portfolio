import { useQuery } from '@tanstack/react-query'
import { api, type Agent } from '../lib/api'
import { MessageSquare, AlertCircle, Clock, Activity, RefreshCw, Cpu, Database, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

// ── Page transition ───────────────────────────────────────────────────────────
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const AGENT_DESCRIPTIONS: Record<string, { desc: string; icon: LucideIcon; capabilities: string[] }> = {
  brick: {
    desc: 'RAG-powered chatbot answering FLAG knowledge questions via pgvector search + Gemini 2.5 Flash.',
    icon: MessageSquare,
    capabilities: ['FLAG knowledge base Q&A', 'Multi-channel (Web, WhatsApp, Telegram)', 'Source citation', 'Conversation history'],
  },
  lead_gen: {
    desc: 'Researches Texas county officials for CIP/MGO outreach using Perplexity web search + Gemini scoring.',
    icon: Activity,
    capabilities: ['County official research', 'CIP/MGO classification', 'Relevance scoring 1-10', 'CSV export'],
  },
  cip_intel: {
    desc: 'Monitors CIP bond industry news and trends using Perplexity sonar-pro real-time search.',
    icon: Database,
    capabilities: ['Real-time industry news', 'Texas bond market trends', 'Federal legislation tracking', 'Competitive intelligence'],
  },
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string; pulse: string }> = {
    online:     { dot: '#10B981', text: '#34D399', bg: 'rgba(16,185,129,0.1)',  pulse: 'status-dot-online' },
    offline:    { dot: '#334155', text: '#475569', bg: 'rgba(255,255,255,0.04)', pulse: '' },
    processing: { dot: '#FBBF24', text: '#FBBF24', bg: 'rgba(251,191,36,0.1)', pulse: '' },
    error:      { dot: '#F87171', text: '#F87171', bg: 'rgba(248,113,113,0.1)', pulse: '' },
  }
  const s = map[status] ?? map.offline
  return (
    <span
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}33`, fontFamily: 'JetBrains Mono, monospace' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.pulse}`} style={{ background: s.dot }} />
      {status.toUpperCase()}
    </span>
  )
}

// ── Metric row ────────────────────────────────────────────────────────────────
function Metric({ label, value, icon: Icon, accent = false }: {
  label: string; value: string | number; icon: LucideIcon; accent?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg border"
      style={{ background: '#060D1B', borderColor: '#0F1F36' }}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={14} style={{ color: accent ? '#C9A227' : '#475569' }} />
        <span className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: accent ? '#C9A227' : '#CBD5E1', fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </span>
    </div>
  )
}

// ── Agent card ────────────────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: Agent }) {
  const meta: { desc: string; icon: LucideIcon; capabilities: string[] } = AGENT_DESCRIPTIONS[agent.id] ?? { desc: 'AI agent for FLAG Intelligence Platform.', icon: Cpu, capabilities: [] }
  const Icon = meta.icon
  const isOnline = agent.status === 'online'

  const fmt = (ts: string | null) => {
    if (!ts) return 'Never'
    const d = new Date(ts)
    const diff = Date.now() - d.getTime()
    if (diff < 60_000)     return 'Just now'
    if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -4,
        borderColor: isOnline ? 'rgba(201,162,39,0.35)' : 'rgba(201,162,39,0.15)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,162,39,0.08)',
      }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border overflow-hidden"
      style={{
        background: '#0A1628',
        borderColor: isOnline ? 'rgba(201,162,39,0.2)' : '#162440',
        boxShadow: isOnline ? '0 0 30px rgba(201,162,39,0.05)' : 'none',
      }}
    >
      {/* Active indicator bar */}
      {isOnline && (
        <motion.div
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A227, transparent)' }}
          animate={{ backgroundPosition: ['200% center', '-200% center'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: '#162440' }}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isOnline ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isOnline ? 'rgba(201,162,39,0.2)' : '#162440'}`,
            }}
            animate={isOnline ? { boxShadow: ['0 0 0px rgba(201,162,39,0)', '0 0 15px rgba(201,162,39,0.2)', '0 0 0px rgba(201,162,39,0)'] } : undefined}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={20} style={{ color: isOnline ? '#C9A227' : '#475569' }} />
          </motion.div>
          <div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{agent.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#2D3F5C', fontFamily: 'JetBrains Mono, monospace' }}>ID: {agent.id}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Description */}
      <div className="px-5 py-4 border-b" style={{ borderColor: '#0F1F36' }}>
        <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{meta.desc}</p>
      </div>

      {/* Metrics */}
      <div className="p-5 space-y-2">
        <Metric label="Total Queries" value={agent.total_queries.toLocaleString()} icon={MessageSquare} accent={agent.total_queries > 0} />
        <Metric label="Error Count"   value={agent.error_count}                    icon={AlertCircle} />
        <Metric label="Last Activity" value={fmt(agent.last_activity)}             icon={Clock} />
      </div>

      {/* Capabilities */}
      <div className="px-5 pb-5">
        <p className="text-xs uppercase tracking-widest mb-2.5" style={{ color: '#2D3F5C', fontFamily: 'JetBrains Mono, monospace' }}>
          Capabilities
        </p>
        <div className="flex flex-wrap gap-1.5">
          {meta.capabilities.map((cap, i) => (
            <motion.span
              key={cap}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="text-xs px-2 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.03)', color: '#475569', border: '1px solid #162440' }}
            >
              {cap}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AgentsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['agents'],
    queryFn: api.agents,
    refetchInterval: 15_000,
  })
  const agents = data?.agents ?? []

  return (
    <motion.div
      className="p-6 space-y-5 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Agent Fleet
          </h2>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {agents.filter(a => a.status === 'online').length} of {agents.length} agents online
          </p>
        </div>
        <motion.button
          onClick={() => refetch()}
          disabled={isFetching}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg disabled:opacity-50"
          style={{ color: '#475569', border: '1px solid #162440', background: '#0A1628' }}
        >
          <motion.span animate={isFetching ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: isFetching ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={13} />
          </motion.span>
          Refresh
        </motion.button>
      </motion.div>

      {/* Cards (staggered) */}
      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-5">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-xl border h-80 animate-pulse" style={{ background: '#0A1628', borderColor: '#162440' }} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </motion.div>
      )}

      {/* System configuration */}
      <motion.div
        className="rounded-lg border p-5"
        style={{ background: '#0A1628', borderColor: '#162440' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
          System Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Primary LLM',    value: 'Gemini 2.5 Flash' },
            { label: 'Embeddings',     value: 'text-embedding-3-small' },
            { label: 'Vector DB',      value: 'Supabase pgvector' },
            { label: 'Chunk Size',     value: '1200 / 200 overlap' },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              className="rounded-lg p-3"
              style={{ background: '#060D1B', border: '1px solid #0F1F36' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.3 }}
              whileHover={{ borderColor: 'rgba(201,162,39,0.2)' }}
            >
              <p className="text-xs uppercase tracking-widest" style={{ color: '#2D3F5C', fontFamily: 'JetBrains Mono, monospace' }}>{label}</p>
              <p className="text-sm font-medium mt-1 text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
