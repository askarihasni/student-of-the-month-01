import React, { useState } from 'react'
import { TopToolbar } from './TopToolbar'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { CanvasViewport } from './CanvasViewport'
import { BottomBar } from './BottomBar'
import { ExportModal } from './ExportModal'
import { VersionHistoryModal } from './VersionHistoryModal'
import { ShortcutsModal } from './ShortcutsModal'
import { useKeyboardShortcuts } from '../../editor/events/useKeyboardShortcuts'

export const EditorPage: React.FC = () => {
  // Bind global keyboard shortcuts
  useKeyboardShortcuts()

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Toolbar */}
      <TopToolbar
        onOpenVersionHistory={() => setHistoryModalOpen(true)}
        onExport={() => setExportModalOpen(true)}
      />

      {/* Main Work Area: Left Sidebar, Canvas Viewport, Right Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar />
        <CanvasViewport />
        <RightSidebar />
      </div>

      {/* Bottom Status Bar */}
      <BottomBar onOpenShortcuts={() => setShortcutsModalOpen(true)} />

      {/* Modals */}
      <ExportModal isOpen={exportModalOpen} onClose={() => setExportModalOpen(false)} />
      <VersionHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
    </div>
  )
}
