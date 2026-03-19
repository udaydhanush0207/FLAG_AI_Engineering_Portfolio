import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Conversation } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated, config } from '@react-spring/web'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  MessageSquare,
  Database,
  Users,
  Bot,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import ConstructionScene from '../components/ConstructionScene'
import ParticlesCanvas from '../components/ParticlesCanvas'

// ── Chart data ────────────────────────────────────────────────────────────────

function buildChartData(conversations: Conversation[]): { hour: string; queries: number }[] {
  const now = Date.now()
  const slots: { ts: number; label: string; queries: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const slotStart = now - i * 60 * 60 * 1000
    const d = new Date(slotStart)
    const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    slots.push({ ts: slotStart, label, queries: 0 })
  }

  for (const c of conversations) {
    const ts = new Date(c.created_at).getTime()
    const diffH = (now - ts) / (1000 * 60 * 60)
    if (diffH > 12) continue
    const idx = 11 - Math.floor(diffH)
    const slot = slots[Math.max(0, Math.min(11, idx))]
    if (slot) slot.queries++
  }

  return slots.map(({ label, queries }) => ({ hour: label, queries }))
}

// ── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  accent?: boolean
  index: number
}

function StatCard({ label, value, prefix, suffix, icon: Icon, accent = false, index }: StatCardProps) {
  const spring = useSpring({
    from: { n: 0 },
    to: { n: value },
    config: config.molasses,
    delay: 200 + index * 100,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' as const }}
      whileHover={{
        y: -6,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,162,39,0.1)',
        borderColor: 'rgba(201,162,39,0.3)',
      }}
      className="relative overflow-hidden rounded-xl p-5 cursor-default"
      style={{
        background: '#0A1628',
        border: `1px solid ${accent ? 'rgba(201,162,39,0.25)' : '#162440'}`,
      }}
    >
      {/* Shimmer on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0"
        whileHover={{ opacity: 1 }}
        style={{
          background:
            'linear-gradient(135deg, rgba(201,162,39,0.05) 0%, transparent 55%, rgba(201,162,39,0.03) 100%)',
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: '#4A6080', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {label}
          </span>

          <div className="flex items-baseline gap-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {prefix && (
              <span className="text-sm" style={{ color: '#C9A227' }}>
                {prefix}
              </span>
            )}
            <animated.span
              className="text-3xl font-bold"
              style={{ color: accent ? '#C9A227' : '#F1F5F9' }}
            >
              {spring.n.to((n) => Math.round(n).toLocaleString())}
            </animated.span>
            {suffix && (
              <span className="text-sm ml-0.5" style={{ color: '#4A6080' }}>
                {suffix}
              </span>
            )}
          </div>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: accent ? 'rgba(201,162,39,0.12)' : 'rgba(6,32,82,0.6)',
            border: `1px solid ${accent ? 'rgba(201,162,39,0.25)' : '#1E3050'}`,
          }}
        >
          <Icon size={18} color={accent ? '#C9A227' : '#4A7AB5'} />
        </div>
      </div>
    </motion.div>
  )
}

// ── AgentPill ─────────────────────────────────────────────────────────────────

interface AgentPillProps {
  name: string
  status: string
  totalQueries: number
  index: number
}

function AgentPill({ name, status, totalQueries, index }: AgentPillProps) {
  const dotColor =
    status === 'online' ? '#22C55E' : status === 'processing' ? '#C9A227' : '#6B7280'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' as const }}
      className="flex items-center justify-between rounded-lg px-4 py-3"
      style={{ background: '#060D1B', border: '1px solid #162440' }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: dotColor }}
          animate={
            status === 'online'
              ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
              : undefined
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <span
          className="text-sm font-medium truncate"
          style={{ color: '#F1F5F9', fontFamily: 'DM Sans, sans-serif' }}
        >
          {name}
        </span>
      </div>
      <span
        className="text-xs shrink-0 ml-2"
        style={{ color: '#4A6080', fontFamily: 'JetBrains Mono, monospace' }}
      >
        {totalQueries.toLocaleString()} q
      </span>
    </motion.div>
  )
}

// ── ConvRow ───────────────────────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  web: '#4A7AB5',
  whatsapp: '#22C55E',
  telegram: '#38BDF8',
  voice: '#A78BFA',
}

interface ConvRowProps {
  conv: Conversation
  index: number
  isLast: boolean
}

function ConvRow({ conv, index, isLast }: ConvRowProps) {
  const channelColor = CHANNEL_COLORS[conv.channel] ?? '#6B7280'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' as const }}
      className="flex gap-3"
    >
      {/* Timeline track */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{
            background: channelColor,
            boxShadow: `0 0 6px ${channelColor}55`,
          }}
        />
        {!isLast && (
          <div
            className="mt-1 w-px flex-1"
            style={{ background: 'rgba(201,162,39,0.15)', minHeight: '28px' }}
          />
        )}
      </div>

      {/* Content card */}
      <div
        className="mb-4 flex-1 rounded-lg px-4 py-3 min-w-0"
        style={{ background: '#0A1628', border: '1px solid #162440' }}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: channelColor, fontFamily: 'DM Sans, sans-serif' }}
          >
            {conv.channel}
          </span>
          <span
            className="text-[10px] shrink-0"
            style={{ color: '#4A6080', fontFamily: 'JetBrains Mono, monospace' }}
          >
            {new Date(conv.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <p
          className="text-sm leading-relaxed truncate"
          style={{ color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif' }}
        >
          {conv.answer_preview ?? conv.question ?? '—'}
        </p>

        <div className="mt-1.5 flex flex-wrap gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              background: 'rgba(6,32,82,0.6)',
              color: '#4A7AB5',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {conv.model_used ?? 'unknown'}
          </span>
          {conv.response_time_ms != null && (
            <span
              className="rounded px-1.5 py-0.5 text-[10px]"
              style={{
                background: 'rgba(201,162,39,0.08)',
                color: '#C9A227',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {conv.response_time_ms}ms
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Custom recharts tooltip ───────────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        background: '#0A1628',
        border: '1px solid rgba(201,162,39,0.3)',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      <p className="text-[10px]" style={{ color: '#4A6080' }}>
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color: '#C9A227' }}>
        {payload[0]?.value ?? 0} queries
      </p>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: api.stats,
    refetchInterval: 20_000,
  })

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: api.agents,
    refetchInterval: 20_000,
  })

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', 50],
    queryFn: () => api.conversations(50),
    refetchInterval: 20_000,
  })

  const stats = statsData ?? {
    total_conversations: 0,
    knowledge_chunks: 885,
    total_leads: 0,
    agents_online: 0,
    agents_total: 0,
  }

  const agents = agentsData?.agents ?? []
  const conversations = conversationsData?.conversations ?? []
  const chartData = buildChartData(conversations)
  const recentConvs = conversations.slice(0, 8)

  // Suppress unused import lint — useRef/useEffect included per spec
  const _ref = useRef<null>(null)
  useEffect(() => { _ref.current = null }, [])

  return (
    <div
      className="min-h-screen space-y-6 p-6"
      style={{ background: '#060D1B', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Section 1 — 3D Hero                                                   */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div
        className="relative h-72 w-full overflow-hidden rounded-xl"
        style={{ border: '1px solid rgba(201,162,39,0.2)' }}
      >
        {/* Particles layer */}
        <div className="absolute inset-0 z-0">
          <ParticlesCanvas count={60} />
        </div>

        {/* ConstructionScene fills full area */}
        <div className="absolute inset-0 z-10">
          <ConstructionScene className="h-full w-full" />
        </div>

        {/* Bottom gradient: transparent → #060D1B */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-32"
          style={{ background: 'linear-gradient(to top, #060D1B, transparent)' }}
        />

        {/* Top-left badge */}
        <div
          className="absolute left-4 top-4 z-30 rounded px-3 py-1.5"
          style={{
            background: 'rgba(6,13,27,0.88)',
            border: '1px solid rgba(201,162,39,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: '#C9A227', fontFamily: 'JetBrains Mono, monospace' }}
          >
            Construction Command Center
          </span>
        </div>

        {/* Bottom inline stats */}
        <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center gap-8">
          {[
            { label: '$6.3B', sub: 'managed' },
            { label: '127', sub: 'projects' },
            { label: stats.knowledge_chunks.toLocaleString(), sub: 'knowledge chunks' },
          ].map((item) => (
            <div key={item.sub} className="flex flex-col leading-none">
              <span
                className="text-lg font-bold"
                style={{ color: '#C9A227', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {item.label}
              </span>
              <span
                className="mt-0.5 text-[10px]"
                style={{ color: 'rgba(201,162,39,0.55)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Section 2 — Stat Cards (4 cols)                                       */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Conversations"
          value={stats.total_conversations}
          icon={MessageSquare}
          index={0}
        />
        <StatCard
          label="Knowledge Chunks"
          value={stats.knowledge_chunks}
          icon={Database}
          accent
          index={1}
        />
        <StatCard
          label="Total Leads"
          value={stats.total_leads}
          icon={Users}
          index={2}
        />
        <StatCard
          label="Agents Online"
          value={stats.agents_online}
          suffix={`/${stats.agents_total}`}
          icon={Bot}
          accent
          index={3}
        />
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Section 3 — Chart (lg:col-span-2) + Agents (col-span-1)               */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl p-5 lg:col-span-2"
          style={{ background: '#0A1628', border: '1px solid #162440' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={15} color="#C9A227" />
            <h2
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#F1F5F9', fontFamily: 'Syne, sans-serif' }}
            >
              Query Volume — Last 12h
            </h2>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A227" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#4A6080', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#4A6080', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="queries"
                stroke="#C9A227"
                strokeWidth={2}
                fill="url(#goldAreaGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#C9A227', stroke: '#060D1B', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agents list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl p-5"
          style={{ background: '#0A1628', border: '1px solid #162440' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={15} color="#C9A227" />
              <h2
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#F1F5F9', fontFamily: 'Syne, sans-serif' }}
              >
                Agents
              </h2>
            </div>
            <Link
              to="/agents"
              className="flex items-center gap-1 text-[10px] hover:opacity-70 transition-opacity"
              style={{ color: '#C9A227' }}
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {agents.length > 0 ? (
                agents.map((agent, i) => (
                  <AgentPill
                    key={agent.id}
                    name={agent.name}
                    status={agent.status}
                    totalQueries={agent.total_queries}
                    index={i}
                  />
                ))
              ) : (
                <p
                  className="py-6 text-center text-xs"
                  style={{ color: '#4A6080', fontFamily: 'DM Sans, sans-serif' }}
                >
                  No agents configured
                </p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* Section 4 — Recent Activity Feed                                      */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-xl p-5"
        style={{ background: '#0A1628', border: '1px solid #162440' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} color="#C9A227" />
            <h2
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#F1F5F9', fontFamily: 'Syne, sans-serif' }}
            >
              Recent Activity
            </h2>
          </div>
          <Link
            to="/chat"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
            style={{
              color: '#C9A227',
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.2)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Open Chat
            <ArrowRight size={12} />
          </Link>
        </div>

        {recentConvs.length > 0 ? (
          <div>
            {recentConvs.map((conv, i) => (
              <ConvRow
                key={conv.id}
                conv={conv}
                index={i}
                isLast={i === recentConvs.length - 1}
              />
            ))}
          </div>
        ) : (
          <p
            className="py-10 text-center text-sm"
            style={{ color: '#4A6080', fontFamily: 'DM Sans, sans-serif' }}
          >
            No conversations yet. Start chatting with BRICK.
          </p>
        )}
      </motion.div>
    </div>
  )
}
