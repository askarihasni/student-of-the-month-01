import type { DesignNode } from '../../types/document'
import type { Rect } from '../math/Geometry'
import { Geometry } from '../math/Geometry'
import type { Point } from '../math/Vector2D'
import { Vector2D } from '../math/Vector2D'
import type { TransformHandleType } from '../selection/HitTester'
import { NodeUtils } from '../model/nodeUtils'

export interface ResizeOptions {
  lockAspectRatio?: boolean
  resizeFromCenter?: boolean
  minSize?: number
}

export class TransformEngine {
  /**
   * Moves a set of nodes by delta (dx, dy) in world space
   */
  static moveNodes(nodes: DesignNode[], dx: number, dy: number): DesignNode[] {
    return nodes.map(node => {
      switch (node.type) {
        case 'rectangle':
        case 'frame':
        case 'ellipse':
        case 'text':
        case 'image': {
          const updated = {
            ...node,
            x: node.x + dx,
            y: node.y + dy,
          }
          return NodeUtils.updateTransformMatrix(updated)
        }
        case 'line': {
          return {
            ...node,
            x1: node.x1 + dx,
            y1: node.y1 + dy,
            x2: node.x2 + dx,
            y2: node.y2 + dy,
          }
        }
        case 'path': {
          return {
            ...node,
            points: node.points.map(pt => ({
              ...pt,
              point: { x: pt.point.x + dx, y: pt.point.y + dy },
              handleIn: pt.handleIn ? { x: pt.handleIn.x + dx, y: pt.handleIn.y + dy } : undefined,
              handleOut: pt.handleOut ? { x: pt.handleOut.x + dx, y: pt.handleOut.y + dy } : undefined,
            })),
          }
        }
        case 'group':
          return node
      }
    })
  }

  /**
   * Resizes a single node using one of the 8 resize handles.
   * Accurately supports rotated shapes via local space projection!
   */
  static resizeNode(
    node: DesignNode,
    handle: TransformHandleType,
    currentPointer: Point,
    initialNode: DesignNode,
    initialPointer: Point,
    options: ResizeOptions = {}
  ): DesignNode {
    if (node.type === 'line' || node.type === 'path' || node.type === 'group') {
      return node
    }

    const minSize = options.minSize ?? 5
    const rotDeg = initialNode.rotation
    const rotRad = (rotDeg * Math.PI) / 180

    const initialCenter: Point = {
      x: initialNode.x + initialNode.width / 2,
      y: initialNode.y + initialNode.height / 2,
    }

    // Unrotate mouse coordinates into local coordinate space relative to initial center
    const localStart = Vector2D.rotate(initialPointer, -rotRad, initialCenter)
    const localCurrent = Vector2D.rotate(currentPointer, -rotRad, initialCenter)

    const deltaX = localCurrent.x - localStart.x
    const deltaY = localCurrent.y - localStart.y

    let newX = initialNode.x
    let newY = initialNode.y
    let newWidth = initialNode.width
    let newHeight = initialNode.height

    const aspect = initialNode.width / (initialNode.height || 1)

    // Calculate unconstrained changes based on handle type
    switch (handle) {
      case 'br': {
        newWidth = initialNode.width + deltaX
        newHeight = initialNode.height + deltaY
        if (options.lockAspectRatio) {
          const size = Math.max(newWidth, newHeight * aspect)
          newWidth = size
          newHeight = size / aspect
        }
        break
      }
      case 'bl': {
        newWidth = initialNode.width - deltaX
        newHeight = initialNode.height + deltaY
        if (options.lockAspectRatio) {
          const size = Math.max(newWidth, newHeight * aspect)
          newWidth = size
          newHeight = size / aspect
        }
        newX = initialNode.x + (initialNode.width - newWidth)
        break
      }
      case 'tr': {
        newWidth = initialNode.width + deltaX
        newHeight = initialNode.height - deltaY
        if (options.lockAspectRatio) {
          const size = Math.max(newWidth, newHeight * aspect)
          newWidth = size
          newHeight = size / aspect
        }
        newY = initialNode.y + (initialNode.height - newHeight)
        break
      }
      case 'tl': {
        newWidth = initialNode.width - deltaX
        newHeight = initialNode.height - deltaY
        if (options.lockAspectRatio) {
          const size = Math.max(newWidth, newHeight * aspect)
          newWidth = size
          newHeight = size / aspect
        }
        newX = initialNode.x + (initialNode.width - newWidth)
        newY = initialNode.y + (initialNode.height - newHeight)
        break
      }
      case 'tc': {
        newHeight = initialNode.height - deltaY
        newY = initialNode.y + (initialNode.height - newHeight)
        break
      }
      case 'bc': {
        newHeight = initialNode.height + deltaY
        break
      }
      case 'ml': {
        newWidth = initialNode.width - deltaX
        newX = initialNode.x + (initialNode.width - newWidth)
        break
      }
      case 'mr': {
        newWidth = initialNode.width + deltaX
        break
      }
      default:
        break
    }

    // Clamp to minimum size
    if (newWidth < minSize) {
      if (handle === 'tl' || handle === 'bl' || handle === 'ml') {
        newX = initialNode.x + initialNode.width - minSize
      }
      newWidth = minSize
    }

    if (newHeight < minSize) {
      if (handle === 'tl' || handle === 'tr' || handle === 'tc') {
        newY = initialNode.y + initialNode.height - minSize
      }
      newHeight = minSize
    }

    // New center in local coordinates
    const localNewCenter: Point = {
      x: newX + newWidth / 2,
      y: newY + newHeight / 2,
    }

    // Rotate new center back to world space around initial center
    const worldNewCenter = Vector2D.rotate(localNewCenter, rotRad, initialCenter)

    // Final top-left in world space
    const finalX = worldNewCenter.x - newWidth / 2
    const finalY = worldNewCenter.y - newHeight / 2

    const updatedNode = {
      ...node,
      x: Math.round(finalX),
      y: Math.round(finalY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    }

    return NodeUtils.updateTransformMatrix(updatedNode)
  }

  /**
   * Rotates a node around its center, optionally snapping to 15-degree increments
   */
  static rotateNode(
    initialNode: DesignNode,
    currentPointer: Point,
    initialPointer: Point,
    snapTo15Deg = false
  ): DesignNode {
    const center = NodeUtils.getNodeCenter(initialNode)

    const initialAngle = Vector2D.angle(center, initialPointer)
    const currentAngle = Vector2D.angle(center, currentPointer)

    const deltaRad = currentAngle - initialAngle
    let deltaDeg = (deltaRad * 180) / Math.PI

    let newRotation = (initialNode.rotation + deltaDeg) % 360
    if (newRotation < 0) newRotation += 360

    if (snapTo15Deg) {
      newRotation = Math.round(newRotation / 15) * 15
    }

    const updated = {
      ...initialNode,
      rotation: Math.round(newRotation),
    }

    return NodeUtils.updateTransformMatrix(updated)
  }
}
