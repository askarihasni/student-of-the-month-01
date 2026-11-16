import React from 'react'
import { Command, HelpCircle, MousePointer } from 'lucide-react'
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
    selectionText = `${single.name} (${w} × ${h}px)`
  } else if (selectedNodes.length > 1) {
    selectionText = `${selectedNodes.length} layers selected`
  }

  return (
    <footer className="h-6 bg-[#2C2C2C] border-t border-[#383838] flex items-center justify-between px-3 text-[11px] text-[#7E7E7E] select-none z-20 shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-medium text-[#B3B3B3] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D99FF]" />
          {selectionText}
        </span>
        {currentPointer && (
          <span className="font-mono text-[#7E7E7E] hidden sm:inline">
            X: {Math.round(currentPointer.x)} Y: {Math.round(currentPointer.y)}
          </span>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 text-[10px] text-[#666666]">
        <span>Space + Drag to pan</span>
        <span>&bull;</span>
        <span>Ctrl + Scroll to zoom</span>
        <span>&bull;</span>
        <span>Shift + Resize for aspect ratio</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 text-[#7E7E7E] hover:text-white transition-colors"
          title="Keyboard shortcuts"
        >
          <Command className="w-3 h-3" />
          <span>Shortcuts</span>
        </button>
      </div>
    </footer>
  )
}
