import { useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { useUIStore } from '../../store/uiStore'

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    paste,
    clearSelection,
    selectNodes,
    setActiveTool,
    alignSelected,
    document,
    activePageId,
  } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when typing in inputs, textareas, or contenteditables
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, select'))
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Ctrl / Cmd + J: Toggle Gemini AI Design Copilot
      if (modifier && e.code === 'KeyJ') {
        e.preventDefault()
        useUIStore.getState().toggleGeminiChat()
        return
      }

      // Ctrl / Cmd + Z: Undo
      if (modifier && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl / Cmd + Shift + Z or Ctrl + Y: Redo
      if ((modifier && e.shiftKey && e.code === 'KeyZ') || (modifier && e.code === 'KeyY')) {
        e.preventDefault()
        redo()
        return
      }

      // Ctrl / Cmd + C: Copy
      if (modifier && e.code === 'KeyC') {
        e.preventDefault()
        copySelected()
        return
      }

      // Ctrl / Cmd + X: Cut
      if (modifier && e.code === 'KeyX') {
        e.preventDefault()
        copySelected()
        deleteSelected()
        return
      }

      // Ctrl / Cmd + V: Paste
      if (modifier && e.code === 'KeyV') {
        e.preventDefault()
        paste()
        return
      }

      // Ctrl / Cmd + D: Duplicate
      if (modifier && e.code === 'KeyD') {
        e.preventDefault()
        duplicateSelected()
        return
      }

      // Ctrl / Cmd + A: Select All
      if (modifier && e.code === 'KeyA') {
        e.preventDefault()
        const page = document?.pages.find((p) => p.id === activePageId) || document?.pages[0]
        if (page) {
          selectNodes(page.nodes.map((n) => n.id))
        }
        return
      }

      // Delete / Backspace: Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
        return
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        setActiveTool('select')
        return
      }

      // Alt + Alignment shortcuts (Figma standard)
      if (e.altKey && !modifier) {
        if (e.code === 'KeyA') {
          e.preventDefault()
          alignSelected('left')
          return
        }
        if (e.code === 'KeyD') {
          e.preventDefault()
          alignSelected('right')
          return
        }
        if (e.code === 'KeyW') {
          e.preventDefault()
          alignSelected('top')
          return
        }
        if (e.code === 'KeyS') {
          e.preventDefault()
          alignSelected('bottom')
          return
        }
        if (e.code === 'KeyH') {
          e.preventDefault()
          alignSelected('center')
          return
        }
        if (e.code === 'KeyV') {
          e.preventDefault()
          alignSelected('middle')
          return
        }
      }

      // Tool shortcuts (without modifier)
      if (!modifier && !e.altKey) {
        switch (e.code) {
          case 'KeyV':
            setActiveTool('select')
            break
          case 'KeyR':
            setActiveTool('rectangle')
            break
          case 'KeyO':
            setActiveTool('ellipse')
            break
          case 'KeyL':
            setActiveTool('line')
            break
          case 'KeyT':
            setActiveTool('text')
            break
          case 'KeyP':
            setActiveTool('pen')
            break
          case 'KeyF':
            setActiveTool('frame')
            break
          case 'KeyH':
            setActiveTool('hand')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    copySelected,
    paste,
    clearSelection,
    selectNodes,
    setActiveTool,
    alignSelected,
    document,
    activePageId,
  ])
}

