import React from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Layers,
  Maximize,
  RotateCw,
  Sliders,
  Type,
  Unlink,
} from 'lucide-react'
import type { DesignNode, RectangleNode, TextNode } from '../../types/document'
import { useEditorStore } from '../../store/editorStore'
import { ColorPicker } from '../../components/ui/ColorPicker'
import { NodeUtils } from '../../editor/model/nodeUtils'

export const RightSidebar: React.FC = () => {
  const {
    document,
    activePageId,
    selectedNodeIds,
    updateNode,
    updateNodes,
  } = useEditorStore()

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]

  const selectedNodes =
    activePage?.nodes.filter((n) => selectedNodeIds.includes(n.id)) || []

  // If no object is selected, show page settings
  if (selectedNodes.length === 0) {
    return (
      <aside className="w-64 bg-zinc-900 border-l border-zinc-800 p-4 select-none text-zinc-300 text-xs shrink-0 h-[calc(100vh-48px)] overflow-y-auto z-20">
        <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
          Page Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Page Name</label>
            <input
              type="text"
              value={activePage?.name || 'Page'}
              readOnly
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200"
            />
          </div>

          <div>
            <ColorPicker
              label="Canvas Background"
              color={activePage?.backgroundColor || '#1E1E1E'}
              onChange={(color) => {
                if (document && activePage) {
                  const pages = document.pages.map((p) =>
                    p.id === activePage.id ? { ...p, backgroundColor: color } : p
                  )
                  useEditorStore.setState({ document: { ...document, pages }, saveStatus: 'unsaved' })
                  useEditorStore.getState().saveDocumentNow()
                }
              }}
            />
          </div>

          <div className="pt-4 border-t border-zinc-800/80">
            <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">Page Statistics</h4>
            <div className="space-y-1.5 text-zinc-400 text-[11px]">
              <div className="flex justify-between">
                <span>Total Layers:</span>
                <span className="text-zinc-200">{activePage?.nodes.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Page ID:</span>
                <span className="text-zinc-500 font-mono text-[10px]">{activePage?.id}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  const primaryNode = selectedNodes[0]

  // Alignment helpers for multi or single selection
  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedNodes.length === 0) return
    const aabb = NodeUtils.getNodesAABB(selectedNodes)

    for (const node of selectedNodes) {
      if ('x' in node && 'y' in node) {
        let newX = node.x
        let newY = node.y

        if (alignment === 'left') newX = aabb.x
        if (alignment === 'center') newX = aabb.x + (aabb.width - node.width) / 2
        if (alignment === 'right') newX = aabb.x + aabb.width - node.width
        if (alignment === 'top') newY = aabb.y
        if (alignment === 'middle') newY = aabb.y + (aabb.height - node.height) / 2
        if (alignment === 'bottom') newY = aabb.y + aabb.height - node.height

        updateNode(node.id, { x: Math.round(newX), y: Math.round(newY) })
      }
    }
  }

  return (
    <aside className="w-64 bg-zinc-900 border-l border-zinc-800 p-4 select-none text-zinc-300 text-xs shrink-0 h-[calc(100vh-48px)] overflow-y-auto z-20 space-y-5">
      {/* Selection Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="font-semibold text-white text-xs truncate max-w-[150px]">
            {selectedNodes.length === 1 ? primaryNode.name : `${selectedNodes.length} Layers Selected`}
          </h3>
          <span className="text-[10px] text-zinc-500 capitalize">{primaryNode.type}</span>
        </div>
      </div>

      {/* Alignment Bar */}
      <div>
        <div className="text-[11px] font-medium text-zinc-400 mb-2">Align</div>
        <div className="grid grid-cols-6 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-center">
          <button
            type="button"
            onClick={() => handleAlign('left')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded"
            title="Align Left"
            aria-label="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('center')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded"
            title="Align Center Horizontal"
            aria-label="Align Center Horizontal"
          >
            <AlignCenter className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('right')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded"
            title="Align Right"
            aria-label="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            type="button"
            onClick={() => handleAlign('top')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded text-[10px] font-bold"
            title="Align Top"
            aria-label="Align Top"
          >
            ⊤
          </button>
          <button
            type="button"
            onClick={() => handleAlign('middle')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded text-[10px] font-bold"
            title="Align Middle Vertical"
            aria-label="Align Middle Vertical"
          >
            ⊣
          </button>
          <button
            type="button"
            onClick={() => handleAlign('bottom')}
            className="p-1.5 hover:bg-zinc-800 hover:text-white rounded text-[10px] font-bold"
            title="Align Bottom"
            aria-label="Align Bottom"
          >
            ⊥
          </button>
        </div>
      </div>

      {/* Geometry / Dimensions */}
      {'x' in primaryNode && (
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-zinc-400">Position & Dimensions</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">X</span>
              <input
                type="number"
                value={Math.round(primaryNode.x)}
                onChange={(e) => updateNode(primaryNode.id, { x: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">Y</span>
              <input
                type="number"
                value={Math.round(primaryNode.y)}
                onChange={(e) => updateNode(primaryNode.id, { y: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">W</span>
              <input
                type="number"
                value={Math.round(primaryNode.width)}
                onChange={(e) => updateNode(primaryNode.id, { width: Math.max(1, Number(e.target.value)) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">H</span>
              <input
                type="number"
                value={Math.round(primaryNode.height)}
                onChange={(e) => updateNode(primaryNode.id, { height: Math.max(1, Number(e.target.value)) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <RotateCw className="w-2.5 h-2.5" /> Rotation
              </span>
              <input
                type="number"
                value={Math.round(primaryNode.rotation)}
                onChange={(e) => updateNode(primaryNode.id, { rotation: Number(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {'cornerRadius' in primaryNode && (
              <div>
                <span className="text-[10px] text-zinc-500">Radius</span>
                <input
                  type="number"
                  value={primaryNode.cornerRadius ?? 0}
                  onChange={(e) =>
                    updateNode(primaryNode.id, { cornerRadius: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography settings for Text node */}
      {primaryNode.type === 'text' && (
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="text-[11px] font-medium text-zinc-400">Typography</div>
          <div>
            <span className="text-[10px] text-zinc-500">Content</span>
            <textarea
              value={primaryNode.text}
              onChange={(e) => updateNode(primaryNode.id, { text: e.target.value })}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zinc-500">Font Size</span>
              <input
                type="number"
                value={primaryNode.fontSize}
                onChange={(e) => updateNode(primaryNode.id, { fontSize: Math.max(8, Number(e.target.value)) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500">Weight</span>
              <select
                value={primaryNode.fontWeight}
                onChange={(e) => updateNode(primaryNode.id, { fontWeight: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="normal">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Fill Color */}
      {'fill' in primaryNode && (
        <div className="pt-2 border-t border-zinc-800">
          <ColorPicker
            label="Fill"
            color={primaryNode.fill || 'transparent'}
            onChange={(color) => updateNode(primaryNode.id, { fill: color })}
          />
        </div>
      )}

      {/* Stroke Color & Width */}
      {'stroke' in primaryNode && (
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <ColorPicker
            label="Stroke"
            color={primaryNode.stroke || 'transparent'}
            onChange={(color) => updateNode(primaryNode.id, { stroke: color })}
          />

          <div>
            <span className="text-[10px] text-zinc-500">Stroke Width</span>
            <input
              type="number"
              min="0"
              max="100"
              value={primaryNode.strokeWidth ?? 1}
              onChange={(e) =>
                updateNode(primaryNode.id, { strokeWidth: Math.max(0, Number(e.target.value)) })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Opacity */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-zinc-400">Opacity</span>
          <span className="text-[11px] font-mono text-zinc-300">
            {Math.round((primaryNode.opacity ?? 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round((primaryNode.opacity ?? 1) * 100)}
          onChange={(e) => updateNode(primaryNode.id, { opacity: Number(e.target.value) / 100 })}
          className="w-full accent-blue-500 cursor-pointer"
        />
      </div>

      {/* Shadow Effect */}
      {'shadow' in primaryNode && (
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">Drop Shadow</span>
            <input
              type="checkbox"
              checked={!!primaryNode.shadow}
              onChange={(e) => {
                if (e.target.checked) {
                  updateNode(primaryNode.id, {
                    shadow: {
                      color: 'rgba(0, 0, 0, 0.35)',
                      blur: 16,
                      offsetX: 0,
                      offsetY: 8,
                    },
                  })
                } else {
                  updateNode(primaryNode.id, { shadow: undefined })
                }
              }}
              className="accent-blue-500 rounded"
            />
          </div>

          {primaryNode.shadow && (
            <div className="space-y-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <ColorPicker
                label="Shadow Color"
                color={primaryNode.shadow.color}
                onChange={(color) =>
                  updateNode(primaryNode.id, {
                    shadow: { ...primaryNode.shadow!, color },
                  })
                }
              />

              <div className="grid grid-cols-3 gap-1">
                <div>
                  <span className="text-[10px] text-zinc-500">Blur</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.blur}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, blur: Math.max(0, Number(e.target.value)) },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500">X</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.offsetX}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, offsetX: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500">Y</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.offsetY}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, offsetY: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
