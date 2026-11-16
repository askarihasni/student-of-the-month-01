import type { Point } from '../math/Vector2D'
import type { Rect } from '../math/Geometry'
import { Geometry } from '../math/Geometry'

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export const MIN_ZOOM = 0.05 // 5%
export const MAX_ZOOM = 32.0 // 3200%

export class ViewportController {
  /**
   * Converts a screen-space coordinate (mouse on canvas element) to world-space coordinate
   */
  static screenToWorld(screen: Point, viewport: Viewport): Point {
    return {
      x: (screen.x - viewport.x) / viewport.zoom,
      y: (screen.y - viewport.y) / viewport.zoom,
    }
  }

  /**
   * Converts a world-space coordinate to screen-space coordinate
   */
  static worldToScreen(world: Point, viewport: Viewport): Point {
    return {
      x: world.x * viewport.zoom + viewport.x,
      y: world.y * viewport.zoom + viewport.y,
    }
  }

  /**
   * Zooms in or out centered around a specific screen-space focal point (e.g. mouse cursor)
   */
  static zoomAt(
    screenPivot: Point,
    zoomFactor: number,
    viewport: Viewport,
    minZoom = MIN_ZOOM,
    maxZoom = MAX_ZOOM
  ): Viewport {
    const targetZoom = Geometry.clamp(viewport.zoom * zoomFactor, minZoom, maxZoom)
    if (targetZoom === viewport.zoom) return viewport

    // World coordinate before zoom
    const worldPivot = ViewportController.screenToWorld(screenPivot, viewport)

    // Calculate new top-left offset such that worldPivot stays in screenPivot
    return {
      x: screenPivot.x - worldPivot.x * targetZoom,
      y: screenPivot.y - worldPivot.y * targetZoom,
      zoom: targetZoom,
    }
  }

  /**
   * Pans the viewport by delta in screen coordinates
   */
  static pan(dx: number, dy: number, viewport: Viewport): Viewport {
    return {
      x: viewport.x + dx,
      y: viewport.y + dy,
      zoom: viewport.zoom,
    }
  }

  /**
   * Computes viewport that fits the target bounds within canvas dimensions
   */
  static fitBounds(
    bounds: Rect,
    canvasWidth: number,
    canvasHeight: number,
    padding = 60
  ): Viewport {
    if (bounds.width <= 0 || bounds.height <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
      return { x: canvasWidth / 2 - 200, y: canvasHeight / 2 - 150, zoom: 1 }
    }

    const availableWidth = Math.max(100, canvasWidth - padding * 2)
    const availableHeight = Math.max(100, canvasHeight - padding * 2)

    const scaleX = availableWidth / bounds.width
    const scaleY = availableHeight / bounds.height
    const zoom = Geometry.clamp(Math.min(scaleX, scaleY), 0.1, 4.0)

    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2

    return {
      x: canvasWidth / 2 - centerX * zoom,
      y: canvasHeight / 2 - centerY * zoom,
      zoom,
    }
  }
}
