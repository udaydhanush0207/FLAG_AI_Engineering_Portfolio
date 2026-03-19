import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Cpu, Clock, ExternalLink, ChevronDown } from 'lucide-react'
import { useChatStore, type Message } from '../store/chatStore'
import { api } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = [
  'What programs does FLAG manage?',
  'What is CIP and how does FLAG help with it?',
  'Tell me about bond program controls in Texas.',
  'What counties has FLAG worked with?',
]

// ── Page transition ───────────────────────────────────────────────────────────
const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
}

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-end gap-2.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227', fontFamily: 'Syne, sans-serif' }}
      >
        B
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
        style={{ background: '#0A1628', border: '1px solid #162440' }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 typing-dot" />
      </div>
    </motion.div>
  )
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={
          isUser
            ? { background: 'rgba(22,36,64,0.8)', border: '1px solid #162440', color: '#475569', fontFamily: 'Syne, sans-serif' }
            : { background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227', fontFamily: 'Syne, sans-serif' }
        }
      >
        {isUser ? 'U' : 'B'}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
          style={
            isUser
              ? {
                  background: 'rgba(201,162,39,0.1)',
                  border: '1px solid rgba(201,162,39,0.2)',
                  color: '#F1F5F9',
                  borderRadius: '18px 18px 4px 18px',
                }
              : {
                  background: '#0A1628',
                  border: '1px solid #162440',
                  color: '#CBD5E1',
                  borderRadius: '18px 18px 18px 4px',
                }
          }
        >
          {msg.content}
        </div>

        {/* Metadata (BRICK responses only) */}
        {!isUser && msg.source && (
          <div className="flex items-center gap-3 px-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              <Cpu size={10} />{msg.modelUsed ?? 'unknown'}
            </span>
            {msg.responseTimeMs && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                <Clock size={10} />{msg.responseTimeMs}ms
              </span>
            )}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(201,162,39,0.08)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.15)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {msg.queryType}
            </span>
          </div>
        )}

        {!isUser && msg.source && (
          <p className="text-xs px-1 flex items-center gap-1" style={{ color: '#2D3F5C' }}>
            <ExternalLink size={10} />{msg.source}
          </p>
        )}

        <p className="text-xs px-1" style={{ color: '#1E3050' }}>
          {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// ── Main chat page ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [input, setInput] = useState('')
  const { messages, isLoading, addMessage, updateMessage, setLoading, clearChat } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200)
  }

  const history = messages
    .filter(m => m.content)
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))

  const send = async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || isLoading) return
    setInput('')

    addMessage({ role: 'user', content: question })
    const assistantId = addMessage({ role: 'assistant', content: '' })
    setLoading(true)

    try {
      const res = await api.chat(question, history.slice(0, -1))
      updateMessage(assistantId, {
        content: res.answer,
        source: res.source,
        queryType: res.query_type,
        modelUsed: res.model_used,
        responseTimeMs: res.response_time_ms,
      })
    } catch {
      updateMessage(assistantId, {
        content: 'Sorry, I encountered an error. Please check that the backend server is running.',
      })
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <motion.div
      className="flex flex-col h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Chat header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
        style={{ background: '#0A1628', borderColor: '#162440' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm status-dot-gold"
            style={{ background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227', fontFamily: 'Syne, sans-serif' }}
          >
            B
          </div>
          <div>
            <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>BRICK v2</p>
            <p className="text-xs" style={{ color: '#34D399' }}>● Online — RAG + Gemini 2.5 Flash</p>
          </div>
        </div>
        <motion.button
          onClick={clearChat}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-all hover:opacity-80"
          style={{ color: '#475569', border: '1px solid #162440' }}
        >
          <Trash2 size={12} /> Clear
        </motion.button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 relative" onScroll={handleScroll}>
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl font-bold"
                style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', color: '#C9A227', fontFamily: 'Syne, sans-serif', boxShadow: '0 0 40px rgba(201,162,39,0.1)' }}
                animate={{ boxShadow: ['0 0 20px rgba(201,162,39,0.08)', '0 0 50px rgba(201,162,39,0.2)', '0 0 20px rgba(201,162,39,0.08)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                B
              </motion.div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                BRICK Intelligence Assistant
              </h3>
              <p className="text-sm max-w-sm" style={{ color: '#475569' }}>
                Ask me anything about FLAG's programs, CIP bonds, Texas municipalities, or bond program management.
              </p>

              {/* Suggestion chips with stagger */}
              <motion.div
                className="mt-6 grid grid-cols-2 gap-2 max-w-lg w-full"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
              >
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => send(s)}
                    variants={{
                      hidden:   { opacity: 0, y: 10 },
                      visible:  { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(201,162,39,0.3)', color: '#F1F5F9' }}
                    whileTap={{ scale: 0.98 }}
                    className="text-xs text-left px-3 py-2.5 rounded-lg transition-colors"
                    style={{ background: '#0A1628', border: '1px solid #162440', color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <div key="messages" className="max-w-3xl mx-auto space-y-5">
              {messages.map((msg) =>
                msg.role === 'assistant' && !msg.content && !isLoading ? null : (
                  <MessageBubble key={msg.id} msg={msg} />
                )
              )}
              <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </AnimatePresence>

        {/* Scroll to bottom */}
        <AnimatePresence>
          {showScrollBtn && !isEmpty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#0A1628', border: '1px solid #162440' }}
            >
              <ChevronDown size={16} style={{ color: '#475569' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t p-4" style={{ background: '#0A1628', borderColor: '#162440' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="flex items-end gap-3 rounded-xl border p-3"
            animate={{
              borderColor: input.trim() ? 'rgba(201,162,39,0.35)' : '#162440',
              boxShadow: input.trim() ? '0 0 20px rgba(201,162,39,0.06)' : 'none',
            }}
            transition={{ duration: 0.2 }}
            style={{ background: '#060D1B' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask BRICK anything about FLAG or CIP bonds…"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed disabled:opacity-50"
              style={{ color: '#CBD5E1', fontFamily: 'DM Sans, sans-serif', maxHeight: '120px', minHeight: '24px' }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 120) + 'px'
              }}
            />
            <motion.button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: input.trim() && !isLoading ? '#C9A227' : '#162440' }}
            >
              <Send size={14} style={{ color: input.trim() && !isLoading ? '#060D1B' : '#334155' }} />
            </motion.button>
          </motion.div>
          <p className="text-xs mt-2 text-center" style={{ color: '#1E3050', fontFamily: 'JetBrains Mono, monospace' }}>
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </motion.div>
  )
}
