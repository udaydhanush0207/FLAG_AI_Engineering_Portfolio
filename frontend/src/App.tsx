import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import LeadsPage from './pages/LeadsPage'
import AgentsPage from './pages/AgentsPage'
import LoadingScreen from './components/LoadingScreen'
import CustomCursor from './components/CustomCursor'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

// ── Page transition variants ─────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -30 },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/"       element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/chat"   element={<PageWrapper><ChatPage /></PageWrapper>} />
          <Route path="/leads"  element={<PageWrapper><LeadsPage /></PageWrapper>} />
          <Route path="/agents" element={<PageWrapper><AgentsPage /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function AppInner() {
  const [loaded, setLoaded] = useState(false)

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    let frame: number
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { lenis.destroy(); cancelAnimationFrame(frame) }
  }, [])

  return (
    <div className="noise-overlay" style={{ height: '100%' }}>
      <CustomCursor />
      <AnimatePresence>{!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}</AnimatePresence>
      <motion.div
        style={{ height: '100%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </motion.div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
