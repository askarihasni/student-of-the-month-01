import { create } from 'zustand'
import type { DocumentModel, DesignNode, NodeType, Page, EditorTool } from '../types/document'
import type { Viewport } from '../editor/viewport/ViewportController'
import { ViewportController } from '../editor/viewport/ViewportController'
import type { Point } from '../editor/math/Vector2D'
import type { Rect } from '../editor/math/Geometry'
import type { TransformHandleType } from '../editor/selection/HitTester'
import type { AlignmentGuide } from '../editor/transforms/SnapEngine'
import { HistoryManager } from '../editor/history/HistoryManager'
import { NodeUtils } from '../editor/model/nodeUtils'
import { TransformEngine } from '../editor/transforms/TransformEngine'
import { generateId, createGroup } from '../editor/model/factory'
import { normalizeDocument } from '../editor/model/normalizeDocument'
import { documentRepository } from '../services/repositories/LocalDevelopmentDocumentRepository'

interface EditorState {
  document: DocumentModel | null
  activePageId: string
  viewport: Viewport
  activeTool: EditorTool
  selectedNodeIds: string[]
  hoverNodeId: string | null
  activeTextEditingId: string | null

  // Transient interaction states
  isPanning: boolean
  isDragging: boolean
  isTransforming: boolean
  transformHandle: TransformHandleType | null
  previewShape: { tool: NodeType; start: Point; current: Point } | null
  marquee: Rect | null
  smartGuides: AlignmentGuide[]
  penPoints: Point[] | null
  currentPointer: Point | null

  // Clipboard & Persistence
  clipboard: DesignNode[]
  saveStatus: 'saved' | 'saving' | 'unsaved'
  canUndo: boolean
  canRedo: boolean

  // Actions
  setDocument: (doc: DocumentModel) => void
  setActivePage: (pageId: string) => void
  addPage: (name?: string) => void
  deletePage: (pageId: string) => void
  renamePage: (pageId: string, name: string) => void

  setActiveTool: (tool: EditorTool) => void
  setViewport: (viewport: Viewport) => void
  panBy: (dx: number, dy: number) => void
  zoomAt: (screenPoint: Point, factor: number) => void
  resetZoom: () => void
  fitToScreen: (canvasWidth: number, canvasHeight: number) => void

  selectNode: (id: string, additive?: boolean) => void
  selectNodes: (ids: string[]) => void
  clearSelection: () => void
  setHoverNodeId: (id: string | null) => void
  setActiveTextEditingId: (id: string | null) => void

  setTransientState: (state: Partial<EditorState>) => void

  addNode: (node: DesignNode) => void
  updateNode: (id: string, changes: Partial<DesignNode>) => void
  updateNodes: (ids: string[], changes: Partial<DesignNode>) => void
  deleteSelected: () => void
  duplicateSelected: () => void
  copySelected: () => void
  paste: () => void
  groupSelected: () => void
  ungroupSelected: () => void
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void

  reorderNode: (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => void
  moveNodeInList: (sourceIndex: number, targetIndex: number) => void
  toggleLock: (id: string) => void
  toggleVisibility: (id: string) => void
  renameNode: (id: string, name: string) => void

  startBatchHistory: (description?: string) => void
  commitHistory: (description?: string) => void
  undo: () => void
  redo: () => void
  saveDocumentNow: () => Promise<void>
}

const historyManager = new HistoryManager()
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null

export const useEditorStore = create<EditorState>((set, get) => ({
  document: null,
  activePageId: '',
  viewport: { x: 80, y: 80, zoom: 1.0 },
  activeTool: 'select',
  selectedNodeIds: [],
  hoverNodeId: null,
  activeTextEditingId: null

  ,
  isPanning: false,
  isDragging: false,
  isTransforming: false,
  transformHandle: null,
  previewShape: null,
  marquee: null,
  smartGuides: [],
  penPoints: null,
  currentPointer: null,

  clipboard: [],
  saveStatus: 'saved',
  canUndo: false,
  canRedo: false,

  setDocument: (doc: DocumentModel) => {
    const cleanDoc = normalizeDocument(doc)
    historyManager.clear()
    historyManager.push(cleanDoc, 'Initial State')
    set({
      document: cleanDoc,
      activePageId: cleanDoc.activePageId || cleanDoc.pages[0]?.id || '',
      selectedNodeIds: [],
      hoverNodeId: null,
      activeTextEditingId: null,
      canUndo: false,
      canRedo: false,
      saveStatus: 'saved',
    })
  },

  setActivePage: (pageId: string) => {
    const { document } = get()
    if (!document) return
    set({
      activePageId: pageId,
      selectedNodeIds: [],
      activeTextEditingId: null,
      document: {
        ...document,
        activePageId: pageId,
      },
    })
  },

  addPage: (name = 'New Page') => {
    const { document } = get()
    if (!document) return
    const newPage: Page = {
      id: generateId('page'),
      name: `${name} ${document.pages.length + 1}`,
      backgroundColor: '#1E1E1E',
      nodes: [],
    }

    const updatedDoc: DocumentModel = {
      ...document,
      pages: [...document.pages, newPage],
      activePageId: newPage.id,
    }

    historyManager.push(updatedDoc, 'Add Page')
    set({
      document: updatedDoc,
      activePageId: newPage.id,
      selectedNodeIds: [],
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  deletePage: (pageId: string) => {
    const { document } = get()
    if (!document || document.pages.length <= 1) return

    const remainingPages = document.pages.filter(p => p.id !== pageId)
    const nextActiveId = remainingPages[0].id

    const updatedDoc: DocumentModel = {
      ...document,
      pages: remainingPages,
      activePageId: nextActiveId,
    }

    historyManager.push(updatedDoc, 'Delete Page')
    set({
      document: updatedDoc,
      activePageId: nextActiveId,
      selectedNodeIds: [],
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  renamePage: (pageId: string, name: string) => {
    const { document } = get()
    if (!document) return

    const pages = document.pages.map(p => (p.id === pageId ? { ...p, name } : p))
    const updatedDoc = { ...document, pages }
    set({ document: updatedDoc, saveStatus: 'unsaved' })
    get().saveDocumentNow()
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool, activeTextEditingId: null, penPoints: null })
  },

  setViewport: (viewport) => {
    set({ viewport })
  },

  panBy: (dx, dy) => {
    const { viewport } = get()
    set({ viewport: ViewportController.pan(dx, dy, viewport) })
  },

  zoomAt: (screenPoint, factor) => {
    const { viewport } = get()
    set({ viewport: ViewportController.zoomAt(screenPoint, factor, viewport) })
  },

  resetZoom: () => {
    set({ viewport: { x: 100, y: 100, zoom: 1.0 } })
  },

  fitToScreen: (canvasWidth, canvasHeight) => {
    const { document, activePageId } = get()
    if (!document) return
    const page = document.pages.find(p => p.id === activePageId) || document.pages[0]
    if (!page || page.nodes.length === 0) {
      set({ viewport: { x: canvasWidth / 2 - 200, y: canvasHeight / 2 - 150, zoom: 1 } })
      return
    }

    const bounds = NodeUtils.getNodesAABB(page.nodes)
    const fitted = ViewportController.fitBounds(bounds, canvasWidth, canvasHeight, 80)
    set({ viewport: fitted })
  },

  selectNode: (id, additive = false) => {
    const { selectedNodeIds } = get()
    if (additive) {
      if (selectedNodeIds.includes(id)) {
        set({ selectedNodeIds: selectedNodeIds.filter(item => item !== id) })
      } else {
        set({ selectedNodeIds: [...selectedNodeIds, id] })
      }
    } else {
      set({ selectedNodeIds: [id], activeTextEditingId: null })
    }
  },

  selectNodes: (ids) => {
    set({ selectedNodeIds: ids, activeTextEditingId: null })
  },

  clearSelection: () => {
    set({ selectedNodeIds: [], activeTextEditingId: null })
  },

  setHoverNodeId: (id) => {
    set({ hoverNodeId: id })
  },

  setActiveTextEditingId: (id) => {
    set({ activeTextEditingId: id })
  },

  setTransientState: (state) => {
    set(state)
  },

  addNode: (node: DesignNode) => {
    const { document, activePageId } = get()
    if (!document) return

    const page = document.pages.find(p => p.id === activePageId) || document.pages[0]
    if (!page) return

    const updatedPages = document.pages.map(p => {
      if (p.id === page.id) {
        return {
          ...p,
          nodes: [...p.nodes, node],
        }
      }
      return p
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    historyManager.push(updatedDoc, `Add ${node.name}`)
    set({
      document: updatedDoc,
      selectedNodeIds: [node.id],
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  updateNode: (id: string, changes: Partial<DesignNode>) => {
    const { document, activePageId } = get()
    if (!document) return

    const updatedPages = document.pages.map(page => {
      if (page.id !== activePageId) return page
      const updatedNodes = page.nodes.map(n => {
        if (n.id !== id) return n
        const merged = { ...n, ...changes } as DesignNode
        return NodeUtils.updateTransformMatrix(merged)
      })
      return { ...page, nodes: updatedNodes }
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    set({ document: updatedDoc, saveStatus: 'unsaved' })
    get().saveDocumentNow()
  },

  updateNodes: (ids: string[], changes: Partial<DesignNode>) => {
    const { document, activePageId } = get()
    if (!document || ids.length === 0) return

    const updatedPages = document.pages.map(page => {
      if (page.id !== activePageId) return page
      const updatedNodes = page.nodes.map(n => {
        if (!ids.includes(n.id)) return n
        const merged = { ...n, ...changes } as DesignNode
        return NodeUtils.updateTransformMatrix(merged)
      })
      return { ...page, nodes: updatedNodes }
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    set({ document: updatedDoc, saveStatus: 'unsaved' })
    get().saveDocumentNow()
  },

  deleteSelected: () => {
    const { document, activePageId, selectedNodeIds } = get()
    if (!document || selectedNodeIds.length === 0) return

    const updatedPages = document.pages.map(page => {
      if (page.id !== activePageId) return page
      return {
        ...page,
        nodes: page.nodes.filter(n => !selectedNodeIds.includes(n.id)),
      }
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    historyManager.push(updatedDoc, 'Delete Selected')
    set({
      document: updatedDoc,
      selectedNodeIds: [],
      activeTextEditingId: null,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  duplicateSelected: () => {
    const { document, activePageId, selectedNodeIds } = get()
    if (!document || selectedNodeIds.length === 0) return

    const page = document.pages.find(p => p.id === activePageId) || document.pages[0]
    if (!page) return

    const toClone = page.nodes.filter(n => selectedNodeIds.includes(n.id))
    const cloned = toClone.map(n => NodeUtils.cloneNode(n, { x: 24, y: 24 }))
    const newSelectedIds = cloned.map(c => c.id)

    const updatedPages = document.pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          nodes: [...p.nodes, ...cloned],
        }
      }
      return p
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    historyManager.push(updatedDoc, 'Duplicate')
    set({
      document: updatedDoc,
      selectedNodeIds: newSelectedIds,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  copySelected: () => {
    const { document, activePageId, selectedNodeIds } = get()
    if (!document || selectedNodeIds.length === 0) return

    const page = document.pages.find(p => p.id === activePageId) || document.pages[0]
    if (!page) return

    const copied = page.nodes.filter(n => selectedNodeIds.includes(n.id))
    set({ clipboard: JSON.parse(JSON.stringify(copied)) })
  },

  paste: () => {
    const { document, activePageId, clipboard } = get()
    if (!document || clipboard.length === 0) return

    const pasted = clipboard.map(item => NodeUtils.cloneNode(item, { x: 20, y: 20 }))
    const newSelectedIds = pasted.map(p => p.id)

    const updatedPages = document.pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          nodes: [...p.nodes, ...pasted],
        }
      }
      return p
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    historyManager.push(updatedDoc, 'Paste')
    set({
      document: updatedDoc,
      selectedNodeIds: newSelectedIds,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  groupSelected: () => {
    const { document, activePageId, selectedNodeIds } = get()
    if (!document || selectedNodeIds.length < 2) return

    const group = createGroup(selectedNodeIds, 'Group')
    get().addNode(group)
  },

  ungroupSelected: () => {
    const { document, activePageId, selectedNodeIds } = get()
    if (!document || selectedNodeIds.length === 0) return

    const page = document.pages.find(p => p.id === activePageId)
    if (!page) return

    const groups = page.nodes.filter(n => n.type === 'group' && selectedNodeIds.includes(n.id))
    if (groups.length === 0) return

    const groupIds = groups.map(g => g.id)
    const updatedPages = document.pages.map(p => {
      if (p.id === activePageId) {
        return {
          ...p,
          nodes: p.nodes.filter(n => !groupIds.includes(n.id)),
        }
      }
      return p
    })

    const updatedDoc = { ...document, pages: updatedPages }
    historyManager.push(updatedDoc, 'Ungroup')
    set({
      document: updatedDoc,
      selectedNodeIds: [],
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const { document, activePageId, selectedNodeIds, viewport } = get()
    if (!document || selectedNodeIds.length === 0) return

    const activePage = document.pages.find((p) => p.id === activePageId) || document.pages[0]
    if (!activePage) return

    const rawNodes = activePage.nodes
    const pageNodes: DesignNode[] = Array.isArray(rawNodes)
      ? (rawNodes as DesignNode[])
      : rawNodes && typeof rawNodes === 'object'
      ? (Object.values(rawNodes) as DesignNode[])
      : []

    const selectedNodes = pageNodes.filter((n) => selectedNodeIds.includes(n.id))
    if (selectedNodes.length === 0) return

    let targetBounds: Rect

    if (selectedNodes.length >= 2) {
      // Multi-selection: align to collective bounding box of selected elements
      targetBounds = NodeUtils.getNodesAABB(selectedNodes)
    } else {
      // Single selection:
      const single = selectedNodes[0]
      const singleAABB = NodeUtils.getNodeAABB(single)

      // Check if parent frame exists by parentId
      let parentFrame: DesignNode | undefined
      if (single.parentId) {
        parentFrame = pageNodes.find((n) => n.id === single.parentId)
      }

      // If no explicit parentId, find any enclosing frame on the page
      if (!parentFrame) {
        parentFrame = pageNodes.find(
          (n) =>
            n.type === 'frame' &&
            n.id !== single.id &&
            'width' in n &&
            'height' in n &&
            n.x <= singleAABB.x + 5 &&
            n.y <= singleAABB.y + 5 &&
            n.x + n.width >= singleAABB.x + singleAABB.width - 5 &&
            n.y + n.height >= singleAABB.y + singleAABB.height - 5
        )
      }

      // If not strictly inside a frame, check if there is another frame on the page
      if (!parentFrame && single.type !== 'frame') {
        parentFrame = pageNodes.find((n) => n.type === 'frame' && n.id !== single.id)
      }

      if (parentFrame) {
        targetBounds = NodeUtils.getNodeAABB(parentFrame)
      } else {
        // Standalone artboard/canvas alignment relative to viewport center
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 800
        const worldCenterX = Math.round(-viewport.x + (screenW / 2) / viewport.zoom)
        const worldCenterY = Math.round(-viewport.y + (screenH / 2) / viewport.zoom)

        targetBounds = {
          x: worldCenterX - 450,
          y: worldCenterY - 300,
          width: 900,
          height: 600,
        }
      }
    }

    const updatedNodesMap = new Map<string, DesignNode>()

    for (const node of selectedNodes) {
      const nodeAABB = NodeUtils.getNodeAABB(node)
      let dx = 0
      let dy = 0

      if (alignment === 'left') {
        dx = targetBounds.x - nodeAABB.x
      } else if (alignment === 'center') {
        const targetCenterX = targetBounds.x + targetBounds.width / 2
        const nodeCenterX = nodeAABB.x + nodeAABB.width / 2
        dx = targetCenterX - nodeCenterX
      } else if (alignment === 'right') {
        const targetRight = targetBounds.x + targetBounds.width
        const nodeRight = nodeAABB.x + nodeAABB.width
        dx = targetRight - nodeRight
      } else if (alignment === 'top') {
        dy = targetBounds.y - nodeAABB.y
      } else if (alignment === 'middle') {
        const targetCenterY = targetBounds.y + targetBounds.height / 2
        const nodeCenterY = nodeAABB.y + nodeAABB.height / 2
        dy = targetCenterY - nodeCenterY
      } else if (alignment === 'bottom') {
        const targetBottom = targetBounds.y + targetBounds.height
        const nodeBottom = nodeAABB.y + nodeAABB.height
        dy = targetBottom - nodeBottom
      }

      if (Math.round(dx) !== 0 || Math.round(dy) !== 0) {
        const [moved] = TransformEngine.moveNodes([node], Math.round(dx), Math.round(dy))
        updatedNodesMap.set(node.id, moved)
      }
    }

    if (updatedNodesMap.size === 0) return

    const updatedPages = document.pages.map((p) => {
      if (p.id !== activePage.id) return p
      const newNodes = p.nodes.map((n) => updatedNodesMap.get(n.id) || n)
      return { ...p, nodes: newNodes }
    })

    const updatedDoc: DocumentModel = {
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    }

    historyManager.push(updatedDoc, `Align ${alignment}`)
    set({
      document: updatedDoc,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  reorderNode: (id, direction) => {
    const { document, activePageId } = get()
    if (!document) return

    const page = document.pages.find(p => p.id === activePageId)
    if (!page) return

    const nodes = [...page.nodes]
    const index = nodes.findIndex(n => n.id === id)
    if (index < 0) return

    const [item] = nodes.splice(index, 1)

    if (direction === 'front') {
      nodes.push(item)
    } else if (direction === 'back') {
      nodes.unshift(item)
    } else if (direction === 'forward') {
      const target = Math.min(nodes.length, index + 1)
      nodes.splice(target, 0, item)
    } else if (direction === 'backward') {
      const target = Math.max(0, index - 1)
      nodes.splice(target, 0, item)
    }

    const updatedPages = document.pages.map(p => (p.id === activePageId ? { ...p, nodes } : p))
    const updatedDoc = { ...document, pages: updatedPages }

    historyManager.push(updatedDoc, 'Reorder Layer')
    set({
      document: updatedDoc,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  moveNodeInList: (sourceIndex, targetIndex) => {
    const { document, activePageId } = get()
    if (!document) return

    const page = document.pages.find(p => p.id === activePageId)
    if (!page) return

    const nodes = [...page.nodes]
    const [moved] = nodes.splice(sourceIndex, 1)
    nodes.splice(targetIndex, 0, moved)

    const updatedPages = document.pages.map(p => (p.id === activePageId ? { ...p, nodes } : p))
    const updatedDoc = { ...document, pages: updatedPages }

    historyManager.push(updatedDoc, 'Reorder Layers')
    set({
      document: updatedDoc,
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  toggleLock: (id) => {
    const { document, activePageId } = get()
    if (!document) return

    const page = document.pages.find(p => p.id === activePageId)
    const node = page?.nodes.find(n => n.id === id)
    if (!node) return

    get().updateNode(id, { locked: !node.locked })
  },

  toggleVisibility: (id) => {
    const { document, activePageId } = get()
    if (!document) return

    const page = document.pages.find(p => p.id === activePageId)
    const node = page?.nodes.find(n => n.id === id)
    if (!node) return

    get().updateNode(id, { visible: !node.visible })
  },

  renameNode: (id, name) => {
    get().updateNode(id, { name })
  },

  startBatchHistory: (description = 'Transform') => {
    const { document } = get()
    if (!document) return
    historyManager.startBatch(document, description)
  },

  commitHistory: (description = 'Edit') => {
    const { document } = get()
    if (!document) return
    historyManager.endBatch()
    set({
      canUndo: historyManager.canUndo(),
      canRedo: historyManager.canRedo(),
      saveStatus: 'unsaved',
    })
    get().saveDocumentNow()
  },

  undo: () => {
    const { document } = get()
    if (!document) return

    const previous = historyManager.undo(document)
    if (previous) {
      set({
        document: previous,
        selectedNodeIds: [],
        canUndo: historyManager.canUndo(),
        canRedo: historyManager.canRedo(),
        saveStatus: 'unsaved',
      })
      get().saveDocumentNow()
    }
  },

  redo: () => {
    const { document } = get()
    if (!document) return

    const next = historyManager.redo(document)
    if (next) {
      set({
        document: next,
        selectedNodeIds: [],
        canUndo: historyManager.canUndo(),
        canRedo: historyManager.canRedo(),
        saveStatus: 'unsaved',
      })
      get().saveDocumentNow()
    }
  },

  saveDocumentNow: async () => {
    const { document } = get()
    if (!document) return

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)

    set({ saveStatus: 'saving' })
    autoSaveTimeout = setTimeout(async () => {
      try {
        await documentRepository.save(document)
        set({ saveStatus: 'saved' })
      } catch (err) {
        console.error('Auto-save error', err)
        set({ saveStatus: 'unsaved' })
      }
    }, 400)
  },
}))
