import type {
  DesignNode,
  RectangleNode,
  EllipseNode,
  LineNode,
  TextNode,
  FrameNode,
  PathNode,
  ImageNode,
} from '../../types/document'

export class ShapeRenderer {
  private static imageCache = new Map<string, HTMLImageElement>()

  /**
   * Applies common effects: opacity and shadow
   */
  private static applyCommonEffects(
    ctx: CanvasRenderingContext2D,
    node: DesignNode
  ): void {
    ctx.globalAlpha = node.opacity ?? 1

    if ('shadow' in node && node.shadow) {
      ctx.shadowColor = node.shadow.color
      ctx.shadowBlur = node.shadow.blur
      ctx.shadowOffsetX = node.shadow.offsetX
      ctx.shadowOffsetY = node.shadow.offsetY
    } else {
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
  }

  /**
   * Draws a single shape node onto the 2D context in world space
   */
  static renderNode(ctx: CanvasRenderingContext2D, node: DesignNode): void {
    if (!node.visible) return

    ctx.save()

    // Apply rotation around center if specified
    if (node.rotation !== 0 && node.type !== 'line') {
      const cx = 'x' in node ? node.x + (node.width ?? 0) / 2 : 0
      const cy = 'y' in node ? node.y + (node.height ?? 0) / 2 : 0
      ctx.translate(cx, cy)
      ctx.rotate((node.rotation * Math.PI) / 180)
      ctx.translate(-cx, -cy)
    }

    ShapeRenderer.applyCommonEffects(ctx, node)

    switch (node.type) {
      case 'rectangle':
        ShapeRenderer.drawRectangle(ctx, node)
        break
      case 'ellipse':
        ShapeRenderer.drawEllipse(ctx, node)
        break
      case 'line':
        ShapeRenderer.drawLine(ctx, node)
        break
      case 'text':
        ShapeRenderer.drawText(ctx, node)
        break
      case 'frame':
        ShapeRenderer.drawFrame(ctx, node)
        break
      case 'path':
        ShapeRenderer.drawPath(ctx, node)
        break
      case 'image':
        ShapeRenderer.drawImage(ctx, node)
        break
      case 'group':
        // Groups don't render directly, their children render in order
        break
    }

    ctx.restore()
  }

  static drawRectangle(ctx: CanvasRenderingContext2D, node: RectangleNode): void {
    ctx.beginPath()
    const radius = Math.min(node.cornerRadius || 0, Math.min(node.width, node.height) / 2)

    if (radius > 0 && typeof ctx.roundRect === 'function') {
      ctx.roundRect(node.x, node.y, node.width, node.height, radius)
    } else {
      ctx.rect(node.x, node.y, node.width, node.height)
    }

    if (node.fill && node.fill !== 'transparent') {
      ctx.fillStyle = node.fill
      ctx.fill()
    }

    if (node.stroke && node.strokeWidth > 0 && node.stroke !== 'transparent') {
      ctx.strokeStyle = node.stroke
      ctx.lineWidth = node.strokeWidth
      ctx.stroke()
    }
  }

  static drawEllipse(ctx: CanvasRenderingContext2D, node: EllipseNode): void {
    ctx.beginPath()
    const rx = Math.max(0.1, Math.abs(node.width) / 2)
    const ry = Math.max(0.1, Math.abs(node.height) / 2)
    const cx = node.x + rx
    const cy = node.y + ry

    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)

    if (node.fill && node.fill !== 'transparent') {
      ctx.fillStyle = node.fill
      ctx.fill()
    }

    if (node.stroke && node.strokeWidth > 0 && node.stroke !== 'transparent') {
      ctx.strokeStyle = node.stroke
      ctx.lineWidth = node.strokeWidth
      ctx.stroke()
    }
  }

  static drawLine(ctx: CanvasRenderingContext2D, node: LineNode): void {
    ctx.beginPath()
    ctx.moveTo(node.x1, node.y1)
    ctx.lineTo(node.x2, node.y2)

    ctx.strokeStyle = node.stroke || '#FFFFFF'
    ctx.lineWidth = node.strokeWidth || 1
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  static drawText(ctx: CanvasRenderingContext2D, node: TextNode): void {
    const italic = node.fontStyle === 'italic' ? 'italic ' : ''
    const weight = node.fontWeight || 'normal'
    const size = node.fontSize || 16
    const family = node.fontFamily || 'Inter, sans-serif'
    ctx.font = `${italic}${weight} ${size}px ${family}`
    ctx.fillStyle = node.fill || '#FFFFFF'
    ctx.textBaseline = 'top'

    if ('letterSpacing' in ctx && typeof node.letterSpacing === 'number' && node.letterSpacing !== 0) {
      try {
        (ctx as any).letterSpacing = `${node.letterSpacing}px`
      } catch {
        // ignore if not supported in test environment
      }
    }

    let startX = node.x
    if (node.textAlign === 'center') {
      ctx.textAlign = 'center'
      startX = node.x + node.width / 2
    } else if (node.textAlign === 'right') {
      ctx.textAlign = 'right'
      startX = node.x + node.width
    } else {
      ctx.textAlign = 'left'
    }

    // Split multi-line text
    const lines = (node.text || '').split('\n')
    const lineHeightRatio = node.lineHeight ? node.lineHeight / size : 1.3
    const lineHeight = size * lineHeightRatio

    lines.forEach((line, index) => {
      const lineY = node.y + index * lineHeight
      ctx.fillText(line, startX, lineY)

      // Render text decoration (underline / line-through)
      if (node.textDecoration === 'underline' || node.textDecoration === 'line-through') {
        const textMetrics = ctx.measureText(line)
        const textWidth = textMetrics.width
        let lineStartX = startX
        if (node.textAlign === 'center') {
          lineStartX = startX - textWidth / 2
        } else if (node.textAlign === 'right') {
          lineStartX = startX - textWidth
        }

        ctx.save()
        ctx.strokeStyle = node.fill || '#FFFFFF'
        ctx.lineWidth = Math.max(1, Math.round(size / 14))
        ctx.beginPath()

        if (node.textDecoration === 'underline') {
          const underY = lineY + size * 1.15
          ctx.moveTo(lineStartX, underY)
          ctx.lineTo(lineStartX + textWidth, underY)
        } else if (node.textDecoration === 'line-through') {
          const strikeY = lineY + size * 0.55
          ctx.moveTo(lineStartX, strikeY)
          ctx.lineTo(lineStartX + textWidth, strikeY)
        }

        ctx.stroke()
        ctx.restore()
      }
    })
  }

  static drawFrame(ctx: CanvasRenderingContext2D, node: FrameNode): void {
    ctx.beginPath()
    const radius = Math.min(node.cornerRadius || 0, Math.min(node.width, node.height) / 2)

    if (radius > 0 && typeof ctx.roundRect === 'function') {
      ctx.roundRect(node.x, node.y, node.width, node.height, radius)
    } else {
      ctx.rect(node.x, node.y, node.width, node.height)
    }

    if (node.fill && node.fill !== 'transparent') {
      ctx.fillStyle = node.fill
      ctx.fill()
    }

    if (node.stroke && (node.strokeWidth ?? 0) > 0 && node.stroke !== 'transparent') {
      ctx.strokeStyle = node.stroke
      ctx.lineWidth = node.strokeWidth!
      ctx.stroke()
    }

    // Label tag above frame (Figma-style)
    ctx.save()
    ctx.font = '11px Inter, sans-serif'
    ctx.fillStyle = '#71717A'
    ctx.textBaseline = 'bottom'
    ctx.fillText(node.name, node.x, node.y - 6)
    ctx.restore()
  }

  static drawPath(ctx: CanvasRenderingContext2D, node: PathNode): void {
    if (node.points.length < 2) return

    ctx.beginPath()
    const p0 = node.points[0].point
    ctx.moveTo(p0.x, p0.y)

    for (let i = 0; i < node.points.length - 1; i++) {
      const current = node.points[i]
      const next = node.points[i + 1]

      const cp1 = current.handleOut || current.point
      const cp2 = next.handleIn || next.point
      const target = next.point

      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, target.x, target.y)
    }

    if (node.closed) {
      ctx.closePath()
    }

    if (node.closed && node.fill && node.fill !== 'transparent') {
      ctx.fillStyle = node.fill
      ctx.fill()
    }

    if (node.stroke && node.strokeWidth > 0 && node.stroke !== 'transparent') {
      ctx.strokeStyle = node.stroke
      ctx.lineWidth = node.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }
  }

  static drawImage(ctx: CanvasRenderingContext2D, node: ImageNode): void {
    if (!node.src) {
      // Draw placeholder
      ctx.fillStyle = '#27272A'
      ctx.fillRect(node.x, node.y, node.width, node.height)
      ctx.fillStyle = '#71717A'
      ctx.font = '12px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('No Image Source', node.x + node.width / 2, node.y + node.height / 2)
      return
    }

    let img = ShapeRenderer.imageCache.get(node.src)
    if (!img) {
      img = new Image()
      img.src = node.src
      img.onload = () => {
        ShapeRenderer.imageCache.set(node.src, img!)
      }
      ShapeRenderer.imageCache.set(node.src, img)
    }

    if (img.complete && img.naturalWidth > 0) {
      const radius = node.cornerRadius || 0
      if (radius > 0) {
        ctx.save()
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(node.x, node.y, node.width, node.height, radius)
        } else {
          ctx.rect(node.x, node.y, node.width, node.height)
        }
        ctx.clip()
        ctx.drawImage(img, node.x, node.y, node.width, node.height)
        ctx.restore()
      } else {
        ctx.drawImage(img, node.x, node.y, node.width, node.height)
      }
    } else {
      // Loading placeholder
      ctx.fillStyle = '#18181B'
      ctx.fillRect(node.x, node.y, node.width, node.height)
    }
  }
}

