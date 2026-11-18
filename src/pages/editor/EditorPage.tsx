import React, { useState } from 'react'
import { TopToolbar } from './TopToolbar'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { CanvasViewport } from './CanvasViewport'
import { BottomBar } from './BottomBar'
import { ExportModal } from './ExportModal'
import { VersionHistoryModal } from './VersionHistoryModal'
import { ShortcutsModal } from './ShortcutsModal'
import { ShareModal } from './ShareModal'
import { GeminiChatDrawer } from '../../components/ai/GeminiChatDrawer'
import { useUIStore } from '../../store/uiStore'
import { useKeyboardShortcuts } from '../../editor/events/useKeyboardShortcuts'

export const EditorPage: React.FC = () => {
  // Bind global keyboard shortcuts
  useKeyboardShortcuts()

  const { isGeminiChatOpen, setGeminiChatOpen } = useUIStore()

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1E1E1E] text-white overflow-hidden select-none font-sans">
      {/* Top Toolbar */}
      <TopToolbar
        onOpenVersionHistory={() => setHistoryModalOpen(true)}
        onExport={() => setExportModalOpen(true)}
        onOpenShare={() => setShareModalOpen(true)}
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
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />

      {/* Gemini AI Design Copilot Chat Drawer */}
      <GeminiChatDrawer isOpen={isGeminiChatOpen} onClose={() => setGeminiChatOpen(false)} />
    </div>
  )
}
