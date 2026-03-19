import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Activity,
  HardHat,
  ChevronRight,
} from 'lucide-react'
import { fetchHealth } from '../lib/api'

const NAV = [
  { to: '/',       icon: LayoutDashboard, label: 'Dashboard',  tag: 'LIVE'    },
  { to: '/chat',   icon: MessageSquare,   label: 'BRICK Chat', tag: 'AI'      },
  { to: '/leads',  icon: Users,           label: 'Leads',      tag: 'GEN'     },
  { to: '/agents', icon: Bot,             label: 'Agents',     tag: 'SYS'     },
]

export default function Layout() {
  const location = useLocation()
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  })
  const isOnline = health?.status === 'ok'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060D1B' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex flex-col shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0A1628 0%, #060D1B 100%)',
          borderRight: '1px solid #162440',
        }}
      >
        {/* Animated scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.15), transparent)',
              animation: 'scan-line 6s linear infinite',
            }}
          />
        </div>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-flag-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center gold-glow shrink-0"
              style={{ background: 'linear-gradient(135deg, #C9A227, #7A6018)' }}
            >
              <HardHat size={20} style={{ color: '#060D1B' }} />
            </div>
            <div>
              <div
                className="font-bold text-flag-bright tracking-wide text-sm leading-tight"
                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}
              >
                FLAG AI
              </div>
              <div className="font-mono text-[9px] text-flag-gold tracking-widest uppercase">
                Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, tag }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <motion.div
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group"
                  style={{
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(201,162,39,0.12), rgba(201,162,39,0.04))'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(201,162,39,0.2)'
                      : '1px solid transparent',
                  }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: '#C9A227' }}
                      layoutId="navIndicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={16}
                    style={{
                      color: isActive ? '#C9A227' : '#475569',
                      transition: 'color 0.2s',
                    }}
                  />
                  <span
                    className="flex-1 text-sm font-medium"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: isActive ? '#F1F5F9' : '#475569',
                      transition: 'color 0.2s',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                    style={{
                      background: isActive ? 'rgba(201,162,39,0.15)' : 'rgba(22,36,64,0.8)',
                      color: isActive ? '#C9A227' : '#475569',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {tag}
                  </span>
                  {isActive && (
                    <ChevronRight size={12} style={{ color: '#C9A227' }} />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Backend status */}
        <div className="px-4 py-4 border-t border-flag-border">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(6,13,27,0.8)', border: '1px solid #162440' }}
          >
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? 'status-dot-online' : 'status-dot-red'}`}
              style={{ background: isOnline ? '#10B981' : '#9B1515' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-flag-muted uppercase tracking-widest">Backend</div>
              <div className="text-xs font-medium" style={{ color: isOnline ? '#10B981' : '#9B1515' }}>
                {isOnline ? 'Connected' : 'Offline'}
              </div>
            </div>
            <Activity size={12} style={{ color: isOnline ? '#10B981' : '#9B1515' }} />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            background: 'rgba(6,13,27,0.95)',
            borderBottom: '1px solid #162440',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-flag-muted uppercase tracking-widest">
              {location.pathname === '/'       ? 'OVERVIEW' :
               location.pathname === '/chat'   ? 'BRICK v2'  :
               location.pathname === '/leads'  ? 'LEAD GEN'  : 'AGENTS'}
            </span>
            <ChevronRight size={10} style={{ color: '#162440' }} />
            <span
              className="text-sm font-semibold text-flag-text"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {location.pathname === '/'       ? 'Intelligence Dashboard' :
               location.pathname === '/chat'   ? 'AI Assistant'           :
               location.pathname === '/leads'  ? 'Lead Pipeline'          : 'Agent Status'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] text-flag-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-flag-gold status-dot-gold" />
              <span className="font-mono text-[9px] text-flag-gold tracking-wider">FLAG LIVE</span>
            </div>
          </div>
        </header>

        {/* Page content with page transitions */}
        <main className="flex-1 overflow-auto grid-bg">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
