import React, { useState, useRef } from 'react'
import {
  Circle,
  Cloud,
  CloudCheck,
  Download,
  Frame,
  Hand,
  History,
  Image as ImageIcon,
  MessageSquare,
  Minus,
  MousePointer2,
  PenTool,
  Plus,
  Redo2,
  Share2,
  Square,
  Sparkles,
  Type,
  Undo2,
  ChevronDown,
} from 'lucide-react'
import type { EditorTool } from '../../types/document'
import { createImage } from '../../editor/model/factory'
import { useEditorStore } from '../../store/editorStore'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { Tooltip } from '../../components/ui/Tooltip'
import { FigmaLogo } from '../../components/ui/FigmaLogo'

export interface TopToolbarProps {
  onOpenVersionHistory: () => void
  onExport: () => void
  onOpenShare: () => void
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onOpenVersionHistory,
  onExport,
  onOpenShare,
}) => {
  const {
    document,
    activeTool,
    setActiveTool,
    viewport,
    zoomAt,
    resetZoom,
    fitToScreen,
    canUndo,
    canRedo,
    undo,
    redo,
    saveStatus,
    addNode,
  } = useEditorStore()

  const { closeDocument, isGeminiChatOpen, toggleGeminiChat } = useUIStore()
  const { user } = useAuthStore()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(document?.name || 'Untitled Design')
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (document && titleInput.trim()) {
      useEditorStore.setState((state) => {
        if (!state.document) return state
        return {
          document: { ...state.document, name: titleInput.trim() },
          saveStatus: 'unsaved',
        }
      })
      useEditorStore.getState().saveDocumentNow()
    }
    setIsEditingTitle(false)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const aspect = img.naturalWidth / (img.naturalHeight || 1)
        const width = Math.min(360, Math.max(100, img.naturalWidth))
        const height = width / aspect
        const imgNode = createImage({
          x: 200,
          y: 200,
          width: Math.round(width),
          height: Math.round(height),
          src,
          name: file.name.replace(/\.[^/.]+$/, ''),
        })
        addNode(imgNode)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const zoomPercent = Math.round(viewport.zoom * 100)

  const primaryTools: {
    id: EditorTool
    label: string
    shortcut: string
    icon: React.ReactNode
  }[] = [
    { id: 'select', label: 'Move / Selection', shortcut: 'V', icon: <MousePointer2 className="w-4 h-4" /> },
    { id: 'frame', label: 'Frame', shortcut: 'F', icon: <Frame className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
    { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle className="w-4 h-4" /> },
    { id: 'line', label: 'Line', shortcut: 'L', icon: <Minus className="w-4 h-4" /> },
    { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'text', label: 'Text', shortcut: 'T', icon: <Type className="w-4 h-4" /> },
    { id: 'hand', label: 'Hand / Pan', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
  ]

  return (
    <header className="h-13 bg-[#2C2C2C] border-b border-[#383838] flex items-center justify-between px-4 text-[#B3B3B3] select-none z-30 shrink-0 shadow-sm">
      {/* Left: Application Logo, Back Button & Editable Document Title */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={closeDocument}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#383838] text-white transition-colors focus:outline-none"
          title="Back to Files Dashboard"
          aria-label="Back to Files Dashboard"
        >
          <FigmaLogo size={22} showWordmark={false} />
          <ChevronDown className="w-3.5 h-3.5 text-[#7E7E7E]" />
        </button>

        <div className="w-[1px] h-5 bg-[#383838] hidden sm:block" />

        <div className="flex items-center gap-2.5">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="bg-[#1E1E1E] text-sm text-white px-2.5 py-1 rounded border border-[#0D99FF] focus:outline-none font-semibold"
                autoFocus
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleInput(document?.name || 'Untitled Design')
                setIsEditingTitle(true)
              }}
              className="text-sm font-bold text-white hover:bg-[#383838] px-2.5 py-1 rounded-lg transition-colors truncate max-w-[140px] sm:max-w-xs flex items-center gap-1.5"
              title="Click to rename document"
            >
              <span>{document?.name || 'Untitled Design'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E7E7E]" />
            </button>
          )}

          {/* Cloud Save status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#7E7E7E] font-medium">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{saveStatus}</span>
          </div>
        </div>
      </div>

      {/* Center: Figma-style Tool Palette */}
      <div className="flex items-center gap-1 bg-[#1E1E1E] border border-[#383838] p-1 rounded-xl shadow-inner">
        {/* Undo / Redo */}
        <Tooltip content="Undo" shortcut="Ctrl+Z">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-[#383838] text-[#B3B3B3] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip content="Redo" shortcut="Ctrl+Y">
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-[#383838] text-[#B3B3B3] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <div className="w-[1px] h-5 bg-[#383838] mx-1" />

        {/* Primary tools */}
        {primaryTools.map((t) => {
          const isActive = activeTool === t.id
          return (
            <Tooltip key={t.id} content={t.label} shortcut={t.shortcut}>
              <button
                type="button"
                onClick={() => setActiveTool(t.id)}
                className={`p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#0D99FF] text-white shadow-sm font-semibold'
                    : 'text-[#B3B3B3] hover:text-white hover:bg-[#383838]'
                }`}
                aria-label={t.label}
              >
                {t.icon}
              </button>
            </Tooltip>
          )
        })}

        {/* Insert Image tool */}
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageFileChange}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
        />
        <Tooltip content="Insert Image" shortcut="Img">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 rounded-lg text-[#B3B3B3] hover:text-white hover:bg-[#383838] transition-colors"
            aria-label="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Comments placeholder */}
        <Tooltip content="Comments (C)" shortcut="C">
          <button
            type="button"
            className="p-2 rounded-lg text-[#7E7E7E] hover:text-white hover:bg-[#383838] transition-colors"
            aria-label="Comments"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Right: Collaborators, Share, Export, Zoom & Profile */}
      <div className="flex items-center gap-3">
        {/* Collaborators overlapping avatars */}
        <div className="hidden md:flex items-center -space-x-1.5 mr-1">
          <div className="relative group cursor-pointer" title="Sarah Chen (Online)">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80"
              alt="Sarah"
              className="w-7 h-7 rounded-full object-cover border-2 border-[#2C2C2C] ring-1 ring-emerald-500"
            />
          </div>
          <div className="relative group cursor-pointer" title="David Kim (Online)">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80"
              alt="David"
              className="w-7 h-7 rounded-full object-cover border-2 border-[#2C2C2C] ring-1 ring-emerald-500"
            />
          </div>
          <div className="relative group cursor-pointer" title={user?.name || 'You (Active)'}>
            <img
              src={user?.avatar || '/avatar.jpg'}
              alt="You"
              className="w-7 h-7 rounded-full object-cover border-2 border-[#2C2C2C] ring-1 ring-[#0D99FF]"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = '/avatar.jpg'
              }}
            />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-[#2C2C2C]" />
          </div>
        </div>

        {/* Gemini AI Copilot Button */}
        <button
          type="button"
          onClick={toggleGeminiChat}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-sm transition-all active:scale-95 ${
            isGeminiChatOpen
              ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30 shadow-md ring-2 ring-purple-500/50'
              : 'bg-gradient-to-r from-purple-900/40 via-[#2C2C2C] to-blue-900/40 hover:from-purple-800/60 hover:to-blue-800/60 border-purple-500/40 text-purple-200 hover:text-white'
          }`}
          title="Open Gemini AI Design Copilot (Ctrl + J)"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">Gemini AI</span>
          <span className="text-[10px] bg-purple-950/80 px-1 py-0.5 rounded border border-purple-500/30 text-purple-300 font-mono hidden md:inline">
            Ctrl+J
          </span>
        </button>

        {/* Share Button (Figma signature primary action) */}
        <button
          type="button"
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-xs font-bold shadow-sm transition-colors active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#383838] hover:bg-[#444444] text-white text-xs font-semibold border border-[#444444] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Version History Button */}
        <Tooltip content="Snapshots & Version History">
          <button
            type="button"
            onClick={onOpenVersionHistory}
            className="p-2 rounded-lg hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
            aria-label="Version history"
          >
            <History className="w-4 h-4" />
          </button>
        </Tooltip>

        {/* Zoom Controls */}
        <div className="relative">
          <div className="flex items-center bg-[#1E1E1E] border border-[#383838] rounded-lg text-xs px-2 py-1">
            <button
              type="button"
              onClick={() => zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0.8)}
              className="p-1 text-[#7E7E7E] hover:text-white transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
              className="px-2 font-mono text-xs text-white hover:text-[#0D99FF] flex items-center gap-1 transition-colors font-semibold"
            >
              <span>{zoomPercent}%</span>
              <ChevronDown className="w-3 h-3 text-[#7E7E7E]" />
            </button>

            <button
              type="button"
              onClick={() => zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 1.25)}
              className="p-1 text-[#7E7E7E] hover:text-white transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {zoomDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setZoomDropdownOpen(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-[#2C2C2C] border border-[#383838] rounded-lg shadow-2xl z-50 py-1 text-xs text-[#B3B3B3]">
                <button
                  type="button"
                  onClick={() => {
                    resetZoom()
                    setZoomDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex justify-between"
                >
                  <span>Zoom to 100%</span>
                  <span className="text-[10px] text-[#7E7E7E]">Shift+0</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fitToScreen(window.innerWidth, window.innerHeight)
                    setZoomDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex justify-between"
                >
                  <span>Zoom to fit</span>
                  <span className="text-[10px] text-[#7E7E7E]">Shift+1</span>
                </button>
                <div className="border-t border-[#383838] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    useEditorStore.setState((s) => ({ viewport: { ...s.viewport, zoom: 0.5 } }))
                    setZoomDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => {
                    useEditorStore.setState((s) => ({ viewport: { ...s.viewport, zoom: 2.0 } }))
                    setZoomDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white"
                >
                  200%
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Profile Avatar */}
        <button
          type="button"
          onClick={closeDocument}
          className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#0D99FF] transition-all focus:outline-none ml-1"
          title={`${user?.name || 'Askari Hasni'} (Click to view dashboard)`}
          aria-label="User Profile"
        >
          <img
            src={user?.avatar || '/avatar.jpg'}
            alt={user?.name || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-[#444444]"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = '/avatar.jpg'
            }}
          />
        </button>
      </div>
    </header>
  )
}
