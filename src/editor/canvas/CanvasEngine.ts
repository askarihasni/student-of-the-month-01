import type { DocumentModel, DesignNode, NodeType, EditorTool } from '../../types/document'
import type { Viewport } from '../viewport/ViewportController'
import type { Point } from '../math/Vector2D'
import type { Rect } from '../math/Geometry'
import type { AlignmentGuide } from '../transforms/SnapEngine'
import { ShapeRenderer } from '../rendering/ShapeRenderer'
import { OverlayRenderer } from '../rendering/OverlayRenderer'
import { GridRenderer } from '../rendering/GridRenderer'
import { NodeUtils } from '../model/nodeUtils'

export interface CanvasRenderState {
  document: DocumentModel | null
  viewport: Viewport
  selectedNodeIds: string[]
  hoverNodeId: string | null
  activeTool: EditorTool
  previewShape: { tool: NodeType; start: Point; current: Point } | null
  marquee: Rect | null
  smartGuides: AlignmentGuide[]
  penPoints: Point[] | null
  currentPointer: Point | null
  isDarkTheme?: boolean
}

export class CanvasEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrameId: number | null = null
  private isDestroyed = false
  private currentState: CanvasRenderState | null = null
  private isDirty = true

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Could not acquire 2D canvas context')
    this.ctx = ctx

    this.startLoop()
  }

  /**
   * Resizes canvas to match container with high-DPI scaling
   */
  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.round(width * dpr)
    this.canvas.height = Math.round(height * dpr)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)
    this.markDirty()
  }

  /**
   * Updates state to render on next animation frame
   */
  setState(state: CanvasRenderState): void {
    this.currentState = state
    this.markDirty()
  }

  markDirty(): void {
    this.isDirty = true
  }

  private startLoop(): void {
    const render = () => {
      if (this.isDestroyed) return

      if (this.isDirty && this.currentState) {
        this.renderFrame(this.currentState)
        this.isDirty = false
      }

      this.animationFrameId = requestAnimationFrame(render)
    }

    this.animationFrameId = requestAnimationFrame(render)
  }

  private renderFrame(state: CanvasRenderState): void {
    const { canvas, ctx } = this
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    if (width <= 0 || height <= 0) return

    const {
      document,
      viewport,
      selectedNodeIds,
      hoverNodeId,
      previewShape,
      marquee,
      smartGuides,
      penPoints,
      currentPointer,
      isDarkTheme = true,
    } = state

    // 1. Clear background
    const activePage = document?.pages.find(p => p.id === document.activePageId) || document?.pages[0]
    const bgColor = activePage?.backgroundColor || (isDarkTheme ? '#1E1E1E' : '#F3F4F6')

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // 2. Apply Viewport Transform
    ctx.save()
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)

    // 3. Render Adaptive Grid
    GridRenderer.render(ctx, width, height, viewport, isDarkTheme)

    // 4. Render Document Nodes
    const nodes = activePage?.nodes || []
    for (const node of nodes) {
      ShapeRenderer.renderNode(ctx, node)
    }

    // 5. Render Active Drawing Shape Preview
    if (previewShape) {
      OverlayRenderer.renderShapePreview(
        ctx,
        previewShape.tool,
        previewShape.start,
        previewShape.current,
        viewport.zoom
      )
    }

    // 6. Render Pen Tool Progress
    if (penPoints && penPoints.length > 0) {
      OverlayRenderer.renderPenProgress(ctx, penPoints, currentPointer, viewport.zoom)
    }

    // 7. Render Hover Outline (if node is not currently selected)
    if (hoverNodeId && !selectedNodeIds.includes(hoverNodeId)) {
      const hoverNode = nodes.find(n => n.id === hoverNodeId)
      if (hoverNode) {
        OverlayRenderer.renderHoverOutline(ctx, hoverNode, viewport.zoom)
      }
    }

    // 8. Render Selection Bounds & Transform Handles
    if (selectedNodeIds.length > 0) {
      const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
      if (selectedNodes.length === 1) {
        const single = selectedNodes[0]
        const base = NodeUtils.getBaseRect(single)
        OverlayRenderer.renderSelection(ctx, base, single.rotation, viewport.zoom)
      } else if (selectedNodes.length > 1) {
        const combinedBounds = NodeUtils.getNodesAABB(selectedNodes)
        OverlayRenderer.renderSelection(ctx, combinedBounds, 0, viewport.zoom)
      }
    }

    // 9. Render Smart Alignment Guides
    if (smartGuides && smartGuides.length > 0) {
      OverlayRenderer.renderSmartGuides(ctx, smartGuides, viewport.zoom)
    }

    // 10. Render Marquee Box
    if (marquee) {
      OverlayRenderer.renderMarquee(ctx, marquee, viewport.zoom)
    }

    ctx.restore()
  }

  destroy(): void {
    this.isDestroyed = true
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
}
