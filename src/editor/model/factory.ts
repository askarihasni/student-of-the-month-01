import type {
  DocumentModel,
  Page,
  RectangleNode,
  EllipseNode,
  LineNode,
  TextNode,
  FrameNode,
  PathNode,
  ImageNode,
  GroupNode,
} from '../../types/document'
import { Matrix3x3 } from '../math/Matrix3x3'

export function generateId(prefix = 'node'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
}

export function createRectangle(params: Partial<RectangleNode> = {}): RectangleNode {
  const x = params.x ?? 100
  const y = params.y ?? 100
  const width = params.width ?? 160
  const height = params.height ?? 120
  const rotation = params.rotation ?? 0
  const rad = (rotation * Math.PI) / 180

  return {
    id: params.id ?? generateId('rect'),
    type: 'rectangle',
    name: params.name ?? 'Rectangle',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix:
      params.transformMatrix ??
      Matrix3x3.compose(x, y, 1, 1, rad, width / 2, height / 2),
    x,
    y,
    width,
    height,
    fill: params.fill ?? '#3B82F6',
    stroke: params.stroke ?? '#1D4ED8',
    strokeWidth: params.strokeWidth ?? 1,
    cornerRadius: params.cornerRadius ?? 8,
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createEllipse(params: Partial<EllipseNode> = {}): EllipseNode {
  const x = params.x ?? 100
  const y = params.y ?? 100
  const width = params.width ?? 140
  const height = params.height ?? 140
  const rotation = params.rotation ?? 0
  const rad = (rotation * Math.PI) / 180

  return {
    id: params.id ?? generateId('ellipse'),
    type: 'ellipse',
    name: params.name ?? 'Ellipse',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix:
      params.transformMatrix ??
      Matrix3x3.compose(x, y, 1, 1, rad, width / 2, height / 2),
    x,
    y,
    width,
    height,
    fill: params.fill ?? '#10B981',
    stroke: params.stroke ?? '#047857',
    strokeWidth: params.strokeWidth ?? 1,
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createLine(params: Partial<LineNode> = {}): LineNode {
  const x1 = params.x1 ?? 100
  const y1 = params.y1 ?? 100
  const x2 = params.x2 ?? 260
  const y2 = params.y2 ?? 100
  const rotation = params.rotation ?? 0

  return {
    id: params.id ?? generateId('line'),
    type: 'line',
    name: params.name ?? 'Line',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix: params.transformMatrix ?? Matrix3x3.identity(),
    x1,
    y1,
    x2,
    y2,
    stroke: params.stroke ?? '#E2E8F0',
    strokeWidth: params.strokeWidth ?? 2,
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createText(params: Partial<TextNode> = {}): TextNode {
  const x = params.x ?? 100
  const y = params.y ?? 100
  const width = params.width ?? 180
  const height = params.height ?? 40
  const rotation = params.rotation ?? 0
  const rad = (rotation * Math.PI) / 180

  return {
    id: params.id ?? generateId('text'),
    type: 'text',
    name: params.name ?? 'Text',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix:
      params.transformMatrix ??
      Matrix3x3.compose(x, y, 1, 1, rad, width / 2, height / 2),
    x,
    y,
    width,
    height,
    text: params.text ?? 'Double click to edit',
    fontSize: params.fontSize ?? 16,
    fontFamily: params.fontFamily ?? 'Inter, sans-serif',
    fontWeight: params.fontWeight ?? 'normal',
    textAlign: params.textAlign ?? 'left',
    fill: params.fill ?? '#FFFFFF',
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createFrame(params: Partial<FrameNode> = {}): FrameNode {
  const x = params.x ?? 100
  const y = params.y ?? 100
  const width = params.width ?? 375
  const height = params.height ?? 667
  const rotation = params.rotation ?? 0
  const rad = (rotation * Math.PI) / 180

  return {
    id: params.id ?? generateId('frame'),
    type: 'frame',
    name: params.name ?? 'iPhone Frame',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix:
      params.transformMatrix ??
      Matrix3x3.compose(x, y, 1, 1, rad, width / 2, height / 2),
    x,
    y,
    width,
    height,
    fill: params.fill ?? '#1E1E24',
    stroke: params.stroke ?? '#33333E',
    strokeWidth: params.strokeWidth ?? 1,
    cornerRadius: params.cornerRadius ?? 16,
    clipContent: params.clipContent ?? true,
    childrenIds: params.childrenIds ?? [],
    parentId: params.parentId ?? null,
  }
}

export function createPath(params: Partial<PathNode> = {}): PathNode {
  const points = params.points ?? [
    { id: generateId('pt'), point: { x: 100, y: 100 } },
    { id: generateId('pt'), point: { x: 200, y: 150 } },
    { id: generateId('pt'), point: { x: 250, y: 80 } },
  ]
  const rotation = params.rotation ?? 0

  return {
    id: params.id ?? generateId('path'),
    type: 'path',
    name: params.name ?? 'Vector Path',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix: params.transformMatrix ?? Matrix3x3.identity(),
    points,
    closed: params.closed ?? false,
    fill: params.fill ?? 'transparent',
    stroke: params.stroke ?? '#F59E0B',
    strokeWidth: params.strokeWidth ?? 2,
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createImage(params: Partial<ImageNode> = {}): ImageNode {
  const x = params.x ?? 100
  const y = params.y ?? 100
  const width = params.width ?? 200
  const height = params.height ?? 150
  const rotation = params.rotation ?? 0
  const rad = (rotation * Math.PI) / 180

  return {
    id: params.id ?? generateId('img'),
    type: 'image',
    name: params.name ?? 'Image',
    visible: params.visible ?? true,
    locked: params.locked ?? false,
    opacity: params.opacity ?? 1,
    rotation,
    transformMatrix:
      params.transformMatrix ??
      Matrix3x3.compose(x, y, 1, 1, rad, width / 2, height / 2),
    x,
    y,
    width,
    height,
    src: params.src ?? '',
    cornerRadius: params.cornerRadius ?? 0,
    shadow: params.shadow,
    parentId: params.parentId ?? null,
  }
}

export function createGroup(childrenIds: string[], name = 'Group'): GroupNode {
  return {
    id: generateId('group'),
    type: 'group',
    name,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
    transformMatrix: Matrix3x3.identity(),
    childrenIds,
    parentId: null,
  }
}

export function createDefaultDocument(name = 'Untitled Design'): DocumentModel {
  const pageId = generateId('page')
  const defaultPage: Page = {
    id: pageId,
    name: 'Page 1',
    backgroundColor: '#1E1E1E',
    nodes: [
      createFrame({
        x: 120,
        y: 80,
        width: 380,
        height: 600,
        name: 'Mobile Screen',
        fill: '#18181B',
        cornerRadius: 24,
      }),
      createRectangle({
        x: 150,
        y: 120,
        width: 320,
        height: 180,
        name: 'Card Header',
        fill: '#3B82F6',
        cornerRadius: 16,
      }),
      createText({
        x: 170,
        y: 150,
        width: 280,
        height: 40,
        name: 'Welcome Text',
        text: 'Welcome to Mini Figma',
        fontSize: 20,
        fontWeight: 'bold',
        fill: '#FFFFFF',
      }),
      createEllipse({
        x: 160,
        y: 330,
        width: 70,
        height: 70,
        name: 'Avatar Ring',
        fill: '#EC4899',
      }),
      createRectangle({
        x: 250,
        y: 345,
        width: 200,
        height: 40,
        name: 'Action Button',
        fill: '#10B981',
        cornerRadius: 8,
      }),
    ],
  }

  const now = Date.now()
  return {
    id: generateId('doc'),
    name,
    createdAt: now,
    updatedAt: now,
    version: 1,
    pages: [defaultPage],
    activePageId: pageId,
  }
}

