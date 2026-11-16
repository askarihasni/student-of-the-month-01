import type { Point } from './Vector2D'
import { Vector2D } from './Vector2D'
import type { MatrixTuple } from './Matrix3x3'
import { Matrix3x3 } from './Matrix3x3'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export class Geometry {
  /**
   * Normalizes a rectangle so width and height are non-negative
   */
  static normalizeRect(rect: Rect): Rect {
    let { x, y, width, height } = rect
    if (width < 0) {
      x += width
      width = Math.abs(width)
    }
    if (height < 0) {
      y += height
      height = Math.abs(height)
    }
    return { x, y, width, height }
  }

  /**
   * Checks if an axis-aligned point is inside an axis-aligned rectangle
   */
  static pointInRect(p: Point, rect: Rect): boolean {
    const norm = Geometry.normalizeRect(rect)
    return (
      p.x >= norm.x &&
      p.x <= norm.x + norm.width &&
      p.y >= norm.y &&
      p.y <= norm.y + norm.height
    )
  }

  /**
   * Checks if a point is inside a rectangle that may be rotated
   */
  static pointInRotatedRect(
    p: Point,
    rect: Rect,
    rotationRad: number,
    pivot?: Point
  ): boolean {
    const center = pivot || {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }

    // Inverse rotate the point back into local rectangle coordinates
    const unrotated = Vector2D.rotate(p, -rotationRad, center)
    return Geometry.pointInRect(unrotated, rect)
  }

  /**
   * Checks if a point is inside an ellipse
   */
  static pointInEllipse(
    p: Point,
    rect: Rect,
    rotationRad = 0
  ): boolean {
    const center: Point = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }
    const unrotated = Vector2D.rotate(p, -rotationRad, center)

    const rx = Math.max(0.001, Math.abs(rect.width) / 2)
    const ry = Math.max(0.001, Math.abs(rect.height) / 2)

    const dx = unrotated.x - center.x
    const dy = unrotated.y - center.y

    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1
  }

  /**
   * Shortest distance from a point to a line segment [a, b]
   */
  static distanceToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const lenSq = dx * dx + dy * dy

    if (lenSq === 0) return Vector2D.distance(p, a)

    // Project p onto segment, clamped between 0 and 1
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq))
    const proj: Point = { x: a.x + t * dx, y: a.y + t * dy }

    return Vector2D.distance(p, proj)
  }

  /**
   * Ray-casting algorithm to test if point is inside an arbitrary polygon
   */
  static pointInPolygon(p: Point, polygon: Point[]): boolean {
    let inside = false
    const n = polygon.length

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x
      const yi = polygon[i].y
      const xj = polygon[j].x
      const yj = polygon[j].y

      const intersect =
        yi > p.y !== yj > p.y &&
        p.x < ((xj - xi) * (p.y - yi)) / (yj - yi || 1e-9) + xi

      if (intersect) inside = !inside
    }

    return inside
  }

  /**
   * Calculates the 4 corner points of a rectangle
   */
  static getRectCorners(rect: Rect): [Point, Point, Point, Point] {
    return [
      { x: rect.x, y: rect.y }, // top-left
      { x: rect.x + rect.width, y: rect.y }, // top-right
      { x: rect.x + rect.width, y: rect.y + rect.height }, // bottom-right
      { x: rect.x, y: rect.y + rect.height }, // bottom-left
    ]
  }

  /**
   * Calculates the rotated 4 corner points of a rectangle
   */
  static getRotatedRectCorners(
    rect: Rect,
    rotationRad: number,
    pivot?: Point
  ): [Point, Point, Point, Point] {
    const corners = Geometry.getRectCorners(rect)
    const center = pivot || {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }
    return corners.map(c => Vector2D.rotate(c, rotationRad, center)) as [
      Point,
      Point,
      Point,
      Point,
    ]
  }

  /**
   * Computes the axis-aligned bounding box (AABB) enclosing a set of points
   */
  static getBoundsForPoints(points: Point[]): Rect {
    if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const p of points) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  /**
   * Union of multiple bounding boxes
   */
  static unionRects(rects: Rect[]): Rect {
    if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const r of rects) {
      const norm = Geometry.normalizeRect(r)
      if (norm.x < minX) minX = norm.x
      if (norm.y < minY) minY = norm.y
      if (norm.x + norm.width > maxX) maxX = norm.x + norm.width
      if (norm.y + norm.height > maxY) maxY = norm.y + norm.height
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  /**
   * Tests if two axis-aligned bounding boxes overlap
   */
  static rectsIntersect(a: Rect, b: Rect): boolean {
    const na = Geometry.normalizeRect(a)
    const nb = Geometry.normalizeRect(b)

    return !(
      na.x + na.width < nb.x ||
      na.x > nb.x + nb.width ||
      na.y + na.height < nb.y ||
      na.y > nb.y + nb.height
    )
  }

  /**
   * Tests if rect 'outer' completely contains rect 'inner'
   */
  static rectContainsRect(outer: Rect, inner: Rect): boolean {
    const no = Geometry.normalizeRect(outer)
    const ni = Geometry.normalizeRect(inner)

    return (
      ni.x >= no.x &&
      ni.y >= no.y &&
      ni.x + ni.width <= no.x + no.width &&
      ni.y + ni.height <= no.y + no.height
    )
  }

  /**
   * Clamps a value between min and max
   */
  static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val))
  }
}

