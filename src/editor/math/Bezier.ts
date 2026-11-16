import type { Point } from './Vector2D'
import { Vector2D } from './Vector2D'
import type { Rect } from './Geometry'
import { Geometry } from './Geometry'

export interface BezierNode {
  id: string
  point: Point
  handleIn?: Point // Relative or absolute control point before
  handleOut?: Point // Relative or absolute control point after
}

export class Bezier {
  /**
   * Evaluates a cubic Bézier curve at parameter t in [0, 1]
   * B(t) = (1-t)^3*p0 + 3*(1-t)^2*t*p1 + 3*(1-t)*t^2*p2 + t^3*p3
   */
  static evaluateCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const mt = 1 - t
    const mt2 = mt * mt
    const mt3 = mt2 * mt
    const t2 = t * t
    const t3 = t2 * t

    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    }
  }

  /**
   * Samples a cubic Bézier segment into discrete points
   */
  static sampleCubic(p0: Point, p1: Point, p2: Point, p3: Point, steps = 20): Point[] {
    const points: Point[] = []
    for (let i = 0; i <= steps; i++) {
      points.push(Bezier.evaluateCubic(p0, p1, p2, p3, i / steps))
    }
    return points
  }

  /**
   * Approximate shortest distance from a point to a cubic Bézier segment
   */
  static distanceToCubicSegment(p: Point, p0: Point, p1: Point, p2: Point, p3: Point, steps = 20): number {
    const samples = Bezier.sampleCubic(p0, p1, p2, p3, steps)
    let minDistance = Infinity

    for (let i = 0; i < samples.length - 1; i++) {
      const d = Geometry.distanceToSegment(p, samples[i], samples[i + 1])
      if (d < minDistance) {
        minDistance = d
      }
    }

    return minDistance
  }

  /**
   * Computes bounding box of a cubic Bézier curve including control points
   */
  static getCubicBounds(p0: Point, p1: Point, p2: Point, p3: Point): Rect {
    // Quick sampling for tight bounds
    const samples = Bezier.sampleCubic(p0, p1, p2, p3, 30)
    return Geometry.getBoundsForPoints(samples)
  }
}
