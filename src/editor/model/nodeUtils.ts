import type { DesignNode, RectangleNode, FrameNode, EllipseNode, TextNode, ImageNode } from '../../types/document'
import type { Rect } from '../math/Geometry'
import { Geometry } from '../math/Geometry'
import type { Point } from '../math/Vector2D'
import { Vector2D } from '../math/Vector2D'
import { Matrix3x3 } from '../math/Matrix3x3'
import { generateId } from './factory'

export class NodeUtils {
  /**
   * Retrieves or computes the base bounding rectangle of a node in local coordinates
   */
  static getBaseRect(node: DesignNode): Rect {
    switch (node.type) {
      case 'rectangle':
      case 'frame':
      case 'ellipse':
      case 'text':
      case 'image':
        return {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        }
      case 'line': {
        const minX = Math.min(node.x1, node.x2)
        const minY = Math.min(node.y1, node.y2)
        const width = Math.max(1, Math.abs(node.x2 - node.x1))
        const height = Math.max(1, Math.abs(node.y2 - node.y1))
        return { x: minX, y: minY, width, height }
      }
      case 'path': {
        const pts = node.points.map(p => p.point)
        return Geometry.getBoundsForPoints(pts)
      }
      case 'group':
        return { x: 0, y: 0, width: 0, height: 0 }
    }
  }

  /**
   * Returns the center point of the node in world coordinates
   */
  static getNodeCenter(node: DesignNode): Point {
    const base = NodeUtils.getBaseRect(node)
    return {
      x: base.x + base.width / 2,
      y: base.y + base.height / 2,
    }
  }

  /**
   * Returns the 4 rotated corner points of the node in world coordinates
   */
  static getNodeCorners(node: DesignNode): [Point, Point, Point, Point] {
    const base = NodeUtils.getBaseRect(node)
    const rotRad = (node.rotation * Math.PI) / 180
    return Geometry.getRotatedRectCorners(base, rotRad)
  }

  /**
   * Computes the axis-aligned bounding box (AABB) of the node, accounting for rotation
   */
  static getNodeAABB(node: DesignNode): Rect {
    if (node.type === 'line') {
      const minX = Math.min(node.x1, node.x2)
      const minY = Math.min(node.y1, node.y2)
      const width = Math.abs(node.x2 - node.x1)
      const height = Math.abs(node.y2 - node.y1)
      return { x: minX, y: minY, width, height }
    }

    if (node.type === 'path') {
      const pts = node.points.map(p => p.point)
      return Geometry.getBoundsForPoints(pts)
    }

    if (node.rotation === 0) {
      return NodeUtils.getBaseRect(node)
    }

    const corners = NodeUtils.getNodeCorners(node)
    return Geometry.getBoundsForPoints(corners)
  }

  /**
   * Computes the combined AABB enclosing all provided nodes
   */
  static getNodesAABB(nodes: DesignNode[]): Rect {
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
    const aabbs = nodes.map(n => NodeUtils.getNodeAABB(n))
    return Geometry.unionRects(aabbs)
  }

  /**
   * Recomputes and returns a copy of the node with updated affine transformMatrix
   */
  static updateTransformMatrix<T extends DesignNode>(node: T): T {
    const base = NodeUtils.getBaseRect(node)
    const rad = (node.rotation * Math.PI) / 180
    const matrix = Matrix3x3.compose(
      base.x,
      base.y,
      1,
      1,
      rad,
      base.width / 2,
      base.height / 2
    )
    return {
      ...node,
      transformMatrix: matrix,
    }
  }

  /**
   * Clones a node with a new unique ID and optional offset
   */
  static cloneNode(node: DesignNode, offset: Point = { x: 20, y: 20 }): DesignNode {
    const id = generateId(node.type)
    const name = `${node.name} Copy`

    switch (node.type) {
      case 'rectangle':
      case 'frame':
      case 'ellipse':
      case 'text':
      case 'image': {
        const cloned = {
          ...node,
          id,
          name,
          x: node.x + offset.x,
          y: node.y + offset.y,
        }
        return NodeUtils.updateTransformMatrix(cloned)
      }
      case 'line': {
        return {
          ...node,
          id,
          name,
          x1: node.x1 + offset.x,
          y1: node.y1 + offset.y,
          x2: node.x2 + offset.x,
          y2: node.y2 + offset.y,
        }
      }
      case 'path': {
        return {
          ...node,
          id,
          name,
          points: node.points.map(p => ({
            ...p,
            id: generateId('pt'),
            point: { x: p.point.x + offset.x, y: p.point.y + offset.y },
            handleIn: p.handleIn ? { x: p.handleIn.x + offset.x, y: p.handleIn.y + offset.y } : undefined,
            handleOut: p.handleOut ? { x: p.handleOut.x + offset.x, y: p.handleOut.y + offset.y } : undefined,
          })),
        }
      }
      case 'group': {
        return {
          ...node,
          id,
          name,
        }
      }
    }
  }
}
