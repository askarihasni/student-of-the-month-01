import React from 'react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

export const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const shortcutGroups = [
    {
      title: 'Tools',
      items: [
        { label: 'Select / Move', key: 'V' },
        { label: 'Frame', key: 'F' },
        { label: 'Rectangle', key: 'R' },
        { label: 'Ellipse', key: 'O' },
        { label: 'Line', key: 'L' },
        { label: 'Pen Tool', key: 'P' },
        { label: 'Text', key: 'T' },
        { label: 'Hand / Pan', key: 'H' },
      ],
    },
    {
      title: 'Editing & Clipboard',
      items: [
        { label: 'Undo', key: 'Ctrl + Z' },
        { label: 'Redo', key: 'Ctrl + Y / Ctrl+Shift+Z' },
        { label: 'Copy', key: 'Ctrl + C' },
        { label: 'Cut', key: 'Ctrl + X' },
        { label: 'Paste', key: 'Ctrl + V' },
        { label: 'Duplicate', key: 'Ctrl + D' },
        { label: 'Delete Selected', key: 'Del / Backspace' },
        { label: 'Select All', key: 'Ctrl + A' },
      ],
    },
    {
      title: 'Canvas & Viewport',
      items: [
        { label: 'Pan Canvas', key: 'Space + Drag' },
        { label: 'Zoom Centered', key: 'Ctrl + Wheel' },
        { label: 'Lock Aspect Ratio', key: 'Shift + Resize' },
        { label: 'Snap 15° Rotation', key: 'Shift + Rotate' },
        { label: 'Multi-Selection', key: 'Shift + Click' },
        { label: 'Deselect', key: 'Esc' },
      ],
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="max-w-xl">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <h4 className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2.5">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{item.label}</span>
                    <kbd className="bg-zinc-850 text-zinc-200 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  )
}
