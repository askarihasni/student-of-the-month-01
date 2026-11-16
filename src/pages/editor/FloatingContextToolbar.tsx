import React, { useState } from 'react'
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
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false)

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

      {/* Quick Color Swatch with on-canvas Palette popover (Fill / Font Color) */}
      {'fill' in primaryNode && (
        <div className="relative flex items-center px-1.5 border-r border-[#3E3E3E]">
          <button
            type="button"
            onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
            className="w-5 h-5 rounded-full border border-white/40 shadow-inner hover:scale-110 transition-all flex items-center justify-center overflow-hidden focus:outline-none"
            style={{
              backgroundColor:
                primaryNode.fill && primaryNode.fill !== 'transparent'
                  ? primaryNode.fill
                  : 'transparent',
              backgroundImage:
                !primaryNode.fill || primaryNode.fill === 'transparent'
                  ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 4px 4px'
                  : undefined,
            }}
            title="Open Quick Color Palette"
            aria-label="Color palette"
          />

          {isColorMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsColorMenuOpen(false)}
              />
              <div
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 p-2.5 bg-[#1E1E1E] border border-[#383838] rounded-xl shadow-2xl w-56 text-white animate-in fade-in slide-in-from-bottom-2 duration-100"
                style={{ boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)' }}
              >
                <div className="flex items-center justify-between text-[10px] text-[#8C8C8C] uppercase font-semibold mb-2">
                  <span>Color Palette</span>
                  <span className="font-mono text-white text-[9px] bg-[#2C2C2C] px-1 py-0.5 rounded">
                    {primaryNode.fill || 'TRANSPARENT'}
                  </span>
                </div>

                {/* 14 quick swatches */}
                <div className="grid grid-cols-7 gap-1.5 mb-2.5">
                  {[
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Light Gray', hex: '#CBD5E1' },
                    { name: 'Slate Gray', hex: '#64748B' },
                    { name: 'Dark Slate', hex: '#1E293B' },
                    { name: 'Pure Black', hex: '#000000' },
                    { name: 'Figma Blue', hex: '#0D99FF' },
                    { name: 'Sky Cyan', hex: '#06B6D4' },
                    { name: 'Emerald', hex: '#10B981' },
                    { name: 'Lime', hex: '#84CC16' },
                    { name: 'Amber Gold', hex: '#F59E0B' },
                    { name: 'Coral Red', hex: '#EF4444' },
                    { name: 'Purple', hex: '#A855F7' },
                    { name: 'Pink', hex: '#EC4899' },
                    { name: 'Transparent', hex: 'transparent' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => {
                        selectedNodes.forEach((n) => {
                          if ('fill' in n) updateNode(n.id, { fill: swatch.hex })
                        })
                        setIsColorMenuOpen(false)
                      }}
                      className="w-full aspect-square rounded-[3px] border border-[#444] hover:border-white hover:scale-110 transition-all relative overflow-hidden"
                      style={{
                        backgroundColor:
                          swatch.hex === 'transparent' ? 'transparent' : swatch.hex,
                        backgroundImage:
                          swatch.hex === 'transparent'
                            ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 50% / 4px 4px'
                            : undefined,
                      }}
                      title={`${swatch.name} (${swatch.hex})`}
                    />
                  ))}
                </div>

                {/* Custom Native Color Wheel Picker */}
                <div className="flex items-center justify-between pt-1.5 border-t border-[#333] text-[10px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#A0A0A0] hover:text-white">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/40 bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-400" />
                    <span>Color Wheel</span>
                    <input
                      type="color"
                      value={
                        primaryNode.fill && primaryNode.fill.startsWith('#')
                          ? primaryNode.fill
                          : '#FFFFFF'
                      }
                      onChange={(e) => {
                        selectedNodes.forEach((n) => {
                          if ('fill' in n) updateNode(n.id, { fill: e.target.value })
                        })
                      }}
                      className="opacity-0 absolute w-0 h-0 pointer-events-none"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      selectedNodes.forEach((n) => {
                        if ('fill' in n) updateNode(n.id, { fill: 'transparent' })
                      })
                      setIsColorMenuOpen(false)
                    }}
                    className="text-[#8C8C8C] hover:text-[#FF7262] transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
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

