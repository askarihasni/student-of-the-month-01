import { describe, it, expect } from 'vitest'
import {
  createDefaultDocument,
  createRectangle,
  createEllipse,
  createLine,
  createText,
} from '../editor/model/factory'
import { DocumentModelSchema } from '../schemas/document.schema'
import { NodeUtils } from '../editor/model/nodeUtils'

describe('Document Model & Schema Validation', () => {
  it('creates valid default document passing Zod schema', () => {
    const doc = createDefaultDocument('Test Project')
    expect(doc.name).toBe('Test Project')
    expect(doc.pages.length).toBeGreaterThan(0)

    const parsed = DocumentModelSchema.safeParse(doc)
    expect(parsed.success).toBe(true)
  })

  it('computes node AABB accurately for unrotated and rotated nodes', () => {
    const rect = createRectangle({ x: 100, y: 100, width: 200, height: 100, rotation: 0 })
    const aabb = NodeUtils.getNodeAABB(rect)
    expect(aabb).toEqual({ x: 100, y: 100, width: 200, height: 100 })

    // When rotated 90 degrees around center (200, 150), width and height swap
    const rotated = createRectangle({ x: 100, y: 100, width: 200, height: 100, rotation: 90 })
    const rotatedAabb = NodeUtils.getNodeAABB(rotated)
    expect(rotatedAabb.width).toBeCloseTo(100)
    expect(rotatedAabb.height).toBeCloseTo(200)
  })

  it('clones a node with unique id and offset', () => {
    const orig = createRectangle({ x: 50, y: 50, width: 100, height: 100 })
    const clone = NodeUtils.cloneNode(orig, { x: 30, y: 30 })

    expect(clone.id).not.toBe(orig.id)
    if (clone.type === 'rectangle') {
      expect(clone.x).toBe(80)
      expect(clone.y).toBe(80)
    }
  })

  it('unions multiple node AABBs', () => {
    const r1 = createRectangle({ x: 0, y: 0, width: 50, height: 50 })
    const r2 = createRectangle({ x: 100, y: 100, width: 50, height: 50 })
    const union = NodeUtils.getNodesAABB([r1, r2])

    expect(union).toEqual({ x: 0, y: 0, width: 150, height: 150 })
  })
})
