import type { Viewport } from '../viewport/ViewportController'
import { ViewportController } from '../viewport/ViewportController'

export class GridRenderer {
  /**
   * Renders an infinite adaptive dot/line grid on the canvas
   */
  static render(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    viewport: Viewport,
    isDark = true
  ): void {
    ctx.save()

    // Determine grid step in world coordinates based on zoom level
    let baseStep = 20
    if (viewport.zoom < 0.25) {
      baseStep = 100
    } else if (viewport.zoom < 0.5) {
      baseStep = 50
    } else if (viewport.zoom > 3) {
      baseStep = 10
    }

    const topLeftWorld = ViewportController.screenToWorld({ x: 0, y: 0 }, viewport)
    const bottomRightWorld = ViewportController.screenToWorld(
      { x: canvasWidth, y: canvasHeight },
      viewport
    )

    const startX = Math.floor(topLeftWorld.x / baseStep) * baseStep
    const endX = Math.ceil(bottomRightWorld.x / baseStep) * baseStep
    const startY = Math.floor(topLeftWorld.y / baseStep) * baseStep
    const endY = Math.ceil(bottomRightWorld.y / baseStep) * baseStep

    const dotColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'
    const axisColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.15)'

    ctx.fillStyle = dotColor
    const dotRadius = Math.max(0.75, 1 / viewport.zoom)

    // Render grid dots
    for (let x = startX; x <= endX; x += baseStep) {
      for (let y = startY; y <= endY; y += baseStep) {
        // Skip (0, 0) for axes
        if (x === 0 && y === 0) continue

        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Render world origin axes (X=0 and Y=0 subtle guides)
    ctx.strokeStyle = axisColor
    ctx.lineWidth = 1 / viewport.zoom

    // X-axis (Y = 0)
    if (topLeftWorld.y <= 0 && bottomRightWorld.y >= 0) {
      ctx.beginPath()
      ctx.moveTo(topLeftWorld.x, 0)
      ctx.lineTo(bottomRightWorld.x, 0)
      ctx.stroke()
    }

    // Y-axis (X = 0)
    if (topLeftWorld.x <= 0 && bottomRightWorld.x >= 0) {
      ctx.beginPath()
      ctx.moveTo(0, topLeftWorld.y)
      ctx.lineTo(0, bottomRightWorld.y)
      ctx.stroke()
    }

    ctx.restore()
  }
}
