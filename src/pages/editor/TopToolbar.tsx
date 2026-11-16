import React, { useState } from 'react'
import {
  ChevronDown,
  Circle,
  Download,
  Eye,
  Hand,
  History,
  Layers,
  Minus,
  MousePointer,
  PenTool,
  Plus,
  Redo2,
  Square,
  Type,
  Undo2,
  Maximize2,
  MinusCircle,
  Image as ImageIcon,
} from 'lucide-react'
import type { EditorTool } from '../../types/document'
import { createImage } from '../../editor/model/factory'
import { useEditorStore } from '../../store/editorStore'
import { useUIStore } from '../../store/uiStore'
import { Tooltip } from '../../components/ui/Tooltip'
import { Button } from '../../components/ui/Button'

export const TopToolbar: React.FC<{
  onOpenVersionHistory: () => void
  onExport: () => void
}> = ({ onOpenVersionHistory, onExport }) => {
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

  const imageInputRef = React.useRef<HTMLInputElement>(null)

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

  const { closeDocument } = useUIStore()

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState(document?.name || 'Untitled')

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

  const zoomPercent = Math.round(viewport.zoom * 100)

  const tools: { id: EditorTool; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'select', label: 'Move / Select', shortcut: 'V', icon: <MousePointer className="w-4 h-4" /> },
    { id: 'frame', label: 'Frame', shortcut: 'F', icon: <Layers className="w-4 h-4" /> },
    { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-4 h-4" /> },
    { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: <Circle className="w-4 h-4" /> },
    { id: 'line', label: 'Line', shortcut: 'L', icon: <Minus className="w-4 h-4" /> },
    { id: 'pen', label: 'Pen Tool', shortcut: 'P', icon: <PenTool className="w-4 h-4" /> },
    { id: 'text', label: 'Text', shortcut: 'T', icon: <Type className="w-4 h-4" /> },
    { id: 'hand', label: 'Hand / Pan', shortcut: 'H', icon: <Hand className="w-4 h-4" /> },
  ]

  return (
    <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 text-zinc-200 select-none z-30">
      {/* Left: Back button & Document Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={closeDocument}
          className="w-7 h-7 rounded-md bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow transition-colors"
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="bg-zinc-800 text-xs text-white px-2 py-0.5 rounded border border-blue-500 focus:outline-none"
                autoFocus
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTitleInput(document?.name || 'Untitled')
                setIsEditingTitle(true)
              }}
              className="text-xs font-semibold text-zinc-100 hover:bg-zinc-800 px-2 py-1 rounded transition-colors truncate max-w-[160px] sm:max-w-xs"
              title="Click to rename"
            >
              {document?.name || 'Untitled Design'}
            </button>
          )}

          {/* Save Status Indicator */}
          <span className="text-[11px] flex items-center gap-1.5 px-2 py-0.5 rounded text-zinc-400">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === 'saved'
                  ? 'bg-emerald-400'
                  : saveStatus === 'saving'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="capitalize">{saveStatus}</span>
          </span>
        </div>
      </div>

      {/* Center: Tools Palette & Undo/Redo */}
      <div className="flex items-center gap-1 bg-zinc-950/70 border border-zinc-800 p-0.5 rounded-lg">
        {/* Undo / Redo */}
        <Tooltip content="Undo" shortcut="Ctrl+Z">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
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
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <div className="w-[1px] h-4 bg-zinc-800 mx-1" />

        {/* Tools list */}
        {tools.map((t) => {
          const isActive = activeTool === t.id
          return (
            <Tooltip key={t.id} content={t.label} shortcut={t.shortcut}>
              <button
                type="button"
                onClick={() => setActiveTool(t.id)}
                className={`p-1.5 rounded transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                aria-label={t.label}
              >
                {t.icon}
              </button>
            </Tooltip>
          )
        })}

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageFileChange}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
        />

        <Tooltip content="Insert Image">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Right: Zoom controls, Version History, Export */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 0.8)}
            className="p-1 text-zinc-400 hover:text-white"
            title="Zoom Out (Ctrl -)"
            aria-label="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="px-1.5 font-mono text-[11px] text-zinc-200 hover:text-white"
            title="Reset Zoom to 100%"
          >
            {zoomPercent}%
          </button>

          <button
            type="button"
            onClick={() => zoomAt({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 1.25)}
            className="p-1 text-zinc-400 hover:text-white"
            title="Zoom In (Ctrl +)"
            aria-label="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <Tooltip content="Version Snapshots">
          <Button variant="ghost" size="sm" icon={<History className="w-3.5 h-3.5" />} onClick={onOpenVersionHistory}>
            History
          </Button>
        </Tooltip>

        <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={onExport}>
          Export
        </Button>
      </div>
    </header>
  )
}
