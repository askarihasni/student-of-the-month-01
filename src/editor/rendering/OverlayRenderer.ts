import type { Point } from '../math/Vector2D'
import { Vector2D } from '../math/Vector2D'
import type { Rect } from '../math/Geometry'
import { HitTester } from '../selection/HitTester'
import type { AlignmentGuide } from '../transforms/SnapEngine'
import type { DesignNode, NodeType } from '../../types/document'
import { NodeUtils } from '../model/nodeUtils'

export class OverlayRenderer {
  /**
   * Draws selection bounding box, 8 resize handles, and rotation handle
   */
  static renderSelection(
    ctx: CanvasRenderingContext2D,
    bounds: Rect,
    rotationDeg: number,
    zoom: number
  ): void {
    if (bounds.width <= 0 && bounds.height <= 0) return

    ctx.save()

    const rotRad = (rotationDeg * Math.PI) / 180
    const center: Point = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    }

    // Apply rotation for bounding box outline
    ctx.translate(center.x, center.y)
    ctx.rotate(rotRad)
    ctx.translate(-center.x, -center.y)

    // Selection border
    ctx.strokeStyle = '#0D99FF'
    ctx.lineWidth = 1.5 / zoom
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)

    // Rotation handle stem line
    const rotStemY = bounds.y - 20 / zoom
    ctx.beginPath()
    ctx.moveTo(bounds.x + bounds.width / 2, bounds.y)
    ctx.lineTo(bounds.x + bounds.width / 2, rotStemY)
    ctx.strokeStyle = '#0D99FF'
    ctx.lineWidth = 1.2 / zoom
    ctx.stroke()

    // Rotation handle circle
    ctx.beginPath()
    ctx.arc(bounds.x + bounds.width / 2, rotStemY, 4 / zoom, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#0D99FF'
    ctx.lineWidth = 1.5 / zoom
    ctx.stroke()

    // 8 resize handles
    const handleSize = 7 / zoom
    const halfSize = handleSize / 2

    const handlePositions: Point[] = [
      { x: bounds.x, y: bounds.y }, // tl
      { x: bounds.x + bounds.width / 2, y: bounds.y }, // tc
      { x: bounds.x + bounds.width, y: bounds.y }, // tr
      { x: bounds.x, y: bounds.y + bounds.height / 2 }, // ml
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // mr
      { x: bounds.x, y: bounds.y + bounds.height }, // bl
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // bc
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // br
    ]

    for (const h of handlePositions) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(h.x - halfSize, h.y - halfSize, handleSize, handleSize)
      ctx.strokeStyle = '#0D99FF'
      ctx.lineWidth = 1.5 / zoom
      ctx.strokeRect(h.x - halfSize, h.y - halfSize, handleSize, handleSize)
    }

    ctx.restore()
  }

  /**
   * Draws subtle hover outline around unselected node
   */
  static renderHoverOutline(
    ctx: CanvasRenderingContext2D,
    node: DesignNode,
    zoom: number
  ): void {
    ctx.save()
    const bounds = NodeUtils.getBaseRect(node)
    const rotRad = (node.rotation * Math.PI) / 180
    const center = NodeUtils.getNodeCenter(node)

    ctx.translate(center.x, center.y)
    ctx.rotate(rotRad)
    ctx.translate(-center.x, -center.y)

    ctx.strokeStyle = 'rgba(13, 153, 255, 0.6)'
    ctx.lineWidth = 1.2 / zoom
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)

    ctx.restore()
  }

  /**
   * Draws semi-transparent marquee drag selection box
   */
  static renderMarquee(ctx: CanvasRenderingContext2D, marquee: Rect, zoom: number): void {
    ctx.save()
    ctx.fillStyle = 'rgba(13, 153, 255, 0.08)'
    ctx.fillRect(marquee.x, marquee.y, marquee.width, marquee.height)

    ctx.strokeStyle = '#0D99FF'
    ctx.lineWidth = 1 / zoom
    ctx.setLineDash([4 / zoom, 3 / zoom])
    ctx.strokeRect(marquee.x, marquee.y, marquee.width, marquee.height)
    ctx.restore()
  }

  /**
   * Draws magenta smart alignment guide lines
   */
  static renderSmartGuides(
    ctx: CanvasRenderingContext2D,
    guides: AlignmentGuide[],
    zoom: number
  ): void {
    if (guides.length === 0) return

    ctx.save()
    ctx.strokeStyle = '#EC4899'
    ctx.lineWidth = 1 / zoom
    ctx.setLineDash([3 / zoom, 3 / zoom])

    for (const guide of guides) {
      ctx.beginPath()
      if (guide.orientation === 'vertical') {
        ctx.moveTo(guide.position, guide.start)
        ctx.lineTo(guide.position, guide.end)
      } else {
        ctx.moveTo(guide.start, guide.position)
        ctx.lineTo(guide.end, guide.position)
      }
      ctx.stroke()
    }

    ctx.restore()
  }

  /**
   * Draws active shape preview while creating a new rectangle, ellipse, line, frame
   */
  static renderShapePreview(
    ctx: CanvasRenderingContext2D,
    tool: NodeType,
    start: Point,
    current: Point,
    zoom: number
  ): void {
    ctx.save()
    ctx.strokeStyle = '#0D99FF'
    ctx.lineWidth = 1.5 / zoom
    ctx.setLineDash([4 / zoom, 4 / zoom])

    const x = Math.min(start.x, current.x)
    const y = Math.min(start.y, current.y)
    const width = Math.abs(current.x - start.x)
    const height = Math.abs(current.y - start.y)

    switch (tool) {
      case 'rectangle':
      case 'frame': {
        ctx.fillStyle = tool === 'frame' ? 'rgba(30, 30, 36, 0.4)' : 'rgba(13, 153, 255, 0.1)'
        ctx.fillRect(x, y, width, height)
        ctx.strokeRect(x, y, width, height)
        break
      }
      case 'ellipse': {
        ctx.beginPath()
        const rx = width / 2
        const ry = height / 2
        ctx.ellipse(x + rx, y + ry, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'
        ctx.fill()
        ctx.stroke()
        break
      }
      case 'line': {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(current.x, current.y)
        ctx.stroke()
        break
      }
    }

    ctx.restore()
  }

  /**
   * Draws pen tool progress and handles
   */
  static renderPenProgress(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    currentPointer: Point | null,
    zoom: number
  ): void {
    if (points.length === 0) return

    ctx.save()
    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 1.5 / zoom

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    if (currentPointer) {
      ctx.lineTo(currentPointer.x, currentPointer.y)
    }
    ctx.stroke()

    // Draw anchor points
    for (const p of points) {
      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 1.5 / zoom
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4 / zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    ctx.restore()
  }
}
