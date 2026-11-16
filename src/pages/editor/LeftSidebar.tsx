import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  File,
  Folder,
  Image as ImageIcon,
  Layers as LayersIcon,
  Lock,
  Minus,
  PenTool,
  Plus,
  Search,
  Square,
  Trash2,
  Type,
  Unlock,
  MoveUp,
  MoveDown,
} from 'lucide-react'
import type { DesignNode, NodeType } from '../../types/document'
import { useEditorStore } from '../../store/editorStore'

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'layers' | 'pages'>('layers')
  const [searchLayer, setSearchLayer] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const {
    document,
    activePageId,
    setActivePage,
    addPage,
    deletePage,
    selectedNodeIds,
    selectNode,
    toggleLock,
    toggleVisibility,
    renameNode,
    reorderNode,
    setHoverNodeId,
  } = useEditorStore()

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'rectangle':
        return <Square className="w-3.5 h-3.5 text-blue-400" />
      case 'ellipse':
        return <Circle className="w-3.5 h-3.5 text-emerald-400" />
      case 'line':
        return <Minus className="w-3.5 h-3.5 text-zinc-300" />
      case 'text':
        return <Type className="w-3.5 h-3.5 text-purple-400" />
      case 'frame':
        return <LayersIcon className="w-3.5 h-3.5 text-amber-400" />
      case 'path':
        return <PenTool className="w-3.5 h-3.5 text-rose-400" />
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
      case 'group':
        return <Folder className="w-3.5 h-3.5 text-yellow-400" />
    }
  }

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setRenamingId(id)
    setRenameValue(currentName)
  }

  const handleRenameSubmit = (id: string, e: React.FormEvent) => {
    e.preventDefault()
    if (renameValue.trim()) {
      renameNode(id, renameValue.trim())
    }
    setRenamingId(null)
  }

  // Display layers in reverse z-order (topmost on top of list)
  const allNodes = activePage?.nodes || []
  const reversedNodes = [...allNodes].reverse()
  const filteredNodes = searchLayer
    ? reversedNodes.filter((n) => n.name.toLowerCase().includes(searchLayer.toLowerCase()))
    : reversedNodes

  return (
    <aside className="w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col h-[calc(100vh-48px)] select-none text-zinc-300 text-xs shrink-0 z-20">
      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/40">
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'layers'
              ? 'border-blue-500 text-white bg-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Layers ({allNodes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'pages'
              ? 'border-blue-500 text-white bg-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Pages ({document?.pages.length || 1})
        </button>
      </div>

      {activeTab === 'layers' ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Layer Search Bar */}
          <div className="p-2 border-b border-zinc-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search layers..."
                value={searchLayer}
                onChange={(e) => setSearchLayer(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 pl-7 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Layer Hierarchy List */}
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {filteredNodes.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-[11px]">
                {searchLayer ? 'No matching layers' : 'No layers on this page'}
              </div>
            ) : (
              filteredNodes.map((node) => {
                const isSelected = selectedNodeIds.includes(node.id)
                const isRenaming = renamingId === node.id

                return (
                  <div
                    key={node.id}
                    onClick={(e) => selectNode(node.id, e.shiftKey)}
                    onMouseEnter={() => setHoverNodeId(node.id)}
                    onMouseLeave={() => setHoverNodeId(null)}
                    className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/30 text-white border border-blue-500/50'
                        : 'hover:bg-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="shrink-0">{getNodeIcon(node.type)}</span>

                      {isRenaming ? (
                        <form
                          onSubmit={(e) => handleRenameSubmit(node.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={(e) => handleRenameSubmit(node.id, e)}
                            className="w-full bg-zinc-950 border border-blue-500 text-white text-xs px-1 py-0.5 rounded focus:outline-none"
                            autoFocus
                          />
                        </form>
                      ) : (
                        <span
                          onDoubleClick={(e) => handleStartRename(node.id, node.name, e)}
                          className="truncate text-xs select-none"
                          title="Double click to rename"
                        >
                          {node.name}
                        </span>
                      )}
                    </div>

                    {/* Actions: Reorder up/down, visibility, lock */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderNode(node.id, 'forward')
                        }}
                        className="p-1 hover:text-white text-zinc-400"
                        title="Bring Forward"
                        aria-label="Bring Forward"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          reorderNode(node.id, 'backward')
                        }}
                        className="p-1 hover:text-white text-zinc-400"
                        title="Send Backward"
                        aria-label="Send Backward"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleVisibility(node.id)
                        }}
                        className="p-1 hover:text-white text-zinc-400"
                        title={node.visible ? 'Hide' : 'Show'}
                        aria-label={node.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {node.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-zinc-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLock(node.id)
                        }}
                        className="p-1 hover:text-white text-zinc-400"
                        title={node.locked ? 'Unlock' : 'Lock'}
                        aria-label={node.locked ? 'Unlock layer' : 'Lock layer'}
                      >
                        {node.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        /* Pages Tab */
        <div className="flex-1 flex flex-col p-2 space-y-2">
          <div className="flex justify-between items-center px-1 mb-1">
            <span className="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">Pages</span>
            <button
              type="button"
              onClick={() => addPage()}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              title="Add Page"
              aria-label="Add Page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {document?.pages.map((p) => {
              const isActive = p.id === activePageId
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer ${
                    isActive ? 'bg-zinc-800 text-white font-medium' : 'hover:bg-zinc-850 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <File className="w-3.5 h-3.5" />
                    <span>{p.name}</span>
                  </div>

                  {document.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePage(p.id)
                      }}
                      className="p-1 hover:text-red-400 opacity-60 hover:opacity-100"
                      title="Delete Page"
                      aria-label="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </aside>
  )
}
