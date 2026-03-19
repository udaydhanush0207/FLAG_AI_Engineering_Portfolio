import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import LeadsPage from './pages/LeadsPage'
import AgentsPage from './pages/AgentsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
