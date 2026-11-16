import { describe, it, expect, beforeEach } from 'vitest'
import {
  createDefaultDocument,
  createRectangle,
  createEllipse,
  createLine,
  createText,
  createFrame,
  createPath,
} from '../editor/model/factory'
import { documentRepository } from '../services/repositories/LocalDevelopmentDocumentRepository'
import { authAdapter } from '../services/auth/MockAuthAdapter'
import { useEditorStore } from '../store/editorStore'
import { DocumentModelSchema } from '../schemas/document.schema'
import { ViewportController } from '../editor/viewport/ViewportController'
import { HitTester } from '../editor/selection/HitTester'
import { TransformEngine } from '../editor/transforms/TransformEngine'
import { NodeUtils } from '../editor/model/nodeUtils'

describe('End-to-End Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('performs complete document creation, persistence, and reload cycle', async () => {
    // 1. Create new document
    const newDoc = await documentRepository.create('Integration Architecture Test')
    expect(newDoc.name).toBe('Integration Architecture Test')
    expect(newDoc.pages.length).toBeGreaterThan(0)

    // 2. Add shapes
    const rect = createRectangle({ x: 150, y: 150, width: 200, height: 100, fill: '#3B82F6' })
    const ellipse = createEllipse({ x: 400, y: 150, width: 120, height: 120, fill: '#10B981' })
    newDoc.pages[0].nodes.push(rect, ellipse)

    // 3. Save to repository
    await documentRepository.save(newDoc)

    // 4. Reload from repository
    const reloaded = await documentRepository.getById(newDoc.id)
    expect(reloaded).not.toBeNull()
    expect(reloaded?.name).toBe('Integration Architecture Test')
    expect(reloaded?.pages[0].nodes.length).toBe(newDoc.pages[0].nodes.length)
    expect(reloaded?.pages[0].nodes.some(n => n.id === rect.id)).toBe(true)
  })

  it('validates JSON import and export roundtrip', async () => {
    const doc = createDefaultDocument('JSON Roundtrip Test')
    const serialized = JSON.stringify(doc)
    const deserialized = JSON.parse(serialized)

    const validation = DocumentModelSchema.safeParse(deserialized)
    expect(validation.success).toBe(true)
  })

  it('executes full editor workflow via Zustand store (create, select, transform, undo, redo, delete)', () => {
    const store = useEditorStore.getState()
    const doc = createDefaultDocument('Interactive Store Flow')
    store.setDocument(doc)

    // Verify initial state
    expect(useEditorStore.getState().document?.name).toBe('Interactive Store Flow')

    // Add rectangle
    const rect = createRectangle({ id: 'rect_test_1', x: 200, y: 200, width: 100, height: 80 })
    store.addNode(rect)
    expect(useEditorStore.getState().canUndo).toBe(true)

    // Select the rectangle
    store.selectNode(rect.id)
    expect(useEditorStore.getState().selectedNodeIds).toEqual([rect.id])

    // Update properties (Move)
    store.updateNode(rect.id, { x: 250, y: 280 })
    const activePage = useEditorStore.getState().document?.pages[0]
    const updatedRect = activePage?.nodes.find(n => n.id === rect.id)
    if (updatedRect && updatedRect.type === 'rectangle') {
      expect(updatedRect.x).toBe(250)
      expect(updatedRect.y).toBe(280)
    }

    // Duplicate selected
    store.duplicateSelected()
    const nodesAfterDup = useEditorStore.getState().document?.pages[0].nodes || []
    expect(nodesAfterDup.length).toBeGreaterThan(activePage?.nodes.length || 0)

    // Undo duplicate
    store.undo()
    expect(useEditorStore.getState().canRedo).toBe(true)

    // Redo duplicate
    store.redo()

    // Delete selected
    store.deleteSelected()
    expect(useEditorStore.getState().selectedNodeIds.length).toBe(0)
  })

  it('verifies mock authentication workflows (login, register, session persistence, logout)', async () => {
    // 1. Register new user
    const registered = await authAdapter.register('Alex Morgan', 'alex@design.studio', 'password123')
    expect(registered.name).toBe('Alex Morgan')
    expect(registered.email).toBe('alex@design.studio')

    // 2. Check current session
    const current = await authAdapter.getCurrentUser()
    expect(current?.email).toBe('alex@design.studio')

    // 3. Logout
    await authAdapter.logout()

    // 4. Login with registered credentials
    const loggedIn = await authAdapter.login('alex@design.studio', 'password123')
    expect(loggedIn.email).toBe('alex@design.studio')
  })

  it('calculates screen to world and world to screen coordinate conversions accurately across zoom levels', () => {
    const viewport = { x: 100, y: 50, zoom: 2.0 }

    const screenPoint = { x: 300, y: 250 }
    // worldX = (300 - 100) / 2 = 100
    // worldY = (250 - 50) / 2 = 100
    const worldPoint = ViewportController.screenToWorld(screenPoint, viewport)
    expect(worldPoint).toEqual({ x: 100, y: 100 })

    const backToScreen = ViewportController.worldToScreen(worldPoint, viewport)
    expect(backToScreen).toEqual(screenPoint)
  })

  it('handles multi-object transformations and bounding boxes', () => {
    const r1 = createRectangle({ x: 10, y: 10, width: 50, height: 50 })
    const r2 = createRectangle({ x: 100, y: 100, width: 80, height: 60 })

    const moved = TransformEngine.moveNodes([r1, r2], 15, -5)
    if (moved[0].type === 'rectangle' && moved[1].type === 'rectangle') {
      expect(moved[0].x).toBe(25)
      expect(moved[0].y).toBe(5)
      expect(moved[1].x).toBe(115)
      expect(moved[1].y).toBe(95)
    }

    const bounds = NodeUtils.getNodesAABB(moved)
    expect(bounds.x).toBe(25)
    expect(bounds.y).toBe(5)
    expect(bounds.width).toBe(115 + 80 - 25) // 170
  })
})

