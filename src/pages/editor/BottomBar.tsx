import React from 'react'
import { Command, HelpCircle } from 'lucide-react'
import { useEditorStore } from '../../store/editorStore'

export const BottomBar: React.FC<{ onOpenShortcuts: () => void }> = ({ onOpenShortcuts }) => {
  const { viewport, selectedNodeIds, document, activePageId, currentPointer } = useEditorStore()

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]
  const selectedNodes =
    activePage?.nodes.filter((n) => selectedNodeIds.includes(n.id)) || []

  let selectionText = 'No selection'
  if (selectedNodes.length === 1) {
    const single = selectedNodes[0]
    const w = 'width' in single ? Math.round(single.width) : 0
    const h = 'height' in single ? Math.round(single.height) : 0
    selectionText = `${single.name} (${w} × ${h})`
  } else if (selectedNodes.length > 1) {
    selectionText = `${selectedNodes.length} objects selected`
  }

  return (
    <footer className="h-7 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-3 text-[11px] text-zinc-400 select-none z-20">
      <div className="flex items-center gap-4">
        <span className="font-medium text-zinc-300">{selectionText}</span>
        {currentPointer && (
          <span className="font-mono text-zinc-500">
            X: {Math.round(currentPointer.x)} Y: {Math.round(currentPointer.y)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
        >
          <Command className="w-3 h-3" />
          <span>Shortcuts</span>
        </button>
      </div>
    </footer>
  )
}
