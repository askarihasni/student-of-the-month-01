import type { Point } from './Vector2D'

/**
 * 2D Affine Transformation Matrix represented as a 6-tuple [a, b, c, d, e, f]:
 *
 * [ a  c  e ]   [ x ]   [ a*x + c*y + e ]
 * [ b  d  f ] * [ y ] = [ b*x + d*y + f ]
 * [ 0  0  1 ]   [ 1 ]   [       1       ]
 *
 * Matches HTML5 Canvas 2D ctx.transform(a, b, c, d, e, f)
 */
export type MatrixTuple = [number, number, number, number, number, number]

export class Matrix3x3 {
  /**
   * Identity Matrix [1, 0, 0, 1, 0, 0]
   */
  static identity(): MatrixTuple {
    return [1, 0, 0, 1, 0, 0]
  }

  /**
   * Creates a translation matrix
   */
  static translation(tx: number, ty: number): MatrixTuple {
    return [1, 0, 0, 1, tx, ty]
  }

  /**
   * Creates a scaling matrix, optionally around a pivot point
   */
  static scaling(sx: number, sy: number, cx = 0, cy = 0): MatrixTuple {
    if (cx === 0 && cy === 0) {
      return [sx, 0, 0, sy, 0, 0]
    }
    // T(cx, cy) * S(sx, sy) * T(-cx, -cy)
    return [
      sx,
      0,
      0,
      sy,
      cx - sx * cx,
      cy - sy * cy,
    ]
  }

  /**
   * Creates a rotation matrix in radians, optionally around a pivot point
   */
  static rotation(rad: number, cx = 0, cy = 0): MatrixTuple {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    if (cx === 0 && cy === 0) {
      return [cos, sin, -sin, cos, 0, 0]
    }
    // T(cx, cy) * R(rad) * T(-cx, -cy)
    return [
      cos,
      sin,
      -sin,
      cos,
      cx - (cos * cx - sin * cy),
      cy - (sin * cx + cos * cy),
    ]
  }

  /**
   * Multiplies two affine matrices: m1 * m2
   */
  static multiply(m1: MatrixTuple, m2: MatrixTuple): MatrixTuple {
    const [a1, b1, c1, d1, e1, f1] = m1
    const [a2, b2, c2, d2, e2, f2] = m2

    return [
      a1 * a2 + c1 * b2,
      b1 * a2 + d1 * b2,
      a1 * c2 + c1 * d2,
      b1 * c2 + d1 * d2,
      a1 * e2 + c1 * f2 + e1,
      b1 * e2 + d1 * f2 + f1,
    ]
  }

  /**
   * Calculates the determinant of the 2x2 linear portion
   */
  static determinant(m: MatrixTuple): number {
    return m[0] * m[3] - m[1] * m[2]
  }

  /**
   * Inverts an affine matrix. Returns identity if determinant is near 0.
   */
  static inverse(m: MatrixTuple): MatrixTuple {
    const [a, b, c, d, e, f] = m
    const det = a * d - b * c

    if (Math.abs(det) < 1e-12) {
      return Matrix3x3.identity()
    }

    const invDet = 1 / det

    return [
      d * invDet,
      -b * invDet,
      -c * invDet,
      a * invDet,
      (c * f - d * e) * invDet,
      (b * e - a * f) * invDet,
    ]
  }

  /**
   * Applies the matrix transformation to a 2D point [x, y, 1]
   */
  static applyToPoint(m: MatrixTuple, p: Point): Point {
    return {
      x: m[0] * p.x + m[2] * p.y + m[4],
      y: m[1] * p.x + m[3] * p.y + m[5],
    }
  }

  /**
   * Applies the matrix transformation to multiple points
   */
  static applyToPoints(m: MatrixTuple, points: Point[]): Point[] {
    return points.map(p => Matrix3x3.applyToPoint(m, p))
  }

  /**
   * Applies transformation to a direction vector (ignores translation e, f)
   */
  static applyToVector(m: MatrixTuple, v: Point): Point {
    return {
      x: m[0] * v.x + m[2] * v.y,
      y: m[1] * v.x + m[3] * v.y,
    }
  }

  /**
   * Composes a transform from position, scale, rotation, and origin
   */
  static compose(
    x: number,
    y: number,
    scaleX = 1,
    scaleY = 1,
    rotationRad = 0,
    originX = 0,
    originY = 0
  ): MatrixTuple {
    const t = Matrix3x3.translation(x, y)
    const r = Matrix3x3.rotation(rotationRad, originX, originY)
    const s = Matrix3x3.scaling(scaleX, scaleY, originX, originY)
    return Matrix3x3.multiply(t, Matrix3x3.multiply(r, s))
  }

  /**
   * Decomposes the affine matrix into translation, scale, and rotation (in radians)
   */
  static decompose(m: MatrixTuple): {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotation: number
  } {
    const [a, b, c, d, e, f] = m

    const scaleX = Math.hypot(a, b)
    const scaleY = Math.hypot(c, d)

    // Check determinant for reflection
    const det = a * d - b * c
    const signY = det < 0 ? -1 : 1

    const rotation = Math.atan2(b, a)

    return {
      x: e,
      y: f,
      scaleX,
      scaleY: scaleY * signY,
      rotation,
    }
  }
}
