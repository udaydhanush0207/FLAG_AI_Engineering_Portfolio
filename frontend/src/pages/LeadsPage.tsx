import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Lead } from '../lib/api'
import { Download, Filter, ChevronUp, ChevronDown, Users, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'

// ── Page transition ───────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
} as const

// ── Placeholder leads for demo ────────────────────────────────────────────────
const PLACEHOLDER_LEADS: (Lead & { phone?: string })[] = [
  { id: '1',  name: 'Carlos Mendoza',  title: 'CIP Program Director',    county: 'Travis',     state: 'TX', category: 'CIP',  score: 9, status: 'new',         email: 'c.mendoza@traviscounty.gov',   phone: '(512) 854-9100', created_at: '2026-03-15' },
  { id: '2',  name: 'Jennifer Walsh',  title: 'County Judge',            county: 'Harris',     state: 'TX', category: 'MGO',  score: 8, status: 'contacted',   email: 'j.walsh@harriscounty.gov',    phone: '(713) 755-5000', created_at: '2026-03-14' },
  { id: '3',  name: 'Robert Kim',      title: 'Infrastructure Director', county: 'Bexar',      state: 'TX', category: 'CIP',  score: 9, status: 'meeting_set', email: 'r.kim@bexarcounty.gov',       phone: '(210) 335-2400', created_at: '2026-03-13' },
  { id: '4',  name: 'Maria Santos',    title: 'CFO',                     county: 'Tarrant',    state: 'TX', category: 'BOTH', score: 7, status: 'new',         email: 'm.santos@tarrantcounty.gov',  phone: '(817) 884-1111', created_at: '2026-03-12' },
  { id: '5',  name: 'James Thornton',  title: 'City Manager',            county: 'Denton',     state: 'TX', category: 'CIP',  score: 8, status: 'new',         email: 'j.thornton@dentoncity.gov',   phone: '(940) 349-8330', created_at: '2026-03-11' },
  { id: '6',  name: 'Angela Price',    title: 'Bond Program Manager',    county: 'Collin',     state: 'TX', category: 'MGO',  score: 6, status: 'contacted',   email: 'a.price@collincounty.gov',    phone: '(972) 548-4100', created_at: '2026-03-10' },
  { id: '7',  name: 'Derek Okafor',    title: 'Public Works Director',   county: 'Fort Bend',  state: 'TX', category: 'CIP',  score: 8, status: 'new',         email: 'd.okafor@fortbendcounty.gov', phone: '(281) 341-8600', created_at: '2026-03-09' },
  { id: '8',  name: 'Lisa Hernandez',  title: 'County Commissioner',     county: 'Montgomery', state: 'TX', category: 'CIP',  score: 7, status: 'meeting_set', email: 'l.hernandez@mcohd.org',       phone: '(936) 539-7842', created_at: '2026-03-08' },
  { id: '9',  name: 'Thomas Wright',   title: 'Capital Projects Dir.',   county: 'Williamson', state: 'TX', category: 'BOTH', score: 9, status: 'new',         email: 't.wright@wilco.org',          phone: '(512) 943-1100', created_at: '2026-03-07' },
  { id: '10', name: 'Priya Nair',      title: 'Finance Director',        county: 'Hays',       state: 'TX', category: 'MGO',  score: 6, status: 'new',         email: 'p.nair@hayscounty.gov',       phone: '(512) 393-2205', created_at: '2026-03-06' },
]

type SortKey = 'score' | 'name' | 'county' | 'status'
type SortDir = 'asc' | 'desc'

// ── Helpers ───────────────────────────────────────────────────────────────────
function splitName(full: string): [string, string] {
  const parts = full.trim().split(' ')
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? '#C9A227' : score >= 6 ? '#3B82F6' : '#475569'
  return (
    <div className="flex items-center gap-1.5">
      <Star size={11} fill={score >= 8 ? '#C9A227' : 'none'} style={{ color }} />
      <span className="text-sm font-semibold" style={{ color, fontFamily: 'JetBrains Mono, monospace' }}>
        {score}
      </span>
    </div>
  )
}

// ── Status chip ───────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    new:         { label: 'New',         bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6' },
    contacted:   { label: 'Contacted',   bg: 'rgba(201,162,39,0.1)', color: '#C9A227' },
    meeting_set: { label: 'Meeting Set', bg: 'rgba(16,185,129,0.1)', color: '#34D399' },
    converted:   { label: 'Converted',   bg: 'rgba(6,32,82,0.6)',    color: '#C9A227' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(255,255,255,0.05)', color: '#475569' }
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`,
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {s.label}
    </span>
  )
}

// ── Category chip ─────────────────────────────────────────────────────────────
function CategoryChip({ category }: { category?: string }) {
  const map: Record<string, string> = { CIP: '#C9A227', MGO: '#3B82F6', BOTH: '#A78BFA' }
  const color = map[category ?? ''] ?? '#475569'
  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded"
      style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
    >
      {category ?? '—'}
    </span>
  )
}

// ── Pipeline funnel — horizontal bars in a row ────────────────────────────────
const STAGES = [
  { key: 'new',         label: 'New',         color: '#3B82F6' },
  { key: 'contacted',   label: 'Contacted',   color: '#C9A227' },
  { key: 'meeting_set', label: 'Meeting Set', color: '#22C55E' },
  { key: 'converted',   label: 'Converted',   color: '#062052', borderColor: '#C9A227' },
] as const

function PipelineBar({ count, maxCount, color, borderColor, delay }: {
  count: number
  maxCount: number
  color: string
  borderColor?: string
  delay: number
}) {
  const pct = maxCount === 0 ? 0 : (count / maxCount) * 100
  const spring = useSpring({
    from: { val: 0 },
    to: { val: count },
    config: { tension: 55, friction: 13 },
    delay: delay * 1000,
  })

  return (
    <div className="flex-1 min-w-0">
      {/* Bar track */}
      <div
        className="h-10 rounded-lg overflow-hidden relative"
        style={{
          background: '#060D1B',
          border: `1px solid ${borderColor ?? color}33`,
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-2"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 1.2, ease: 'easeOut' as const, delay }}
          style={{ background: color, border: borderColor ? `1px solid ${borderColor}` : undefined, transformOrigin: 'left center' }}
        >
          {pct > 18 && (
            <span
              className="text-xs font-bold"
              style={{
                color: borderColor ? '#C9A227' : '#fff',
                fontFamily: 'JetBrains Mono, monospace',
                mixBlendMode: 'screen',
              }}
            >
              <animated.span>{spring.val.to(v => Math.round(v))}</animated.span>
            </span>
          )}
        </motion.div>
        {pct <= 18 && count > 0 && (
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
            style={{ color, fontFamily: 'JetBrains Mono, monospace' }}
          >
            <animated.span>{spring.val.to(v => Math.round(v))}</animated.span>
          </span>
        )}
        {count === 0 && (
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: '#2D3F5C', fontFamily: 'JetBrains Mono, monospace' }}
          >
            0
          </span>
        )}
      </div>
    </div>
  )
}

function PipelineFunnel({ leads }: { leads: Lead[] }) {
  const counts = STAGES.map(s => leads.filter(l => l.status === s.key).length)
  const maxCount = Math.max(...counts, 1)

  return (
    <motion.div
      className="rounded-lg border p-5"
      style={{ background: '#0A1628', borderColor: '#162440' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <h3
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}
      >
        Pipeline Funnel
      </h3>
      {/* Labels row */}
      <div className="flex gap-3 mb-2">
        {STAGES.map(s => (
          <div key={s.key} className="flex-1 min-w-0">
            <span
              className="text-xs"
              style={{ color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif' }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* Bars row */}
      <div className="flex gap-3">
        {STAGES.map((stage, i) => (
          <PipelineBar
            key={stage.key}
            count={counts[i]}
            maxCount={maxCount}
            color={stage.color}
            borderColor={'borderColor' in stage ? stage.borderColor : undefined}
            delay={i * 0.15}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV(leads: (Lead & { phone?: string })[]) {
  const headers = [
    'First Name', 'Last Name', 'Title', 'Municipality', 'State',
    'Email', 'Status', 'Status Date', 'Phone', 'MGO Confirmed', 'Score', 'Category',
  ]
  const rows = leads.map(l => {
    const [first, last] = splitName(l.name)
    return [
      first,
      last,
      l.title ?? '',
      l.county,
      l.state,
      l.email ?? '',
      l.status,
      new Date(l.created_at).toLocaleDateString(),
      l.phone ?? '',
      l.category === 'MGO' || l.category === 'BOTH' ? 'Yes' : 'No',
      l.score,
      l.category ?? '',
    ]
  })
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `flag-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

// ── Sortable header ───────────────────────────────────────────────────────────
function Th({ children, sortKey, currentKey, dir, onSort }: {
  children: React.ReactNode
  sortKey: SortKey
  currentKey: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
}) {
  const active = sortKey === currentKey
  return (
    <th
      className="px-3 py-3 text-left text-[10px] uppercase tracking-widest cursor-pointer select-none transition-colors hover:text-slate-200 whitespace-nowrap"
      style={{ color: active ? '#C9A227' : '#475569', fontFamily: 'JetBrains Mono, monospace' }}
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {children}
        {active ? (dir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />) : null}
      </span>
    </th>
  )
}

function PlainTh({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-3 py-3 text-left text-[10px] uppercase tracking-widest whitespace-nowrap"
      style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}
    >
      {children}
    </th>
  )
}

// ── Filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
      style={{
        background: active ? 'rgba(201,162,39,0.12)' : 'rgba(255,255,255,0.03)',
        color: active ? '#C9A227' : '#475569',
        border: `1px solid ${active ? 'rgba(201,162,39,0.3)' : '#162440'}`,
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      {label}
    </motion.button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  // Try Google Sheets first (live n8n data), fall back to Supabase
  const { data: sheetsData, dataUpdatedAt } = useQuery({
    queryKey: ['leads-sheets'],
    queryFn: api.leadsFromSheets,
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
  const { data: supabaseData } = useQuery({ queryKey: ['leads'], queryFn: api.leads, enabled: !sheetsData })

  const [secondsAgo, setSecondsAgo] = useState(0)
  useEffect(() => {
    setSecondsAgo(0)
    const interval = setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - dataUpdatedAt) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [dataUpdatedAt])
  const leadsData = sheetsData ?? supabaseData
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter]     = useState<string>('ALL')
  const [sortKey, setSortKey]               = useState<SortKey>('score')
  const [sortDir, setSortDir]               = useState<SortDir>('desc')

  const rawLeads: (Lead & { phone?: string })[] =
    leadsData?.leads?.length ? leadsData.leads : PLACEHOLDER_LEADS

  const leads = useMemo(() => {
    let filtered = rawLeads
    if (categoryFilter !== 'ALL') filtered = filtered.filter(l => l.category === categoryFilter)
    if (statusFilter   !== 'ALL') filtered = filtered.filter(l => l.status    === statusFilter)
    return [...filtered].sort((a, b) => {
      let diff = 0
      if (sortKey === 'score')  diff = a.score - b.score
      if (sortKey === 'name')   diff = a.name.localeCompare(b.name)
      if (sortKey === 'county') diff = a.county.localeCompare(b.county)
      if (sortKey === 'status') diff = a.status.localeCompare(b.status)
      return sortDir === 'desc' ? -diff : diff
    })
  }, [rawLeads, categoryFilter, statusFilter, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <motion.div
      className="p-6 space-y-5 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
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
            Lead Pipeline
          </h2>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {rawLeads.length} leads · Texas counties for CIP/MGO outreach
          </p>
        </div>
        <motion.button
          onClick={() => exportCSV(leads)}
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(201,162,39,0.15)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(201,162,39,0.1)',
            color: '#C9A227',
            border: '1px solid rgba(201,162,39,0.25)',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Pipeline funnel — full width */}
      <PipelineFunnel leads={rawLeads} />

      {/* Filter bar */}
      <motion.div
        className="rounded-lg border p-4 flex items-start gap-6 flex-wrap"
        style={{ background: '#0A1628', borderColor: '#162440' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} style={{ color: '#475569' }} />
          <span className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
            Category
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {['ALL', 'CIP', 'MGO', 'BOTH'].map(c => (
              <FilterBtn key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
            Status
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { v: 'ALL',         l: 'All'         },
              { v: 'new',         l: 'New'         },
              { v: 'contacted',   l: 'Contacted'   },
              { v: 'meeting_set', l: 'Meeting Set' },
            ].map(({ v, l }) => (
              <FilterBtn key={v} label={l} active={statusFilter === v} onClick={() => setStatusFilter(v)} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-lg border overflow-hidden"
        style={{ background: '#0A1628', borderColor: '#162440' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #162440', background: '#060D1B' }}>
                <Th sortKey="name"   currentKey={sortKey} dir={sortDir} onSort={toggleSort}>First Name</Th>
                <PlainTh>Last Name</PlainTh>
                <PlainTh>Title</PlainTh>
                <Th sortKey="county" currentKey={sortKey} dir={sortDir} onSort={toggleSort}>Municipality</Th>
                <PlainTh>State</PlainTh>
                <PlainTh>Email</PlainTh>
                <Th sortKey="status" currentKey={sortKey} dir={sortDir} onSort={toggleSort}>Status</Th>
                <PlainTh>Status Date</PlainTh>
                <PlainTh>Phone</PlainTh>
                <PlainTh>MGO Confirmed</PlainTh>
                <Th sortKey="score"  currentKey={sortKey} dir={sortDir} onSort={toggleSort}>Score</Th>
                <PlainTh>Category</PlainTh>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => {
                const [first, last] = splitName(lead.name)
                const mgoConfirmed  = lead.category === 'MGO' || lead.category === 'BOTH'
                return (
                  <motion.tr
                    key={lead.id}
                    className="border-b"
                    style={{ borderColor: '#0F1F36' }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(201,162,39,0.03)' }}
                  >
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-white whitespace-nowrap">{first}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-slate-300 whitespace-nowrap">{last}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs whitespace-nowrap" style={{ color: '#475569' }}>{lead.title ?? '—'}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm whitespace-nowrap" style={{ color: '#CBD5E1' }}>{lead.county}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-mono" style={{ color: '#475569' }}>{lead.state}</p>
                    </td>
                    <td className="px-3 py-3">
                      {lead.email
                        ? <a href={`mailto:${lead.email}`} className="text-xs hover:opacity-70 transition-opacity whitespace-nowrap" style={{ color: '#3B82F6' }}>{lead.email}</a>
                        : <span className="text-xs" style={{ color: '#2D3F5C' }}>—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <StatusChip status={lead.status} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono whitespace-nowrap" style={{ color: '#475569' }}>
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono whitespace-nowrap" style={{ color: '#CBD5E1' }}>
                        {lead.phone ?? <span style={{ color: '#2D3F5C' }}>—</span>}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{
                          background: mgoConfirmed ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                          color: mgoConfirmed ? '#34D399' : '#475569',
                        }}
                      >
                        {mgoConfirmed ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-3 py-3">
                      <CategoryChip category={lead.category} />
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {leads.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Users size={32} className="mb-3" style={{ color: '#162440' }} />
            <p className="text-sm" style={{ color: '#475569' }}>No leads match the current filters</p>
          </div>
        )}

        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: '#162440' }}>
          <span className="text-xs font-mono" style={{ color: '#2D3F5C' }}>
            {leads.length} records
          </span>
          <span className="text-xs font-mono" style={{ color: '#2D3F5C' }}>
            {dataUpdatedAt > 0
              ? `Last synced: ${secondsAgo}s ago · auto-refresh every 30s`
              : 'AI lead generation · Phase 4'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
