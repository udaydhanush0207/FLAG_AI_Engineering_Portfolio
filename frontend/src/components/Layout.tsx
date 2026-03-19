import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useSpring, animated } from '@react-spring/web'
import { LayoutDashboard, MessageSquare, Users, Bot, Activity, HardHat, ChevronRight } from 'lucide-react'
import { fetchHealth } from '../lib/api'

const NAV = [
  { to: '/',       icon: LayoutDashboard, label: 'Dashboard',  tag: 'LIVE' },
  { to: '/chat',   icon: MessageSquare,   label: 'BRICK Chat', tag: 'AI'   },
  { to: '/leads',  icon: Users,           label: 'Leads',      tag: 'GEN'  },
  { to: '/agents', icon: Bot,             label: 'Agents',     tag: 'SYS'  },
]

function NavItem({ to, icon: Icon, label, tag }: typeof NAV[0]) {
  return (
    <NavLink to={to} end={to === '/'}>
      {({ isActive }) => (
        <motion.div
          className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
          style={{
            background: isActive ? 'linear-gradient(90deg,rgba(201,162,39,0.12),rgba(201,162,39,0.03))' : 'transparent',
            border: `1px solid ${isActive ? 'rgba(201,162,39,0.2)' : 'transparent'}`,
          }}
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
              style={{ background: 'linear-gradient(180deg,#C9A227,#7A6018)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon size={15} style={{ color: isActive ? '#C9A227' : '#334155', transition: 'color 0.2s' }} />
          <span
            className="flex-1 text-sm font-medium"
            style={{ color: isActive ? '#F1F5F9' : '#475569', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.2s' }}
          >
            {label}
          </span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: isActive ? 'rgba(201,162,39,0.15)' : 'rgba(22,36,64,0.6)',
              color: isActive ? '#C9A227' : '#334155',
              letterSpacing: '0.08em',
            }}
          >
            {tag}
          </span>
          {isActive && <ChevronRight size={11} style={{ color: '#C9A227' }} />}
        </motion.div>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const location = useLocation()
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: fetchHealth, refetchInterval: 15_000 })
  const isOnline = health?.status === 'ok'

  const logoGlow = useSpring({
    from: { opacity: 0.4 },
    to:   { opacity: 1 },
    loop: { reverse: true },
    config: { duration: 2500 },
  })

  const pageLabel: Record<string, string> = {
    '/':       'Intelligence Dashboard',
    '/chat':   'AI Assistant',
    '/leads':  'Lead Pipeline',
    '/agents': 'Agent Status',
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060D1B' }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex flex-col shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,#0A1628 0%,#070F1E 100%)',
          borderRight: '1px solid #162440',
        }}
      >
        {/* Scan line */}
        <div className="scan-line" />

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-flag-border">
          <div className="flex items-center gap-3">
            <animated.div
              style={{
                ...logoGlow,
                width: 40, height: 40,
                background: 'linear-gradient(135deg,#C9A227,#7A6018)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(201,162,39,0.25)',
                flexShrink: 0,
              }}
            >
              <HardHat size={20} style={{ color: '#060D1B' }} />
            </animated.div>
            <div>
              <div className="text-sm font-black tracking-widest text-white uppercase" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.25em' }}>
                FLAG AI
              </div>
              <div className="text-[8px] font-mono tracking-widest uppercase" style={{ color: 'rgba(201,162,39,0.65)', letterSpacing: '0.18em' }}>
                Command Center
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* Backend status */}
        <div className="px-4 py-4 border-t border-flag-border">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: 'rgba(6,13,27,0.8)', border: '1px solid #162440' }}
          >
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? 'status-dot-online' : ''}`}
              style={{ background: isOnline ? '#10B981' : '#9B1515', flexShrink: 0 }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono text-flag-muted uppercase tracking-widest">Backend</div>
              <div className="text-xs font-medium" style={{ color: isOnline ? '#10B981' : '#9B1515' }}>
                {isOnline ? 'Connected' : 'Offline'}
              </div>
            </div>
            <Activity size={11} style={{ color: isOnline ? '#10B981' : '#9B1515' }} />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{ background: 'rgba(6,13,27,0.95)', borderBottom: '1px solid #162440', backdropFilter: 'blur(16px)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#2D4060', letterSpacing: '0.18em' }}>
              {location.pathname === '/' ? 'OVERVIEW' : location.pathname === '/chat' ? 'BRICK v2' : location.pathname === '/leads' ? 'LEAD GEN' : 'AGENTS'}
            </span>
            <ChevronRight size={9} style={{ color: '#162440' }} />
            <span className="text-sm font-semibold" style={{ color: '#CBD5E1', fontFamily: 'Syne, sans-serif' }}>
              {pageLabel[location.pathname] ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-[9px]" style={{ color: '#2D4060' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.15)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full status-dot-gold" style={{ background: '#C9A227' }} />
              <span className="font-mono text-[8px] tracking-wider" style={{ color: '#C9A227', letterSpacing: '0.15em' }}>FLAG LIVE</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto grid-bg relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
