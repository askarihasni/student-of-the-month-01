import React from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  FolderPlus,
  MoveDown,
  MoveUp,
  Trash2,
  X,
} from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'
import { NodeUtils } from '../../editor/model/nodeUtils'
import type { DesignNode } from '../../types/document'

export const FloatingContextToolbar: React.FC = () => {
  const {
    document,
    activePageId,
    selectedNodeIds,
    clearSelection,
    duplicateSelected,
    deleteSelected,
    reorderNode,
    groupSelected,
    updateNode,
    alignSelected,
  } = useEditorStore()

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]
  const rawNodes = activePage?.nodes
  const pageNodes: DesignNode[] = Array.isArray(rawNodes)
    ? (rawNodes as DesignNode[])
    : rawNodes && typeof rawNodes === 'object'
    ? (Object.values(rawNodes) as DesignNode[])
    : []
  const selectedNodes =
    pageNodes.filter((n) => selectedNodeIds.includes(n.id)) || []

  if (selectedNodes.length === 0) return null

  const primaryNode = selectedNodes[0]
  const aabb = NodeUtils.getNodesAABB(selectedNodes)

  const handleAlign = (type: 'left' | 'center' | 'right') => {
    alignSelected(type)
  }

  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C2C2C]/95 border border-[#383838] shadow-2xl backdrop-blur-md text-white select-none text-xs transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)' }}
    >
      {/* Selection info chip */}
      <div className="flex items-center gap-2 pr-2 border-r border-[#3E3E3E]">
        <span className="font-semibold text-white truncate max-w-[120px]">
          {selectedNodes.length === 1 ? primaryNode.name : `${selectedNodes.length} objects`}
        </span>
        <span className="text-[10px] text-[#A1A1AA] font-mono">
          {Math.round(aabb.width)} × {Math.round(aabb.height)}
        </span>
      </div>

      {/* Alignment pills */}
      <div className="flex items-center gap-0.5 px-1 border-r border-[#3E3E3E]">
        <button
          type="button"
          onClick={() => handleAlign('left')}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Align Left"
          aria-label="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleAlign('center')}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Align Center"
          aria-label="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleAlign('right')}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Align Right"
          aria-label="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Color Swatch (Fill / Font Color) */}
      {'fill' in primaryNode && (
        <div className="flex items-center gap-1.5 px-1.5 border-r border-[#3E3E3E]" title="Quick Color (Fill / Font Color)">
          <label className="relative flex items-center justify-center cursor-pointer group" title="Change Color">
            <span
              className="w-4 h-4 rounded-full border border-white/30 shadow-inner group-hover:scale-110 transition-transform inline-block"
              style={{
                backgroundColor:
                  primaryNode.fill && primaryNode.fill !== 'transparent'
                    ? primaryNode.fill
                    : '#FFFFFF',
              }}
            />
            <input
              type="color"
              value={
                primaryNode.fill && primaryNode.fill.startsWith('#')
                  ? primaryNode.fill
                  : '#FFFFFF'
              }
              onChange={(e) => updateNode(primaryNode.id, { fill: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              title="Pick color"
            />
          </label>
        </div>
      )}

      {/* Layer ordering & actions */}
      <div className="flex items-center gap-0.5 px-1 border-r border-[#3E3E3E]">
        <button
          type="button"
          onClick={() => selectedNodes.forEach((n) => reorderNode(n.id, 'forward'))}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Bring Forward"
          aria-label="Bring Forward"
        >
          <MoveUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => selectedNodes.forEach((n) => reorderNode(n.id, 'backward'))}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Send Backward"
          aria-label="Send Backward"
        >
          <MoveDown className="w-3.5 h-3.5" />
        </button>
        {selectedNodes.length >= 2 && (
          <button
            type="button"
            onClick={groupSelected}
            className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
            title="Group Objects (Ctrl+G)"
            aria-label="Group Objects"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Duplicate & Delete */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={duplicateSelected}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#B3B3B3] hover:text-white transition-colors"
          title="Duplicate (Ctrl+D)"
          aria-label="Duplicate"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          className="p-1.5 rounded-md hover:bg-red-950/60 text-red-400 hover:text-red-300 transition-colors"
          title="Delete (Backspace / Del)"
          aria-label="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className="p-1.5 rounded-md hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors ml-1"
          title="Deselect (Esc)"
          aria-label="Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

