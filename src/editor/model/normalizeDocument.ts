import type { DocumentModel, DesignNode, Page } from '../../types/document'

/**
 * Normalizes any raw document structure into a valid frontend DocumentModel.
 * Ensures page.nodes is always an array of DesignNode, flattening style properties
 * and filling in missing default fields.
 */
export function normalizeDocument(raw: any): DocumentModel {
  if (!raw) {
    const now = Date.now()
    return {
      id: 'doc_empty',
      name: 'Untitled Design',
      createdAt: now,
      updatedAt: now,
      version: 1,
      activePageId: 'page_1',
      pages: [
        {
          id: 'page_1',
          name: 'Page 1',
          backgroundColor: '#1E1E1E',
          nodes: [],
        },
      ],
    }
  }

  const rawPages = Array.isArray(raw.pages) ? raw.pages : []
  const pages: Page[] = rawPages.map((page: any, pIndex: number) => {
    let rawNodes = page.nodes
    if (!Array.isArray(rawNodes)) {
      if (rawNodes && typeof rawNodes === 'object') {
        rawNodes = Object.values(rawNodes)
      } else {
        rawNodes = []
      }
    }

    const nodes: DesignNode[] = rawNodes.map((node: any, nIndex: number) => {
      const type = node.type || 'rectangle'
      const id = String(node.id || `node_${pIndex}_${nIndex}`)
      const name = String(node.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${nIndex + 1}`)

      // Flatten styles if present
      const fill = node.fill ?? node.style?.fill ?? (type === 'frame' ? '#18181B' : '#0D99FF')
      const stroke = node.stroke ?? node.style?.stroke
      const strokeWidth = node.strokeWidth ?? node.style?.strokeWidth ?? (stroke ? 1 : 0)
      const cornerRadius = node.cornerRadius ?? node.style?.cornerRadius ?? 0
      const shadow = node.shadow ?? node.style?.shadow
      const childrenIds = Array.isArray(node.childrenIds)
        ? node.childrenIds
        : Array.isArray(node.childIds)
        ? node.childIds
        : []

      const x = typeof node.x === 'number' ? node.x : 0
      const y = typeof node.y === 'number' ? node.y : 0
      const width = typeof node.width === 'number' ? node.width : 100
      const height = typeof node.height === 'number' ? node.height : 100

      const matrix =
        Array.isArray(node.transformMatrix) && node.transformMatrix.length === 6
          ? (node.transformMatrix as [number, number, number, number, number, number])
          : [1, 0, 0, 1, 0, 0]

      return {
        id,
        type,
        name,
        visible: node.visible !== false,
        locked: Boolean(node.locked),
        opacity: typeof node.opacity === 'number' ? node.opacity : 1,
        rotation: typeof node.rotation === 'number' ? node.rotation : 0,
        transformMatrix: matrix,
        parentId: node.parentId ?? null,
        x,
        y,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        cornerRadius,
        shadow,
        childrenIds,
        clipContent: Boolean(node.clipContent),
        // Text specific
        text: node.text ?? (type === 'text' ? 'Text' : undefined),
        fontSize: node.fontSize ?? (type === 'text' ? 16 : undefined),
        fontFamily: node.fontFamily ?? (type === 'text' ? 'Inter' : undefined),
        fontWeight: node.fontWeight ?? (type === 'text' ? 400 : undefined),
        textAlign: node.textAlign ?? (type === 'text' ? 'left' : undefined),
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
        // Path specific
        points: Array.isArray(node.points) ? node.points : [],
        closed: node.closed !== false,
        // Image specific
        src: node.src || '',
      } as unknown as DesignNode
    })

    return {
      id: String(page.id || `page_${pIndex + 1}`),
      name: String(page.name || `Page ${pIndex + 1}`),
      backgroundColor: page.backgroundColor || '#1E1E1E',
      nodes,
    }
  })

  const fallbackPages: Page[] = [
    {
      id: 'page_1',
      name: 'Page 1',
      backgroundColor: '#1E1E1E',
      nodes: [],
    },
  ]

  const resolvedPages = pages.length > 0 ? pages : fallbackPages
  const activePageId = raw.activePageId || resolvedPages[0]?.id || 'page_1'

  return {
    id: String(raw.id || 'doc_untitled'),
    name: String(raw.name || 'Untitled Document'),
    createdAt: typeof raw.createdAt === 'string' ? new Date(raw.createdAt).getTime() : (raw.createdAt || Date.now()),
    updatedAt: typeof raw.updatedAt === 'string' ? new Date(raw.updatedAt).getTime() : (raw.updatedAt || Date.now()),
    version: typeof raw.version === 'number' ? raw.version : 1,
    activePageId,
    pages: resolvedPages,
    thumbnail: raw.thumbnail || undefined,
  }
}
