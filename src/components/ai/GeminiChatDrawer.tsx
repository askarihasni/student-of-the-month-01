import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  Key,
  Layers,
  RotateCcw,
  Eye,
  Bot,
  User,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { NodeUtils } from '../../editor/model/nodeUtils'
import type { DesignNode } from '../../types/document'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  data?: {
    title: string
    explanation: string
    suggestedPrompts?: string[]
    nodes: DesignNode[]
  }
  timestamp: string
}

const QUICK_PROMPTS = [
  { label: '📱 Mobile Login', prompt: 'Create a modern mobile login screen with email, password, and sign in button' },
  { label: '📊 Analytics Card', prompt: 'Design an analytics revenue card with KPI metric, growth badge, and bar chart' },
  { label: '💳 Pricing Table', prompt: 'Create a SaaS Pro pricing card with checkmark features and a free trial button' },
  { label: '🛍️ Product Card', prompt: 'Design an e-commerce product card with discount tag, star rating, and add to cart' },
  { label: '👤 Profile Card', prompt: 'Create a user profile card with header banner, avatar photo, stats, and follow button' },
  { label: '🚀 Hero Section', prompt: 'Design a high-impact landing page hero banner with headline, subtitle, and CTA buttons' },
]

export interface GeminiChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({ isOpen, onClose }) => {
  const { document, activePageId, addNodes, undo, setTransientState } = useEditorStore()

  const [inputPrompt, setInputPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vectorly_gemini_api_key') || '')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Assalam-o-Alaikum! Main aapka Gemini AI Design Copilot hoon. Aap mujhse koi bhi design banane ko bolein (jaise Login Form, Dashboard Card, Pricing Table, Mobile Screen), main direct aapke canvas par pixel-perfect vector elements bana doonga!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, messages])

  if (!isOpen) return null

  const handleSaveApiKey = () => {
    const trimmed = keyInput.trim()
    setApiKey(trimmed)
    if (trimmed) {
      localStorage.setItem('vectorly_gemini_api_key', trimmed)
    } else {
      localStorage.removeItem('vectorly_gemini_api_key')
    }
    setShowKeyModal(false)
  }

  const focusOnNodes = (nodes: DesignNode[]) => {
    if (!nodes || nodes.length === 0) return
    const aabb = NodeUtils.getNodesAABB(nodes)
    // Center viewport on this bounding box
    const centerX = aabb.x + aabb.width / 2
    const centerY = aabb.y + aabb.height / 2
    const windowW = window.innerWidth
    const windowH = window.innerHeight

    setTransientState({
      viewport: {
        x: windowW / 2 - centerX,
        y: windowH / 2 - centerY,
        zoom: 1,
      },
      selectedNodeIds: nodes.map((n) => n.id),
    })
  }

  const handleSendMessage = async (promptToSend?: string) => {
    const finalPrompt = (promptToSend || inputPrompt).trim()
    if (!finalPrompt || isGenerating) return

    setInputPrompt('')

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: finalPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsGenerating(true)

    // Calculate smart coordinate offset on the active canvas
    const activePage =
      document?.pages.find((p) => p.id === activePageId) || document?.pages[0]
    const rawNodes = activePage?.nodes
    const pageNodes: DesignNode[] = Array.isArray(rawNodes)
      ? rawNodes
      : rawNodes && typeof rawNodes === 'object'
      ? (Object.values(rawNodes) as DesignNode[])
      : []

    let targetX = 120
    let targetY = 120

    if (pageNodes.length > 0) {
      try {
        const aabb = NodeUtils.getNodesAABB(pageNodes)
        if (Number.isFinite(aabb.x) && Number.isFinite(aabb.width)) {
          targetX = Math.round(aabb.x + aabb.width + 60)
        }
        if (Number.isFinite(aabb.y)) {
          targetY = Math.round(aabb.y)
        }
      } catch {
        targetX = 120
        targetY = 120
      }
    }

    const safeX = Number.isFinite(targetX) ? targetX : 120
    const safeY = Number.isFinite(targetY) ? targetY : 120

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: finalPrompt,
          targetPosition: { x: safeX, y: safeY },
          documentId: document?.id,
          pageId: activePage?.id,
        }),
      })

      const json = await response.json()

      if (json.success && json.data) {
        const generatedNodes = (json.data.nodes || []) as DesignNode[]

        // Add nodes to canvas
        if (generatedNodes.length > 0) {
          addNodes(generatedNodes)
          focusOnNodes(generatedNodes)
        }

        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          text: json.data.explanation || `I have generated ${generatedNodes.length} vector elements for "${finalPrompt}".`,
          data: {
            title: json.data.title || 'Generated Component',
            explanation: json.data.explanation,
            suggestedPrompts: json.data.suggestedPrompts,
            nodes: generatedNodes,
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setMessages((prev) => [...prev, aiMsg])
      } else {
        throw new Error(json.error?.message || 'Failed to generate design')
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: `Error generating design: ${(err as Error).message}. Please try again or check your API key.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div
      className="fixed inset-y-0 right-0 w-[420px] max-w-[95vw] bg-[#18181B] border-l border-[#27272A] shadow-2xl z-50 flex flex-col select-none text-white animate-in slide-in-from-right-4 duration-200"
      style={{ boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.65)' }}
    >
      {/* 1. Header with Gradient Accent */}
      <div className="relative px-4 py-3.5 border-b border-[#27272A] flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#18181B] to-[#18181B]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-wide">Gemini AI Copilot</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA]">
              {apiKey ? 'Gemini 2.5 Flash Connected' : 'Intelligent Vector Agent Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* API Key Modal Button */}
          <button
            type="button"
            onClick={() => {
              setKeyInput(apiKey)
              setShowKeyModal(true)
            }}
            className={`p-1.5 rounded-md hover:bg-[#27272A] transition-colors ${
              apiKey ? 'text-emerald-400' : 'text-[#71717A] hover:text-white'
            }`}
            title={apiKey ? 'Custom Gemini API Key active (Click to change)' : 'Set Gemini API Key'}
          >
            <Key className="w-4 h-4" />
          </button>

          {/* Close drawer */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
            title="Close Assistant (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] px-1">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-[#0D99FF]" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span className="font-semibold text-purple-300">Gemini Agent</span>
                </>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Message Bubble */}
            <div
              className={`rounded-2xl px-3.5 py-2.5 max-w-[90%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#0D99FF] text-white rounded-tr-none font-medium'
                  : 'bg-[#27272A] text-[#E4E4E7] rounded-tl-none border border-[#3F3F46]'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Generated Component Card Action */}
              {msg.data && msg.data.nodes && msg.data.nodes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#3F3F46] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      <span>{msg.data.title}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                      {msg.data.nodes.length} Elements
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => focusOnNodes(msg.data!.nodes)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#3F3F46] hover:bg-[#52525B] text-white text-[11px] font-medium transition-colors"
                      title="Center view on generated design"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>Focus on Canvas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => undo()}
                      className="p-1.5 rounded-lg bg-[#3F3F46] hover:bg-[#52525B] text-[#A1A1AA] hover:text-white text-[11px] transition-colors"
                      title="Undo creation"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Follow-up suggestions */}
                  {msg.data.suggestedPrompts && msg.data.suggestedPrompts.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[10px] text-[#A1A1AA] mb-1 font-medium">Suggested Next Steps:</div>
                      <div className="space-y-1">
                        {msg.data.suggestedPrompts.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(s)}
                            className="w-full text-left text-[10px] text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/20 rounded px-2 py-1 transition-all flex items-center justify-between group"
                          >
                            <span>{s}</span>
                            <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Animated Agent Thinking */}
        {isGenerating && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-purple-300 px-1">
              <Bot className="w-3 h-3 text-purple-400 animate-spin" />
              <span className="font-semibold">Gemini Agent is designing...</span>
            </div>
            <div className="bg-[#27272A] border border-purple-500/40 rounded-2xl rounded-tl-none px-4 py-3 text-[#E4E4E7] space-y-2 max-w-[90%] shadow-lg">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Generating vector nodes, layout & colors...</span>
              </div>
              <div className="space-y-1 text-[11px] text-[#A1A1AA] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Parsed layout intent</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300 animate-pulse">
                  <span>•</span>
                  <span>Synthesizing Frame & child elements</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompt Chips */}
      <div className="px-3 py-2 border-t border-[#27272A] bg-[#141416]">
        <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Quick Design Prompts</span>
          <span className="text-[9px] text-[#52525B]">1-Click</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage(item.prompt)}
              className="px-2.5 py-1 rounded-full bg-[#27272A] hover:bg-[#3F3F46] hover:text-white text-[#D4D4D8] border border-[#3F3F46] text-[11px] font-medium whitespace-nowrap transition-all shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Input Box Area */}
      <div className="p-3 border-t border-[#27272A] bg-[#18181B] space-y-2">
        <div className="relative bg-[#27272A] rounded-xl border border-[#3F3F46] focus-within:border-purple-500 transition-colors p-2 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder="Describe what you want to design (e.g. 'Dark login card with gradient button')..."
            className="w-full bg-transparent text-white text-xs placeholder-[#71717A] resize-none focus:outline-none"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isGenerating || !inputPrompt.trim()}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shrink-0"
            title="Send prompt (Enter)"
            aria-label="Send prompt"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#71717A] px-1">
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1 py-0.5 rounded bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] font-mono">
              Enter
            </kbd>
            <span>to generate</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setKeyInput(apiKey)
              setShowKeyModal(true)
            }}
            className="hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <Key className="w-2.5 h-2.5" />
            <span>{apiKey ? 'API Key Active' : 'Enter Gemini Key'}</span>
          </button>
        </div>
      </div>

      {/* 5. API Key Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1E1E1E] border border-[#383838] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Gemini API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Enter your Google Gemini API key to enable direct live AI model inference. If empty, the built-in Intelligent Vector Design Agent will be used automatically.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] text-[#71717A] uppercase font-semibold">Google AI Key</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#141416] border border-[#383838] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setKeyInput('')
                  setApiKey('')
                  localStorage.removeItem('vectorly_gemini_api_key')
                  setShowKeyModal(false)
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

