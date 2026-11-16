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
    <footer className="h-7 bg-[#2C2C2C] border-t border-[#383838] flex items-center justify-between px-4 text-xs text-[#8C8C8C] select-none z-20 shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-[#D0D0D0] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0D99FF]" />
          {selectionText}
        </span>
        {currentPointer && (
          <span className="font-mono text-[#8C8C8C] hidden sm:inline text-xs">
            X: {Math.round(currentPointer.x)} Y: {Math.round(currentPointer.y)}
          </span>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2.5 text-xs text-[#7E7E7E]">
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
          className="flex items-center gap-1.5 text-[#8C8C8C] hover:text-white transition-colors text-xs font-medium"
          title="Keyboard shortcuts"
        >
          <Command className="w-3.5 h-3.5" />
          <span>Shortcuts</span>
        </button>
      </div>
    </footer>
  )
}
