import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  File,
  Folder,
  Frame,
  Image as ImageIcon,
  Lock,
  Minus,
  MoveDown,
  MoveUp,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Plus,
  Search,
  Square,
  Trash2,
  Type,
  Unlock,
  X,
} from 'lucide-react'
import type { DesignNode, NodeType } from '../../types/document'
import { useEditorStore } from '../../store/editorStore'

export const LeftSidebar: React.FC = () => {
  const [pagesCollapsed, setPagesCollapsed] = useState(false)
  const [searchLayer, setSearchLayer] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        return <Square className="w-4 h-4 text-[#1ABCFE]" />
      case 'ellipse':
        return <Circle className="w-4 h-4 text-[#0ACF83]" />
      case 'line':
        return <Minus className="w-4 h-4 text-[#B3B3B3]" />
      case 'text':
        return <Type className="w-4 h-4 text-[#A259FF]" />
      case 'frame':
        return <Frame className="w-4 h-4 text-[#FF7262]" />
      case 'path':
        return <PenTool className="w-4 h-4 text-[#F24E1E]" />
      case 'image':
        return <ImageIcon className="w-4 h-4 text-[#1ABCFE]" />
      case 'group':
        return <Folder className="w-4 h-4 text-[#F59E0B]" />
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
  const rawNodes = activePage?.nodes
  const allNodes: DesignNode[] = Array.isArray(rawNodes)
    ? rawNodes
    : rawNodes && typeof rawNodes === 'object'
    ? Object.values(rawNodes)
    : []
  const reversedNodes = [...allNodes].reverse()
  const filteredNodes = searchLayer
    ? reversedNodes.filter((n) => n.name.toLowerCase().includes(searchLayer.toLowerCase()))
    : reversedNodes

  if (isCollapsed) {
    return (
      <aside className="w-9 bg-[#2C2C2C] border-r border-[#383838] flex flex-col items-center py-2 text-[#7E7E7E] shrink-0 h-[calc(100vh-48px)] select-none z-20">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded hover:bg-[#383838] hover:text-white transition-colors"
          title="Open Layers panel"
          aria-label="Open Layers panel"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-68 bg-[#2C2C2C] border-r border-[#383838] flex flex-col h-[calc(100vh-48px)] select-none text-[#B3B3B3] text-xs shrink-0 z-20 transition-all duration-150">
      {/* Pages Section */}
      <div className="border-b border-[#383838]">
        <div className="flex items-center justify-between px-3 py-2 text-[#7E7E7E] hover:text-white transition-colors">
          <button
            type="button"
            onClick={() => setPagesCollapsed(!pagesCollapsed)}
            className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-inherit focus:outline-none"
          >
            {pagesCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Pages</span>
            <span className="text-[10px] text-[#7E7E7E] font-normal">({document?.pages.length || 1})</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => addPage()}
              className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
              title="Add new page"
              aria-label="Add new page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
              title="Collapse panel"
              aria-label="Collapse panel"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pages List */}
        {!pagesCollapsed && (
          <div className="px-1.5 pb-2 space-y-0.5 max-h-32 overflow-y-auto">
            {document?.pages.map((p) => {
              const isActive = p.id === activePageId
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#0D99FF] text-white font-medium shadow-sm'
                      : 'hover:bg-[#383838] text-[#B3B3B3] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#7E7E7E]'}`} />
                    <span className="truncate">{p.name}</span>
                  </div>

                  {document.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePage(p.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-300 transition-opacity"
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
        )}
      </div>

      {/* Layers Header & Search */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 pt-2 pb-1.5 flex items-center justify-between">
          <span className="font-semibold text-[11px] uppercase tracking-wider text-[#7E7E7E]">
            Layers
          </span>
          <span className="text-[10px] text-[#7E7E7E] font-mono">
            {allNodes.length} layer{allNodes.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search input */}
        <div className="px-2 pb-2 border-b border-[#383838]">
          <div className="relative">
            <Search className="w-3 h-3 text-[#7E7E7E] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search layers..."
              value={searchLayer}
              onChange={(e) => setSearchLayer(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#383838] rounded px-2 pl-7 pr-6 py-1 text-[11px] text-white placeholder-[#7E7E7E] focus:outline-none focus:border-[#0D99FF]"
            />
            {searchLayer && (
              <button
                type="button"
                onClick={() => setSearchLayer('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7E7E7E] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Layers Tree */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-12 text-[#7E7E7E] text-[11px]">
              {searchLayer ? 'No layers match search' : 'No layers on this page'}
            </div>
          ) : (
            filteredNodes.map((node) => {
              const isSelected = selectedNodeIds.includes(node.id)
              const isRenaming = renamingId === node.id

              // Determine swatch color
              let swatchColor: string | null = null
              if ('fill' in node && node.fill && node.fill !== 'transparent') {
                swatchColor = node.fill
              } else if ('stroke' in node && node.stroke) {
                swatchColor = node.stroke
              }

              return (
                <div
                  key={node.id}
                  onClick={(e) => selectNode(node.id, e.shiftKey)}
                  onMouseEnter={() => setHoverNodeId(node.id)}
                  onMouseLeave={() => setHoverNodeId(null)}
                  className={`group flex items-center justify-between px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#0D99FF] text-white font-medium'
                      : 'hover:bg-[#383838] text-[#B3B3B3] hover:text-white'
                  }`}
                  style={{ height: '32px' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="shrink-0">{getNodeIcon(node.type)}</span>

                    {/* Mini color swatch */}
                    {swatchColor && (
                      <span
                        className="w-3 h-3 rounded shrink-0 border border-black/20"
                        style={{ backgroundColor: swatchColor }}
                      />
                    )}

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
                          className="w-full bg-[#1E1E1E] border border-white text-white text-xs px-1.5 py-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span
                        onDoubleClick={(e) => handleStartRename(node.id, node.name, e)}
                        className="truncate text-xs select-none font-medium"
                        title="Double-click to rename"
                      >
                        {node.name}
                      </span>
                    )}
                  </div>

                  {/* Actions: Reorder up/down, visibility, lock */}
                  <div
                    className={`flex items-center gap-0.5 ${
                      isSelected || node.locked || !node.visible
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        reorderNode(node.id, 'forward')
                      }}
                      className={`p-1 hover:text-white ${isSelected ? 'text-white' : 'text-[#7E7E7E]'}`}
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
                      className={`p-1 hover:text-white ${isSelected ? 'text-white' : 'text-[#7E7E7E]'}`}
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
                      className={`p-1 hover:text-white ${isSelected ? 'text-white' : 'text-[#7E7E7E]'}`}
                      title={node.visible ? 'Hide layer' : 'Show layer'}
                      aria-label={node.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {node.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLock(node.id)
                      }}
                      className={`p-1 hover:text-white ${isSelected ? 'text-white' : 'text-[#7E7E7E]'}`}
                      title={node.locked ? 'Unlock layer' : 'Lock layer'}
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
    </aside>
  )
}
