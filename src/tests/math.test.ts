import { describe, it, expect } from 'vitest'
import { Vector2D } from '../editor/math/Vector2D'
import { Matrix3x3 } from '../editor/math/Matrix3x3'
import { Geometry } from '../editor/math/Geometry'
import { Bezier } from '../editor/math/Bezier'

describe('Vector2D math', () => {
  it('adds and subtracts vectors correctly', () => {
    const a = { x: 10, y: 20 }
    const b = { x: 5, y: 15 }
    expect(Vector2D.add(a, b)).toEqual({ x: 15, y: 35 })
    expect(Vector2D.subtract(a, b)).toEqual({ x: 5, y: 5 })
  })

  it('calculates distance and length', () => {
    const p = { x: 3, y: 4 }
    expect(Vector2D.length(p)).toBe(5)
    expect(Vector2D.distance({ x: 0, y: 0 }, { x: 6, y: 8 })).toBe(10)
  })

  it('normalizes vector', () => {
    const p = { x: 10, y: 0 }
    expect(Vector2D.normalize(p)).toEqual({ x: 1, y: 0 })
    expect(Vector2D.normalize({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 })
  })

  it('rotates vector around pivot', () => {
    const p = { x: 10, y: 0 }
    const rotated = Vector2D.rotate(p, Math.PI / 2, { x: 0, y: 0 })
    expect(rotated.x).toBeCloseTo(0)
    expect(rotated.y).toBeCloseTo(10)
  })
})

describe('Matrix3x3 affine transformations', () => {
  it('identity matrix preserves points', () => {
    const id = Matrix3x3.identity()
    const p = { x: 15, y: 35 }
    expect(Matrix3x3.applyToPoint(id, p)).toEqual(p)
  })

  it('translation moves points correctly', () => {
    const t = Matrix3x3.translation(50, -20)
    const p = { x: 10, y: 10 }
    expect(Matrix3x3.applyToPoint(t, p)).toEqual({ x: 60, y: -10 })
  })

  it('scaling transforms points', () => {
    const s = Matrix3x3.scaling(2, 3)
    const p = { x: 10, y: 20 }
    expect(Matrix3x3.applyToPoint(s, p)).toEqual({ x: 20, y: 60 })
  })

  it('multiplication combines translation and scaling', () => {
    const t = Matrix3x3.translation(100, 50)
    const s = Matrix3x3.scaling(2, 2)
    // First scale, then translate
    const m = Matrix3x3.multiply(t, s)
    const p = { x: 10, y: 10 }
    // Scale (10*2, 10*2) = (20, 20), then translate + (100, 50) = (120, 70)
    expect(Matrix3x3.applyToPoint(m, p)).toEqual({ x: 120, y: 70 })
  })

  it('inversion correctly reverses transformation', () => {
    const m = Matrix3x3.compose(40, 60, 2, 2, Math.PI / 4)
    const inv = Matrix3x3.inverse(m)
    const original = { x: 25, y: 75 }
    const transformed = Matrix3x3.applyToPoint(m, original)
    const restored = Matrix3x3.applyToPoint(inv, transformed)

    expect(restored.x).toBeCloseTo(original.x)
    expect(restored.y).toBeCloseTo(original.y)
  })

  it('decomposes matrix accurately', () => {
    const originalX = 120
    const originalY = 80
    const scaleX = 2
    const scaleY = 1.5
    const rot = 0.5

    const m = Matrix3x3.compose(originalX, originalY, scaleX, scaleY, rot)
    const decomp = Matrix3x3.decompose(m)

    expect(decomp.x).toBeCloseTo(originalX)
    expect(decomp.y).toBeCloseTo(originalY)
    expect(decomp.scaleX).toBeCloseTo(scaleX)
    expect(decomp.scaleY).toBeCloseTo(scaleY)
    expect(decomp.rotation).toBeCloseTo(rot)
  })
})

describe('Geometry utilities', () => {
  it('pointInRect accurately detects containment', () => {
    const rect = { x: 10, y: 20, width: 100, height: 50 }
    expect(Geometry.pointInRect({ x: 50, y: 40 }, rect)).toBe(true)
    expect(Geometry.pointInRect({ x: 5, y: 40 }, rect)).toBe(false)
    expect(Geometry.pointInRect({ x: 120, y: 40 }, rect)).toBe(false)
  })

  it('pointInRotatedRect detects rotated points', () => {
    // A 100x100 square at (0, 0) rotated 45 deg around center (50, 50)
    const rect = { x: 0, y: 0, width: 100, height: 100 }
    const center = { x: 50, y: 50 }
    const rot = Math.PI / 4 // 45 degrees

    // The center is always inside
    expect(Geometry.pointInRotatedRect(center, rect, rot, center)).toBe(true)
  })

  it('pointInEllipse detects elliptical bounds', () => {
    const rect = { x: 0, y: 0, width: 100, height: 50 }
    // Center is (50, 25)
    expect(Geometry.pointInEllipse({ x: 50, y: 25 }, rect)).toBe(true)
    // Corner (0, 0) is outside the inscribed ellipse
    expect(Geometry.pointInEllipse({ x: 0, y: 0 }, rect)).toBe(false)
  })

  it('distanceToSegment calculates perpendicular and endpoint distances', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 100, y: 0 }
    // Point directly above segment
    expect(Geometry.distanceToSegment({ x: 50, y: 20 }, a, b)).toBe(20)
    // Point past the right end
    expect(Geometry.distanceToSegment({ x: 110, y: 0 }, a, b)).toBe(10)
    // Point before the left end
    expect(Geometry.distanceToSegment({ x: -15, y: 0 }, a, b)).toBe(15)
  })

  it('computes union and intersection of rectangles', () => {
    const r1 = { x: 0, y: 0, width: 50, height: 50 }
    const r2 = { x: 25, y: 25, width: 50, height: 50 }
    const r3 = { x: 100, y: 100, width: 20, height: 20 }

    expect(Geometry.rectsIntersect(r1, r2)).toBe(true)
    expect(Geometry.rectsIntersect(r1, r3)).toBe(false)

    const union = Geometry.unionRects([r1, r2])
    expect(union).toEqual({ x: 0, y: 0, width: 75, height: 75 })
  })
})

describe('Bezier curve calculations', () => {
  it('evaluates cubic bezier at endpoints and midpoint', () => {
    const p0 = { x: 0, y: 0 }
    const p1 = { x: 0, y: 100 }
    const p2 = { x: 100, y: 100 }
    const p3 = { x: 100, y: 0 }

    expect(Bezier.evaluateCubic(p0, p1, p2, p3, 0)).toEqual(p0)
    expect(Bezier.evaluateCubic(p0, p1, p2, p3, 1)).toEqual(p3)

    const mid = Bezier.evaluateCubic(p0, p1, p2, p3, 0.5)
    expect(mid.x).toBeCloseTo(50)
    expect(mid.y).toBeCloseTo(75)
  })
})

