import type { MatrixTuple } from '../editor/math/Matrix3x3'
import type { Point } from '../editor/math/Vector2D'

export type EditorTool =
  | 'select'
  | 'frame'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'pen'
  | 'text'
  | 'hand'

export type NodeType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'frame'
  | 'path'
  | 'image'
  | 'group'

export interface ShadowEffect {
  color: string
  blur: number
  offsetX: number
  offsetY: number
}

export interface PathPoint {
  id: string
  point: Point
  handleIn?: Point
  handleOut?: Point
}

export interface BaseNode {
  id: string
  type: NodeType
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  rotation: number // in degrees
  transformMatrix: MatrixTuple
  parentId?: string | null
}

export interface RectangleNode extends BaseNode {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  shadow?: ShadowEffect
}

export interface EllipseNode extends BaseNode {
  type: 'ellipse'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  shadow?: ShadowEffect
}

export interface LineNode extends BaseNode {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  strokeWidth: number
  shadow?: ShadowEffect
}

export interface TextNode extends BaseNode {
  type: 'text'
  x: number
  y: number
  width: number
  height: number
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline' | 'line-through'
  lineHeight?: number
  letterSpacing?: number
  textAlign: 'left' | 'center' | 'right'
  fill: string
  stroke?: string
  strokeWidth?: number
  shadow?: ShadowEffect
}

export interface FrameNode extends BaseNode {
  type: 'frame'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
  clipContent: boolean
  childrenIds: string[]
  shadow?: ShadowEffect
}

export interface PathNode extends BaseNode {
  type: 'path'
  points: PathPoint[]
  closed: boolean
  fill: string
  stroke: string
  strokeWidth: number
  shadow?: ShadowEffect
}

export interface ImageNode extends BaseNode {
  type: 'image'
  x: number
  y: number
  width: number
  height: number
  src: string
  cornerRadius?: number
  shadow?: ShadowEffect
}

export interface GroupNode extends BaseNode {
  type: 'group'
  childrenIds: string[]
}

export type DesignNode =
  | RectangleNode
  | EllipseNode
  | LineNode
  | TextNode
  | FrameNode
  | PathNode
  | ImageNode
  | GroupNode

export type BoxNode =
  | RectangleNode
  | EllipseNode
  | TextNode
  | FrameNode
  | ImageNode

export function isBoxNode(node: DesignNode): node is BoxNode {
  return (
    node.type === 'rectangle' ||
    node.type === 'ellipse' ||
    node.type === 'text' ||
    node.type === 'frame' ||
    node.type === 'image'
  )
}

export interface Page {
  id: string
  name: string
  backgroundColor: string
  nodes: DesignNode[]
}

export interface DocumentModel {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  version: number
  pages: Page[]
  activePageId: string
  thumbnail?: string
}

export interface ProjectMetadata {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  pageCount: number
  nodeCount: number
  thumbnail?: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  timestamp: number
  label: string
  document: DocumentModel
}
