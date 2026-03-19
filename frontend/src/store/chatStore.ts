import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: string
  queryType?: string
  modelUsed?: string
  responseTimeMs?: number
  timestamp: Date
}

interface ChatState {
  messages: Message[]
  isLoading: boolean
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<Message>) => void
  setLoading: (v: boolean) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (msg) => {
    const id = crypto.randomUUID()
    set((s) => ({
      messages: [...s.messages, { ...msg, id, timestamp: new Date() }],
    }))
    return id
  },

  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  setLoading: (v) => set({ isLoading: v }),

  clearChat: () => set({ messages: [], isLoading: false }),
}))
