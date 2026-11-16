export interface Point {
  x: number
  y: number
}

export class Vector2D {
  static create(x = 0, y = 0): Point {
    return { x, y }
  }

  static clone(p: Point): Point {
    return { x: p.x, y: p.y }
  }

  static add(a: Point, b: Point): Point {
    return { x: a.x + b.x, y: a.y + b.y }
  }

  static subtract(a: Point, b: Point): Point {
    return { x: a.x - b.x, y: a.y - b.y }
  }

  static scale(p: Point, factor: number): Point {
    return { x: p.x * factor, y: p.y * factor }
  }

  static dot(a: Point, b: Point): number {
    return a.x * b.x + a.y * b.y
  }

  static cross(a: Point, b: Point): number {
    return a.x * b.y - a.y * b.x
  }

  static length(p: Point): number {
    return Math.hypot(p.x, p.y)
  }

  static lengthSq(p: Point): number {
    return p.x * p.x + p.y * p.y
  }

  static distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y)
  }

  static distanceSq(a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return dx * dx + dy * dy
  }

  static normalize(p: Point): Point {
    const len = Math.hypot(p.x, p.y)
    if (len === 0) return { x: 0, y: 0 }
    return { x: p.x / len, y: p.y / len }
  }

  static rotate(p: Point, angleRad: number, pivot: Point = { x: 0, y: 0 }): Point {
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)
    const dx = p.x - pivot.x
    const dy = p.y - pivot.y
    return {
      x: pivot.x + (dx * cos - dy * sin),
      y: pivot.y + (dx * sin + dy * cos),
    }
  }

  static angle(a: Point, b: Point): number {
    return Math.atan2(b.y - a.y, b.x - a.x)
  }

  static lerp(a: Point, b: Point, t: number): Point {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    }
  }
}
