import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Cpu, Clock, ExternalLink, ChevronDown, Mic } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import type { Message } from '../store/chatStore'
import { api } from '../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What programs does FLAG manage?',
  'What is CIP and how does FLAG help with it?',
  'Tell me about bond program controls in Texas.',
  'What counties has FLAG worked with?',
] as const

// ── TypingIndicator ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-end gap-2.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
    >
      {/* BRICK avatar — gold B circle */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          background: 'rgba(201,162,39,0.15)',
          border: '1px solid rgba(201,162,39,0.3)',
          color: '#C9A227',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        B
      </div>

      {/* Bouncing dots */}
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: '#0A1628', border: '1px solid #162440' }}
      >
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
        <div className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
      </div>
    </motion.div>
  )
}

// ── MessageBubble ─────────────────────────────────────────────────────────────

interface CitationDrawerProps {
  source?: string
  modelUsed?: string
  responseTimeMs?: number
  queryType?: string
}

function CitationDrawer({ source, modelUsed, responseTimeMs, queryType }: CitationDrawerProps) {
  const [open, setOpen] = useState(false)

  if (!source && !modelUsed && !responseTimeMs && !queryType) return null

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-70"
        style={{ color: '#4A6080', fontFamily: 'JetBrains Mono, monospace' }}
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={11} />
        </motion.span>
        {open ? 'Hide details' : 'Show source'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' as const }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mt-1.5 rounded-lg px-3 py-2.5 space-y-1.5"
              style={{ background: 'rgba(6,13,27,0.7)', border: '1px solid #162440' }}
            >
              {modelUsed && (
                <div className="flex items-center gap-1.5">
                  <Cpu size={10} style={{ color: '#4A6080' }} />
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: 'rgba(6,32,82,0.6)',
                      color: '#4A7AB5',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {modelUsed}
                  </span>
                </div>
              )}

              {responseTimeMs != null && (
                <div className="flex items-center gap-1.5">
                  <Clock size={10} style={{ color: '#4A6080' }} />
                  <span
                    className="text-[10px]"
                    style={{ color: '#C9A227', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {responseTimeMs}ms
                  </span>
                </div>
              )}

              {queryType && (
                <span
                  className="inline-block rounded px-1.5 py-0.5 text-[10px]"
                  style={{
                    background: 'rgba(201,162,39,0.08)',
                    color: '#C9A227',
                    border: '1px solid rgba(201,162,39,0.15)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {queryType}
                </span>
              )}

              {source && (
                <div className="flex items-center gap-1.5">
                  <ExternalLink size={10} style={{ color: '#4A6080' }} />
                  <span
                    className="text-[10px] truncate"
                    style={{ color: '#4A6080', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {source}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const [isNew, setIsNew] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsNew(false), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
    >
      {/* Avatar */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={
          isUser
            ? {
                background: 'rgba(22,36,64,0.8)',
                border: '1px solid #162440',
                color: '#475569',
                fontFamily: 'Syne, sans-serif',
              }
            : {
                background: 'rgba(201,162,39,0.15)',
                border: '1px solid rgba(201,162,39,0.3)',
                color: '#C9A227',
                fontFamily: 'Syne, sans-serif',
              }
        }
      >
        {isUser ? 'U' : 'B'}
      </div>

      {/* Bubble + meta */}
      <div
        className={`flex max-w-[75%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        {/* Bubble */}
        <div
          className={`relative px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${!isUser && isNew ? 'gold-ripple' : ''}`}
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
          {msg.content || (
            <span style={{ color: '#4A6080', fontStyle: 'italic' }}>Thinking…</span>
          )}
        </div>

        {/* Citation drawer (BRICK only) */}
        {!isUser && (
          <CitationDrawer
            source={msg.source}
            modelUsed={msg.modelUsed}
            responseTimeMs={msg.responseTimeMs}
            queryType={msg.queryType}
          />
        )}

        {/* Timestamp */}
        <p
          className="px-1 text-[10px]"
          style={{ color: '#1E3050', fontFamily: 'JetBrains Mono, monospace' }}
        >
          {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

// ── ChatPage ──────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const { messages, isLoading, addMessage, updateMessage, setLoading, clearChat } =
    useChatStore()

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200)
  }

  const history = messages
    .filter((m) => m.content)
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }))

  const send = async (text?: string) => {
    const question = (text ?? input).trim()
    if (!question || isLoading) return
    setInput('')

    addMessage({ role: 'user', content: question })
    const assistantId = addMessage({ role: 'assistant', content: '' })
    setLoading(true)

    try {
      const res = await api.chat(question, history.slice(0, -1), 'web')
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
      void send()
    }
  }

  const isEmpty = messages.length === 0
  const hasText = input.trim().length > 0

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: '#060D1B', fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-5 py-3"
        style={{ background: '#0A1628', borderColor: '#162440' }}
      >
        <div className="flex items-center gap-2.5">
          {/* BRICK avatar */}
          <motion.div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: 'rgba(201,162,39,0.15)',
              border: '1px solid rgba(201,162,39,0.3)',
              color: '#C9A227',
              fontFamily: 'Syne, sans-serif',
            }}
            animate={{
              boxShadow: [
                '0 0 0px rgba(201,162,39,0)',
                '0 0 14px rgba(201,162,39,0.35)',
                '0 0 0px rgba(201,162,39,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            B
          </motion.div>

          <div>
            <p
              className="text-sm font-semibold text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              BRICK v2
            </p>
            <p className="text-xs" style={{ color: '#34D399' }}>
              ● Online — RAG + Gemini 2.5 Flash
            </p>
          </div>
        </div>

        <motion.button
          onClick={clearChat}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all hover:opacity-80"
          style={{ color: '#475569', border: '1px solid #162440' }}
        >
          <Trash2 size={12} />
          Clear
        </motion.button>
      </div>

      {/* ── Messages area ──────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 overflow-y-auto px-5 py-6"
        onScroll={handleScroll}
      >
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* Welcome screen */
            <motion.div
              key="welcome"
              className="flex h-full flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated B logo */}
              <motion.div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
                style={{
                  background: 'rgba(201,162,39,0.1)',
                  border: '1px solid rgba(201,162,39,0.2)',
                  color: '#C9A227',
                  fontFamily: 'Syne, sans-serif',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(201,162,39,0.08)',
                    '0 0 50px rgba(201,162,39,0.22)',
                    '0 0 20px rgba(201,162,39,0.08)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                B
              </motion.div>

              <h3
                className="mb-2 text-lg font-bold text-white"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                BRICK Intelligence Assistant
              </h3>
              <p className="max-w-sm text-sm" style={{ color: '#475569' }}>
                Ask me anything about FLAG's programs, CIP bonds, Texas municipalities,
                or bond program management.
              </p>

              {/* Staggered suggestion chips */}
              <motion.div
                className="mt-6 grid w-full max-w-lg grid-cols-2 gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
                  },
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => void send(s)}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: 'rgba(201,162,39,0.3)',
                      color: '#F1F5F9',
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-lg px-3 py-2.5 text-left text-xs transition-colors"
                    style={{
                      background: '#0A1628',
                      border: '1px solid #162440',
                      color: '#CBD5E1',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            /* Message list */
            <div key="messages" className="mx-auto max-w-3xl space-y-5">
              {messages.map((msg) =>
                msg.role === 'assistant' && !msg.content && !isLoading ? null : (
                  <MessageBubble key={msg.id} msg={msg} />
                ),
              )}
              <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </AnimatePresence>

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && !isEmpty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: '#0A1628', border: '1px solid #162440' }}
            >
              <ChevronDown size={16} style={{ color: '#475569' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input bar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 border-t p-4"
        style={{ background: '#0A1628', borderColor: '#162440' }}
      >
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="flex items-end gap-3 rounded-xl border p-3"
            animate={{
              borderColor: hasText ? 'rgba(201,162,39,0.35)' : '#162440',
              boxShadow: hasText ? '0 0 20px rgba(201,162,39,0.07)' : 'none',
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
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none disabled:opacity-50"
              style={{
                color: '#CBD5E1',
                fontFamily: 'DM Sans, sans-serif',
                maxHeight: '120px',
                minHeight: '24px',
              }}
              onInput={(e) => {
                const t = e.currentTarget
                t.style.height = 'auto'
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`
              }}
            />

            {/* Mic button (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: '#162440', border: '1px solid #1E3050' }}
              onClick={() => {/* voice placeholder */}}
              title="Voice input (coming soon)"
            >
              <Mic size={14} style={{ color: '#475569' }} />
            </motion.button>

            {/* Send button */}
            <motion.button
              onClick={() => void send()}
              disabled={!hasText || isLoading}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                background: hasText && !isLoading ? '#C9A227' : '#162440',
              }}
            >
              <Send size={14} style={{ color: hasText && !isLoading ? '#060D1B' : '#334155' }} />
            </motion.button>
          </motion.div>

          <p
            className="mt-2 text-center text-[10px]"
            style={{ color: '#1E3050', fontFamily: 'JetBrains Mono, monospace' }}
          >
            Enter to send · Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  )
}
