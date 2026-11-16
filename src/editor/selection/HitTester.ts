import type { DesignNode, RectangleNode, FrameNode, EllipseNode, LineNode, TextNode, ImageNode, PathNode } from '../../types/document'
import type { Point } from '../math/Vector2D'
import { Vector2D } from '../math/Vector2D'
import type { Rect } from '../math/Geometry'
import { Geometry } from '../math/Geometry'
import { Bezier } from '../math/Bezier'
import { NodeUtils } from '../model/nodeUtils'

export type TransformHandleType =
  | 'tl' // top-left
  | 'tc' // top-center
  | 'tr' // top-right
  | 'ml' // middle-left
  | 'mr' // middle-right
  | 'bl' // bottom-left
  | 'bc' // bottom-center
  | 'br' // bottom-right
  | 'rot' // rotation handle

export interface HandleInfo {
  type: TransformHandleType
  position: Point
  cursor: string
}

export class HitTester {
  /**
   * Tests if a world-space point hits a single design node
   */
  static hitTestNode(p: Point, node: DesignNode, hitTolerance = 6): boolean {
    if (!node.visible || node.locked) return false

    const rotRad = (node.rotation * Math.PI) / 180

    switch (node.type) {
      case 'rectangle':
      case 'frame':
      case 'image': {
        const rect: Rect = {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        }
        return Geometry.pointInRotatedRect(p, rect, rotRad)
      }
      case 'ellipse': {
        const rect: Rect = {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        }
        return Geometry.pointInEllipse(p, rect, rotRad)
      }
      case 'line': {
        const a: Point = { x: node.x1, y: node.y1 }
        const b: Point = { x: node.x2, y: node.y2 }
        const d = Geometry.distanceToSegment(p, a, b)
        return d <= Math.max(hitTolerance, node.strokeWidth / 2 + 4)
      }
      case 'text': {
        const rect: Rect = {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        }
        return Geometry.pointInRotatedRect(p, rect, rotRad)
      }
      case 'path': {
        // Test distance to path segments
        const pts = node.points
        if (pts.length < 2) return false

        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i].point
          const p1 = pts[i].handleOut || pts[i].point
          const p2 = pts[i + 1].handleIn || pts[i + 1].point
          const p3 = pts[i + 1].point

          const dist = Bezier.distanceToCubicSegment(p, p0, p1, p2, p3)
          if (dist <= Math.max(hitTolerance, node.strokeWidth / 2 + 4)) {
            return true
          }
        }

        // If closed path and filled, also test polygon containment
        if (node.closed && node.fill && node.fill !== 'transparent') {
          const poly = pts.map(pt => pt.point)
          if (Geometry.pointInPolygon(p, poly)) return true
        }

        return false
      }
      case 'group': {
        // Group hit test delegated to its children
        return false
      }
    }
  }

  /**
   * Returns the topmost node under the pointer (searches top of z-stack first)
   */
  static hitTestTopmost(
    p: Point,
    nodes: DesignNode[],
    hitTolerance = 6
  ): DesignNode | null {
    // Top-to-bottom search (reverse iteration)
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (HitTester.hitTestNode(p, node, hitTolerance)) {
        return node
      }
    }
    return null
  }

  /**
   * Tests which nodes intersect or are enclosed in a marquee selection rectangle
   */
  static hitTestMarquee(marquee: Rect, nodes: DesignNode[]): DesignNode[] {
    const normMarquee = Geometry.normalizeRect(marquee)
    const selected: DesignNode[] = []

    for (const node of nodes) {
      if (!node.visible || node.locked) continue

      const aabb = NodeUtils.getNodeAABB(node)
      if (Geometry.rectsIntersect(normMarquee, aabb)) {
        selected.push(node)
      }
    }

    return selected
  }

  /**
   * Generates positions and cursor styles for the 8 resize handles and 1 rotation handle
   */
  static getHandles(
    bounds: Rect,
    rotationDeg: number,
    zoom: number
  ): HandleInfo[] {
    const rotRad = (rotationDeg * Math.PI) / 180
    const center: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    }

    const unrotatedHandles: { type: TransformHandleType; pos: Point; baseCursor: string }[] = [
      { type: 'tl', pos: { x: bounds.x, y: bounds.y }, baseCursor: 'nwse-resize' },
      { type: 'tc', pos: { x: bounds.x + bounds.width / 2, y: bounds.y }, baseCursor: 'ns-resize' },
      { type: 'tr', pos: { x: bounds.x + bounds.width, y: bounds.y }, baseCursor: 'nesw-resize' },
      { type: 'ml', pos: { x: bounds.x, y: bounds.y + bounds.height / 2 }, baseCursor: 'ew-resize' },
      { type: 'mr', pos: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, baseCursor: 'ew-resize' },
      { type: 'bl', pos: { x: bounds.x, y: bounds.y + bounds.height }, baseCursor: 'nesw-resize' },
      { type: 'bc', pos: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, baseCursor: 'ns-resize' },
      { type: 'br', pos: { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, baseCursor: 'nwse-resize' },
      // Rotation handle 24px above top-center in world coords
      {
        type: 'rot',
        pos: { x: bounds.x + bounds.width / 2, y: bounds.y - 24 / zoom },
        baseCursor: 'grab',
      },
    ]

    return unrotatedHandles.map(h => ({
      type: h.type,
      position: Vector2D.rotate(h.pos, rotRad, center),
      cursor: h.baseCursor,
    }))
  }

  /**
   * Tests if a point hits any transformation handle
   */
  static hitTestHandles(
    p: Point,
    bounds: Rect,
    rotationDeg: number,
    zoom: number
  ): TransformHandleType | null {
    const handleHitRadius = 9 / zoom // World coordinate radius corresponding to ~9px screen space
    const handles = HitTester.getHandles(bounds, rotationDeg, zoom)

    for (const h of handles) {
      if (Vector2D.distance(p, h.position) <= handleHitRadius) {
        return h.type
      }
    }

    return null
  }
}
