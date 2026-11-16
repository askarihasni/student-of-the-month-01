import React, { useState } from 'react'
import { Download, FileCode, Image as ImageIcon } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useEditorStore } from '../../store/editorStore'
import { ShapeRenderer } from '../../editor/rendering/ShapeRenderer'
import { NodeUtils } from '../../editor/model/nodeUtils'

export const ExportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { document, activePageId } = useEditorStore()
  const [exportType, setExportType] = useState<'png' | 'json'>('png')

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]

  const handleExportJson = () => {
    if (!document) return
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(document, null, 2))
    const downloadAnchor = window.document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${document.name.replace(/\s+/g, '_')}.minifigma.json`)
    window.document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    onClose()
  }

  const handleExportPng = () => {
    if (!document || !activePage) return

    const nodes = activePage.nodes
    if (nodes.length === 0) {
      alert('Cannot export an empty canvas. Please add some shapes first.')
      return
    }

    const bounds = NodeUtils.getNodesAABB(nodes)
    const padding = 40
    const exportWidth = Math.max(200, Math.round(bounds.width + padding * 2))
    const exportHeight = Math.max(200, Math.round(bounds.height + padding * 2))

    // Create offscreen canvas for crisp export
    const offscreen = window.document.createElement('canvas')
    offscreen.width = exportWidth * 2 // 2x scale for Retina crispness
    offscreen.height = exportHeight * 2
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    ctx.scale(2, 2)

    // Fill background
    ctx.fillStyle = activePage.backgroundColor || '#1E1E1E'
    ctx.fillRect(0, 0, exportWidth, exportHeight)

    // Translate so bounds center in canvas
    ctx.translate(padding - bounds.x, padding - bounds.y)

    // Render nodes
    for (const node of nodes) {
      ShapeRenderer.renderNode(ctx, node)
    }

    const dataUrl = offscreen.toDataURL('image/png')
    const downloadAnchor = window.document.createElement('a')
    downloadAnchor.setAttribute('href', dataUrl)
    downloadAnchor.setAttribute('download', `${document.name.replace(/\s+/g, '_')}_export.png`)
    window.document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Design">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setExportType('png')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
              exportType === 'png'
                ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-xs font-semibold text-zinc-100">PNG Image</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">High-res 2x raster image</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setExportType('json')}
            className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
              exportType === 'json'
                ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <FileCode className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-xs font-semibold text-zinc-100">JSON Schema</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Full vector document data</div>
            </div>
          </button>
        </div>

        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span>Document:</span>
            <span className="text-zinc-200">{document?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Page:</span>
            <span className="text-zinc-200">{activePage?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Objects:</span>
            <span className="text-zinc-200">{activePage?.nodes.length || 0}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={exportType === 'png' ? handleExportPng : handleExportJson}
          >
            Download {exportType.toUpperCase()}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

