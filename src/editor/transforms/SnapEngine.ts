import type { DesignNode } from '../../types/document'
import type { Rect } from '../math/Geometry'
import { Geometry } from '../math/Geometry'
import type { Point } from '../math/Vector2D'
import { NodeUtils } from '../model/nodeUtils'

export interface AlignmentGuide {
  orientation: 'horizontal' | 'vertical'
  position: number // X coordinate for vertical, Y coordinate for horizontal
  start: number
  end: number
}

export interface SnapResult {
  deltaX: number
  deltaY: number
  guides: AlignmentGuide[]
}

export class SnapEngine {
  /**
   * Snaps the dragged bounding box to nearby unselected objects within snapDistance
   */
  static computeSnap(
    draggedBounds: Rect,
    candidateNodes: DesignNode[],
    snapDistance = 6
  ): SnapResult {
    let bestDeltaX = 0
    let bestDeltaY = 0
    let minDistanceX = snapDistance + 1
    let minDistanceY = snapDistance + 1

    const guides: AlignmentGuide[] = []

    const dLeft = draggedBounds.x
    const dCenterX = draggedBounds.x + draggedBounds.width / 2
    const dRight = draggedBounds.x + draggedBounds.width

    const dTop = draggedBounds.y
    const dCenterY = draggedBounds.y + draggedBounds.height / 2
    const dBottom = draggedBounds.y + draggedBounds.height

    for (const other of candidateNodes) {
      if (!other.visible) continue
      const o = NodeUtils.getNodeAABB(other)

      const oLeft = o.x
      const oCenterX = o.x + o.width / 2
      const oRight = o.x + o.width

      const oTop = o.y
      const oCenterY = o.y + o.height / 2
      const oBottom = o.y + o.height

      // X comparisons (Vertical guide lines)
      const xChecks = [
        { diff: oLeft - dLeft, pos: oLeft },
        { diff: oCenterX - dCenterX, pos: oCenterX },
        { diff: oRight - dRight, pos: oRight },
        { diff: oLeft - dRight, pos: oLeft },
        { diff: oRight - dLeft, pos: oRight },
      ]

      for (const check of xChecks) {
        const absDiff = Math.abs(check.diff)
        if (absDiff <= snapDistance && absDiff < minDistanceX) {
          minDistanceX = absDiff
          bestDeltaX = check.diff
          guides.push({
            orientation: 'vertical',
            position: check.pos,
            start: Math.min(draggedBounds.y, o.y) - 20,
            end: Math.max(dBottom, oBottom) + 20,
          })
        }
      }

      // Y comparisons (Horizontal guide lines)
      const yChecks = [
        { diff: oTop - dTop, pos: oTop },
        { diff: oCenterY - dCenterY, pos: oCenterY },
        { diff: oBottom - dBottom, pos: oBottom },
        { diff: oTop - dBottom, pos: oTop },
        { diff: oBottom - dTop, pos: oBottom },
      ]

      for (const check of yChecks) {
        const absDiff = Math.abs(check.diff)
        if (absDiff <= snapDistance && absDiff < minDistanceY) {
          minDistanceY = absDiff
          bestDeltaY = check.diff
          guides.push({
            orientation: 'horizontal',
            position: check.pos,
            start: Math.min(draggedBounds.x, o.x) - 20,
            end: Math.max(dRight, oRight) + 20,
          })
        }
      }
    }

    return {
      deltaX: bestDeltaX,
      deltaY: bestDeltaY,
      guides,
    }
  }
}

