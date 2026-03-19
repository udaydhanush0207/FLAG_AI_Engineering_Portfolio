import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type Lead } from '../lib/api'
import { Download, Filter, ChevronUp, ChevronDown, Users, Star } from 'lucide-react'
import { motion } from 'framer-motion'

// ── Page transition ───────────────────────────────────────────────────────────
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
}

// ── Placeholder leads for demo ───────────────────────────────────────────────
const PLACEHOLDER_LEADS: Lead[] = [
  { id: '1',  name: 'Carlos Mendoza',  title: 'CIP Program Director',     county: 'Travis',     state: 'TX', category: 'CIP',  score: 9, status: 'new',         email: 'c.mendoza@traviscounty.gov',    created_at: '2026-03-15' },
  { id: '2',  name: 'Jennifer Walsh',  title: 'County Judge',             county: 'Harris',     state: 'TX', category: 'MGO',  score: 8, status: 'contacted',    email: 'j.walsh@harriscounty.gov',     created_at: '2026-03-14' },
  { id: '3',  name: 'Robert Kim',      title: 'Infrastructure Director',  county: 'Bexar',      state: 'TX', category: 'CIP',  score: 9, status: 'meeting_set',  email: 'r.kim@bexarcounty.gov',        created_at: '2026-03-13' },
  { id: '4',  name: 'Maria Santos',    title: 'CFO',                      county: 'Tarrant',    state: 'TX', category: 'BOTH', score: 7, status: 'new',         email: 'm.santos@tarrantcounty.gov',   created_at: '2026-03-12' },
  { id: '5',  name: 'James Thornton',  title: 'City Manager',             county: 'Denton',     state: 'TX', category: 'CIP',  score: 8, status: 'new',         email: 'j.thornton@dentoncity.gov',    created_at: '2026-03-11' },
  { id: '6',  name: 'Angela Price',    title: 'Bond Program Manager',     county: 'Collin',     state: 'TX', category: 'MGO',  score: 6, status: 'contacted',    email: 'a.price@collincounty.gov',     created_at: '2026-03-10' },
  { id: '7',  name: 'Derek Okafor',    title: 'Public Works Director',    county: 'Fort Bend',  state: 'TX', category: 'CIP',  score: 8, status: 'new',         email: 'd.okafor@fortbendcounty.gov',  created_at: '2026-03-09' },
  { id: '8',  name: 'Lisa Hernandez',  title: 'County Commissioner',      county: 'Montgomery', state: 'TX', category: 'CIP',  score: 7, status: 'meeting_set', email: 'l.hernandez@mcohd.org',        created_at: '2026-03-08' },
  { id: '9',  name: 'Thomas Wright',   title: 'Capital Projects Dir.',    county: 'Williamson', state: 'TX', category: 'BOTH', score: 9, status: 'new',         email: 't.wright@wilco.org',           created_at: '2026-03-07' },
  { id: '10', name: 'Priya Nair',      title: 'Finance Director',         county: 'Hays',       state: 'TX', category: 'MGO',  score: 6, status: 'new',         email: 'p.nair@hayscounty.gov',        created_at: '2026-03-06' },
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
    converted:   { label: 'Converted',   bg: 'rgba(139,92,246,0.1)', color: '#A78BFA' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(255,255,255,0.05)', color: '#475569' }
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22`, fontFamily: 'JetBrains Mono, monospace' }}
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

// ── Pipeline funnel ───────────────────────────────────────────────────────────
function PipelineFunnel({ leads }: { leads: Lead[] }) {
  const stages = [
    { key: 'new',         label: 'New',         color: '#3B82F6' },
    { key: 'contacted',   label: 'Contacted',   color: '#C9A227' },
    { key: 'meeting_set', label: 'Meeting Set', color: '#10B981' },
    { key: 'converted',   label: 'Converted',   color: '#A78BFA' },
  ]
  const total = leads.length || 1

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
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const count = leads.filter(l => l.status === stage.key).length
          const pct = (count / total) * 100
          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif' }}>
                  {stage.label}
                </span>
                <span className="text-xs font-semibold font-mono" style={{ color: stage.color }}>
                  {count}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#162440' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: stage.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportCSV(leads: Lead[]) {
  const headers = ['First Name', 'Last Name', 'Title', 'Municipality', 'State', 'Email', 'Status', 'Status Date', 'Phone', 'MGO Confirmed', 'Score', 'Category']
  const rows = leads.map(l => {
    const [first, last] = splitName(l.name)
    return [
      first, last, l.title ?? '', l.county, l.state,
      l.email ?? '', l.status,
      new Date(l.created_at).toLocaleDateString(),
      '', // phone not in Lead type but included per spec
      l.category === 'MGO' || l.category === 'BOTH' ? 'Yes' : 'No',
      l.score, l.category ?? '',
    ]
  })
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `flag-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

// ── Sort header ───────────────────────────────────────────────────────────────
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { data: leadsData } = useQuery({ queryKey: ['leads'], queryFn: api.leads })
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter]     = useState<string>('ALL')
  const [sortKey, setSortKey]               = useState<SortKey>('score')
  const [sortDir, setSortDir]               = useState<SortDir>('desc')

  const rawLeads: Lead[] = leadsData?.leads?.length ? leadsData.leads : PLACEHOLDER_LEADS

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
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
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
            Lead Pipeline
          </h2>
          <p className="text-sm mt-1" style={{ color: '#475569' }}>
            {leads.length} leads · Texas counties for CIP/MGO outreach
          </p>
        </div>
        <motion.button
          onClick={() => exportCSV(leads)}
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(201,162,39,0.15)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg"
          style={{ background: 'rgba(201,162,39,0.1)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.25)' }}
        >
          <Download size={13} /> Export CSV
        </motion.button>
      </motion.div>

      {/* Funnel + filters row */}
      <div className="grid lg:grid-cols-4 gap-5">
        <PipelineFunnel leads={rawLeads} />

        <motion.div
          className="lg:col-span-3 rounded-lg border p-4 flex items-start gap-6 flex-wrap"
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
      </div>

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
                const mgoConfirmed = lead.category === 'MGO' || lead.category === 'BOTH'
                return (
                  <motion.tr
                    key={lead.id}
                    className="border-b"
                    style={{ borderColor: '#0F1F36' }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
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
                      <span className="text-xs" style={{ color: '#2D3F5C' }}>—</span>
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
            AI lead generation · Phase 4
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
