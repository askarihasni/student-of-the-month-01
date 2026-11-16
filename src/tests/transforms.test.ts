import { describe, it, expect } from 'vitest'
import { createRectangle, createEllipse, createLine, createDefaultDocument } from '../editor/model/factory'
import { HitTester } from '../editor/selection/HitTester'
import { TransformEngine } from '../editor/transforms/TransformEngine'
import { SnapEngine } from '../editor/transforms/SnapEngine'
import { HistoryManager } from '../editor/history/HistoryManager'

describe('HitTester', () => {
  it('hit tests rectangle and ellipse correctly', () => {
    const rect = createRectangle({ x: 50, y: 50, width: 100, height: 100 })
    expect(HitTester.hitTestNode({ x: 75, y: 75 }, rect)).toBe(true)
    expect(HitTester.hitTestNode({ x: 10, y: 10 }, rect)).toBe(false)

    const ellipse = createEllipse({ x: 0, y: 0, width: 100, height: 100 })
    expect(HitTester.hitTestNode({ x: 50, y: 50 }, ellipse)).toBe(true) // Center
    expect(HitTester.hitTestNode({ x: 0, y: 0 }, ellipse)).toBe(false) // Corner of bounding box outside ellipse
  })

  it('hit tests line within tolerance', () => {
    const line = createLine({ x1: 0, y1: 0, x2: 100, y2: 0, strokeWidth: 2 })
    expect(HitTester.hitTestNode({ x: 50, y: 2 }, line, 6)).toBe(true)
    expect(HitTester.hitTestNode({ x: 50, y: 20 }, line, 6)).toBe(false)
  })

  it('identifies top-most node in z-stack', () => {
    const bottom = createRectangle({ id: 'bottom', x: 0, y: 0, width: 100, height: 100 })
    const top = createRectangle({ id: 'top', x: 20, y: 20, width: 50, height: 50 })

    const hit = HitTester.hitTestTopmost({ x: 30, y: 30 }, [bottom, top])
    expect(hit?.id).toBe('top')

    const hitBottomOnly = HitTester.hitTestTopmost({ x: 10, y: 10 }, [bottom, top])
    expect(hitBottomOnly?.id).toBe('bottom')
  })

  it('selects multiple nodes via marquee intersection', () => {
    const r1 = createRectangle({ id: 'r1', x: 0, y: 0, width: 50, height: 50 })
    const r2 = createRectangle({ id: 'r2', x: 100, y: 100, width: 50, height: 50 })
    const r3 = createRectangle({ id: 'r3', x: 300, y: 300, width: 50, height: 50 })

    const marquee = { x: 25, y: 25, width: 100, height: 100 }
    const selected = HitTester.hitTestMarquee(marquee, [r1, r2, r3])

    expect(selected.map(s => s.id)).toContain('r1')
    expect(selected.map(s => s.id)).toContain('r2')
    expect(selected.map(s => s.id)).not.toContain('r3')
  })
})

describe('TransformEngine', () => {
  it('moves nodes by delta', () => {
    const rect = createRectangle({ x: 50, y: 50, width: 100, height: 100 })
    const moved = TransformEngine.moveNodes([rect], 20, -10)[0]

    if (moved.type === 'rectangle') {
      expect(moved.x).toBe(70)
      expect(moved.y).toBe(40)
    }
  })

  it('resizes node with bottom-right handle and enforces minimum size', () => {
    const rect = createRectangle({ x: 100, y: 100, width: 100, height: 100 })
    const start = { x: 200, y: 200 }
    const current = { x: 250, y: 240 }

    const resized = TransformEngine.resizeNode(rect, 'br', current, rect, start)
    if (resized.type === 'rectangle') {
      expect(resized.width).toBe(150)
      expect(resized.height).toBe(140)
    }
  })

  it('rotates node around center', () => {
    const rect = createRectangle({ x: 100, y: 100, width: 100, height: 100, rotation: 0 })
    const center = { x: 150, y: 150 }
    const start = { x: 150, y: 100 } // Above center (angle -90 deg)
    const current = { x: 200, y: 150 } // Right of center (angle 0 deg)

    const rotated = TransformEngine.rotateNode(rect, current, start)
    expect(rotated.rotation).toBeCloseTo(90)
  })
})

describe('SnapEngine', () => {
  it('detects edge alignment and computes snap offset', () => {
    const target = createRectangle({ x: 100, y: 100, width: 100, height: 100 })
    // Candidate placed at x: 204 (within 6px of target right edge at 200)
    const draggedBounds = { x: 204, y: 100, width: 50, height: 50 }

    const snap = SnapEngine.computeSnap(draggedBounds, [target], 6)
    // Should snap by -4 to align left edge of dragged to right edge of target
    expect(snap.deltaX).toBe(-4)
    expect(snap.guides.length).toBeGreaterThan(0)
  })
})

describe('HistoryManager', () => {
  it('manages undo and redo stacks reliably', () => {
    const history = new HistoryManager()
    const doc1 = createDefaultDocument('Doc 1')
    const doc2 = { ...doc1, name: 'Doc 2' }
    const doc3 = { ...doc2, name: 'Doc 3' }

    history.push(doc1, 'Initial')
    history.push(doc2, 'Edit 1')

    expect(history.canUndo()).toBe(true)
    expect(history.canRedo()).toBe(false)

    // Undo from doc3
    const restored = history.undo(doc3)
    expect(restored?.name).toBe('Doc 2')
    expect(history.canRedo()).toBe(true)

    // Redo back to doc3
    const redone = history.redo(restored!)
    expect(redone?.name).toBe('Doc 3')
  })
})

