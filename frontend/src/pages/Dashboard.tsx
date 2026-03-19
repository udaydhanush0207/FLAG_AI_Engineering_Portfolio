import { useQuery } from '@tanstack/react-query'
import { api, type Conversation } from '../lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  MessageSquare, Database, Users, Bot, ArrowRight, TrendingUp, type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  motion, useMotionValue, useTransform, animate,
  AnimatePresence,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import ParticlesCanvas from '../components/ParticlesCanvas'

// ── Page transition wrapper ──────────────────────────────────────────────────
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
}

// ── Stagger container ────────────────────────────────────────────────────────
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0 },
}

// ── CountUp hook ─────────────────────────────────────────────────────────────
function CountUp({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const val = useMotionValue(0)
  const rounded = useTransform(val, v => Math.round(v).toLocaleString())
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(val, to, { duration, ease: 'easeOut' })
    return controls.stop
  }, [to, duration, val])

  return <motion.span ref={displayRef}>{rounded}</motion.span>
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, numericValue, icon: Icon, accent = false,
}: {
  label: string
  value: string | number
  numericValue?: number
  icon: LucideIcon
  accent?: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{
        y: -3,
        boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 30px rgba(201,162,39,0.12)',
        borderColor: 'rgba(201,162,39,0.3)',
      }}
      className="rounded-lg border p-5 cursor-default"
      style={{
        background: '#0A1628',
        borderColor: accent ? 'rgba(201,162,39,0.3)' : '#162440',
        boxShadow: accent ? '0 0 30px rgba(201,162,39,0.08)' : 'none',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: accent ? '#C9A227' : '#F1F5F9',
            }}
          >
            {numericValue !== undefined ? <CountUp to={numericValue} /> : value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: accent ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${accent ? 'rgba(201,162,39,0.2)' : '#162440'}`,
          }}
        >
          <Icon size={18} style={{ color: accent ? '#C9A227' : '#475569' }} />
        </div>
      </div>
    </motion.div>
  )
}

// ── Agent status pill ────────────────────────────────────────────────────────
function AgentPill({ agent, index }: {
  agent: { id: string; name: string; status: string; total_queries: number }
  index: number
}) {
  const isOnline = agent.status === 'online'
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ x: 3, borderColor: 'rgba(201,162,39,0.25)' }}
      className="flex items-center gap-3 rounded-lg border p-4"
      style={{ background: '#0A1628', borderColor: '#162440' }}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOnline ? 'status-dot-online' : ''}`}
        style={{ background: isOnline ? '#10B981' : '#334155' }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-white truncate"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {agent.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
          {agent.total_queries} queries
        </p>
      </div>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
          color: isOnline ? '#34D399' : '#475569',
          border: `1px solid ${isOnline ? 'rgba(16,185,129,0.2)' : '#162440'}`,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {agent.status.toUpperCase()}
      </span>
    </motion.div>
  )
}

// ── Conversation row (slides in from right) ──────────────────────────────────
function ConvRow({ conv, index }: { conv: Conversation; index: number }) {
  const channelColors: Record<string, string> = {
    web: '#3B82F6', whatsapp: '#25D366', telegram: '#2AABEE',
  }
  const color = channelColors[conv.channel] ?? '#475569'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
      className="flex items-start gap-3 py-3 border-b"
      style={{ borderColor: '#0F1F36' }}
    >
      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{conv.question || '—'}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#475569' }}>
          {conv.answer_preview}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className="text-xs" style={{ color: '#C9A227', fontFamily: 'JetBrains Mono, monospace' }}>
          {conv.response_time_ms}ms
        </span>
        <p className="text-xs mt-0.5" style={{ color: '#2D3F5C' }}>{conv.channel}</p>
      </div>
    </motion.div>
  )
}

// ── Progress bar (fills on load) ─────────────────────────────────────────────
function ProgressBar({ label, value, max, color = '#C9A227' }: {
  label: string; value: number; max: number; color?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#162440' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

// ── Chart data builder ───────────────────────────────────────────────────────
function buildChartData(conversations: Conversation[]) {
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = new Date()
    h.setHours(h.getHours() - (11 - i), 0, 0, 0)
    return { hour: h.getHours(), label: `${h.getHours()}:00`, queries: 0 }
  })
  for (const c of conversations) {
    const h = new Date(c.created_at).getHours()
    const slot = hours.find(s => s.hour === h)
    if (slot) slot.queries++
  }
  return hours
}

// ── Hero banner ──────────────────────────────────────────────────────────────
function HeroBanner({ totalConvs, chunksLoaded }: { totalConvs: number; chunksLoaded: number }) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-xl p-6"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0D1F38 50%, #0A1628 100%)',
        border: '1px solid rgba(201,162,39,0.2)',
      }}
    >
      <ParticlesCanvas count={35} />

      {/* Gradient overlay on sides */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 80% 50%, rgba(201,162,39,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div
            className="text-xs font-mono uppercase tracking-widest mb-2"
            style={{ color: 'rgba(201,162,39,0.7)' }}
          >
            Front Line Advisory Group
          </div>
          <h1
            className="text-2xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            BRICK v2 Intelligence
          </h1>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            AI-powered CIP bond program management — live
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#C9A227' }}>
              <CountUp to={totalConvs} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              queries handled
            </div>
          </div>
          <div className="w-px h-10" style={{ background: '#162440' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F1F5F9' }}>
              <CountUp to={chunksLoaded} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              knowledge chunks
            </div>
          </div>
          <div className="w-px h-10" style={{ background: '#162440' }} />
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#10B981' }}>
              $3.5B
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              programs managed
            </div>
          </div>
        </div>
      </div>

      {/* Construction progress bar */}
      <div className="relative z-10 mt-5">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-mono" style={{ color: 'rgba(201,162,39,0.7)' }}>Platform readiness</span>
          <span className="text-xs font-mono" style={{ color: '#C9A227' }}>71%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(22,36,64,0.8)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7A6018, #C9A227, #F5D87A)' }}
            initial={{ width: 0 }}
            animate={{ width: '71%' }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] font-mono" style={{ color: '#2D3F5C' }}>Phase 1-5 complete</span>
          <span className="text-[9px] font-mono" style={{ color: '#2D3F5C' }}>Phase 6-7 remaining</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.stats,
    refetchInterval: 20_000,
  })
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: api.agents,
    refetchInterval: 15_000,
  })
  const { data: convsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.conversations(50),
    refetchInterval: 20_000,
  })

  const conversations = convsData?.conversations ?? []
  const agents = agentsData?.agents ?? []
  const chartData = buildChartData(conversations)

  const totalConvs = statsLoading ? 0 : (stats?.total_conversations ?? 0)
  const chunks     = statsLoading ? 0 : (stats?.knowledge_chunks ?? 0)
  const totalLeads = statsLoading ? 0 : (stats?.total_leads ?? 0)
  const agentsOnline = statsLoading ? 0 : (stats?.agents_online ?? 0)
  const agentsTotal  = statsLoading ? 0 : (stats?.agents_total ?? 3)

  return (
    <motion.div
      className="p-6 space-y-5 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Hero */}
      <HeroBanner totalConvs={totalConvs} chunksLoaded={chunks} />

      {/* Stat cards (staggered) */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard
          label="Total Conversations"
          value={totalConvs}
          numericValue={totalConvs}
          icon={MessageSquare}
          accent
        />
        <StatCard
          label="Knowledge Chunks"
          value={chunks.toLocaleString()}
          numericValue={chunks}
          icon={Database}
        />
        <StatCard
          label="Leads"
          value={totalLeads}
          numericValue={totalLeads}
          icon={Users}
        />
        <StatCard
          label="Agents Online"
          value={`${agentsOnline} / ${agentsTotal}`}
          numericValue={agentsOnline}
          icon={Bot}
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Chart */}
        <motion.div
          className="lg:col-span-2 rounded-lg border p-5"
          style={{ background: '#0A1628', borderColor: '#162440' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ borderColor: 'rgba(201,162,39,0.2)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Query Volume (Last 12h)
            </h3>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} style={{ color: '#C9A227' }} />
              <span className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                {conversations.length} total
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A227" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162440" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#475569', fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fontSize: 10, fill: '#475569', fontFamily: 'JetBrains Mono' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0A1628', border: '1px solid #162440', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#C9A227', fontFamily: 'JetBrains Mono' }}
                itemStyle={{ color: '#CBD5E1' }}
              />
              <Area type="monotone" dataKey="queries" stroke="#C9A227" strokeWidth={2} fill="url(#goldGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agents + progress */}
        <motion.div
          className="rounded-lg border p-5 flex flex-col gap-4"
          style={{ background: '#0A1628', borderColor: '#162440' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Agent Status
            </h3>
            <Link to="/agents" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: '#C9A227' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <motion.div className="space-y-2" variants={staggerContainer} initial="initial" animate="animate">
            {agents.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: '#162440' }} />
                ))
              : agents.map((a, i) => <AgentPill key={a.id} agent={a} index={i} />)
            }
          </motion.div>

          {/* Mini progress bars */}
          <div className="space-y-3 pt-2 border-t" style={{ borderColor: '#162440' }}>
            <ProgressBar label="Knowledge coverage" value={chunks} max={1000} />
            <ProgressBar label="Active channels" value={3} max={5} color="#3B82F6" />
            <ProgressBar label="Lead pipeline" value={totalLeads} max={50} color="#10B981" />
          </div>
        </motion.div>
      </div>

      {/* Recent conversations */}
      <motion.div
        className="rounded-lg border"
        style={{ background: '#0A1628', borderColor: '#162440' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#162440' }}>
          <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Recent Conversations
          </h3>
          <Link to="/chat" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color: '#C9A227' }}>
            Open Chat <ArrowRight size={12} />
          </Link>
        </div>

        <AnimatePresence>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={32} className="mb-3" style={{ color: '#162440' }} />
              <p className="text-sm" style={{ color: '#475569' }}>No conversations yet</p>
              <p className="text-xs mt-1" style={{ color: '#2D3F5C' }}>Start chatting with BRICK to see activity</p>
              <Link
                to="/chat"
                className="mt-4 px-4 py-2 rounded text-xs font-medium transition-all hover:opacity-90"
                style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.25)' }}
              >
                Open BRICK Chat →
              </Link>
            </div>
          ) : (
            <div className="px-5 pb-1">
              {conversations.slice(0, 8).map((c, i) => (
                <ConvRow key={c.id} conv={c} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
