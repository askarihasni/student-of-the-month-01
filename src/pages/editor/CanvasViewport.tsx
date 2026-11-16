import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { DesignNode, NodeType, TextNode, EditorTool } from '../../types/document'
import type { Point } from '../../editor/math/Vector2D'
import type { Rect } from '../../editor/math/Geometry'
import { CanvasEngine } from '../../editor/canvas/CanvasEngine'
import { ViewportController } from '../../editor/viewport/ViewportController'
import { HitTester, type TransformHandleType } from '../../editor/selection/HitTester'
import { TransformEngine } from '../../editor/transforms/TransformEngine'
import { SnapEngine, type AlignmentGuide } from '../../editor/transforms/SnapEngine'
import { NodeUtils } from '../../editor/model/nodeUtils'
import {
  createRectangle,
  createEllipse,
  createLine,
  createText,
  createFrame,
  createPath,
  createImage,
  generateId,
} from '../../editor/model/factory'
import { useEditorStore } from '../../store/editorStore'

export const CanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<CanvasEngine | null>(null)

  const {
    document,
    activePageId,
    viewport,
    setViewport,
    panBy,
    zoomAt,
    activeTool,
    setActiveTool,
    selectedNodeIds,
    selectNode,
    selectNodes,
    clearSelection,
    addNode,
    updateNode,
    updateNodes,
    hoverNodeId,
    setHoverNodeId,
    startBatchHistory,
    commitHistory,
  } = useEditorStore()

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]
  const nodes = activePage?.nodes || []

  // Interaction tracking state
  const isPointerDownRef = useRef(false)
  const dragModeRef = useRef<'none' | 'pan' | 'move' | 'resize' | 'rotate' | 'draw' | 'marquee' | 'pen'>('none')
  const startScreenPosRef = useRef<Point>({ x: 0, y: 0 })
  const startWorldPosRef = useRef<Point>({ x: 0, y: 0 })
  const initialNodesStateRef = useRef<Map<string, DesignNode>>(new Map())
  const activeHandleRef = useRef<TransformHandleType | null>(null)
  const [cursorStyle, setCursorStyle] = useState('default')

  // Transient preview states for rendering loop
  const [previewShape, setPreviewShape] = useState<{ tool: NodeType; start: Point; current: Point } | null>(null)
  const [marqueeBox, setMarqueeBox] = useState<Rect | null>(null)
  const [smartGuides, setSmartGuides] = useState<AlignmentGuide[]>([])
  const [penPoints, setPenPoints] = useState<Point[]>([])
  const [currentWorldPointer, setCurrentWorldPointer] = useState<Point | null>(null)

  // In-place text editing state
  const [editingTextNode, setEditingTextNode] = useState<TextNode | null>(null)
  const [editTextValue, setEditTextValue] = useState('')
  const [spaceKeyDown, setSpaceKeyDown] = useState(false)

  // Initialize CanvasEngine
  useEffect(() => {
    if (!canvasRef.current) return
    const engine = new CanvasEngine(canvasRef.current)
    engineRef.current = engine

    const handleResize = () => {
      if (!containerRef.current || !engineRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      engineRef.current.resize(rect.width, rect.height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
    }
  }, [])

  // Sync state to CanvasEngine render loop
  useEffect(() => {
    if (!engineRef.current) return

    engineRef.current.setState({
      document,
      viewport,
      selectedNodeIds,
      hoverNodeId,
      activeTool,
      previewShape,
      marquee: marqueeBox,
      smartGuides,
      penPoints: penPoints.length > 0 ? penPoints : null,
      currentPointer: currentWorldPointer,
      isDarkTheme: true,
    })
  }, [
    document,
    viewport,
    selectedNodeIds,
    hoverNodeId,
    activeTool,
    previewShape,
    marqueeBox,
    smartGuides,
    penPoints,
    currentWorldPointer,
  ])

  // Track Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        setSpaceKeyDown(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceKeyDown(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Get screen coordinates from pointer event relative to canvas
  const getScreenPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    canvasRef.current.setPointerCapture(e.pointerId)
    isPointerDownRef.current = true

    const screenPos = getScreenPoint(e)
    const worldPos = ViewportController.screenToWorld(screenPos, viewport)
    startScreenPosRef.current = screenPos
    startWorldPosRef.current = worldPos

    // Check if middle click or Space key held or Hand tool active: Pan
    if (e.button === 1 || spaceKeyDown || activeTool === 'hand') {
      dragModeRef.current = 'pan'
      setCursorStyle('grabbing')
      return
    }

    if (e.button !== 0) return // Only primary button for editing

    // If text editing active and clicked outside, commit
    if (editingTextNode) {
      updateNode(editingTextNode.id, { text: editTextValue })
      setEditingTextNode(null)
    }

    // Pen tool interaction
    if (activeTool === 'pen') {
      dragModeRef.current = 'pen'
      const updatedPts = [...penPoints, worldPos]
      setPenPoints(updatedPts)
      return
    }

    // Check if drawing a shape
    if (
      activeTool === 'rectangle' ||
      activeTool === 'ellipse' ||
      activeTool === 'line' ||
      activeTool === 'frame'
    ) {
      dragModeRef.current = 'draw'
      setPreviewShape({
        tool: activeTool,
        start: worldPos,
        current: worldPos,
      })
      return
    }

    // Text tool click
    if (activeTool === 'text') {
      const newText = createText({
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        text: 'Type text here',
      })
      addNode(newText)
      setActiveTool('select')
      setEditingTextNode(newText)
      setEditTextValue('Type text here')
      return
    }

    // Select Tool: Check resize/rotation handles on selected object(s)
    if (selectedNodeIds.length > 0) {
      const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
      let bounds: Rect
      let rot = 0

      if (selectedNodes.length === 1) {
        bounds = NodeUtils.getBaseRect(selectedNodes[0])
        rot = selectedNodes[0].rotation
      } else {
        bounds = NodeUtils.getNodesAABB(selectedNodes)
      }

      const hitHandle = HitTester.hitTestHandles(worldPos, bounds, rot, viewport.zoom)
      if (hitHandle) {
        activeHandleRef.current = hitHandle
        startBatchHistory(hitHandle === 'rot' ? 'Rotate Object' : 'Resize Object')

        initialNodesStateRef.current.clear()
        selectedNodes.forEach((n) => initialNodesStateRef.current.set(n.id, { ...n }))

        if (hitHandle === 'rot') {
          dragModeRef.current = 'rotate'
          setCursorStyle('grabbing')
        } else {
          dragModeRef.current = 'resize'
        }
        return
      }
    }

    // Hit test objects on canvas
    const hit = HitTester.hitTestTopmost(worldPos, nodes)
    if (hit) {
      if (e.shiftKey) {
        selectNode(hit.id, true)
      } else if (!selectedNodeIds.includes(hit.id)) {
        selectNode(hit.id, false)
      }

      // Prepare to move
      dragModeRef.current = 'move'
      startBatchHistory('Move Objects')

      initialNodesStateRef.current.clear()
      const currentSelected = e.shiftKey
        ? [...selectedNodeIds, hit.id]
        : selectedNodeIds.includes(hit.id)
        ? selectedNodeIds
        : [hit.id]

      nodes
        .filter((n) => currentSelected.includes(n.id))
        .forEach((n) => initialNodesStateRef.current.set(n.id, { ...n }))

      setCursorStyle('move')
    } else {
      // Clicked empty canvas
      if (!e.shiftKey) {
        clearSelection()
      }
      dragModeRef.current = 'marquee'
      setMarqueeBox({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 })
    }
  }

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const screenPos = getScreenPoint(e)
    const worldPos = ViewportController.screenToWorld(screenPos, viewport)
    setCurrentWorldPointer(worldPos)

    if (!isPointerDownRef.current) {
      // Update cursor and hover state when not dragging
      if (spaceKeyDown || activeTool === 'hand') {
        setCursorStyle('grab')
        return
      }

      if (activeTool !== 'select') {
        setCursorStyle('crosshair')
        return
      }

      // Check handle hover
      if (selectedNodeIds.length > 0) {
        const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
        const bounds =
          selectedNodes.length === 1
            ? NodeUtils.getBaseRect(selectedNodes[0])
            : NodeUtils.getNodesAABB(selectedNodes)
        const rot = selectedNodes.length === 1 ? selectedNodes[0].rotation : 0

        const hitHandle = HitTester.hitTestHandles(worldPos, bounds, rot, viewport.zoom)
        if (hitHandle) {
          if (hitHandle === 'rot') {
            setCursorStyle('grab')
          } else {
            const handles = HitTester.getHandles(bounds, rot, viewport.zoom)
            const hInfo = handles.find((h) => h.type === hitHandle)
            setCursorStyle(hInfo?.cursor || 'pointer')
          }
          return
        }
      }

      // Check object hover
      const hoverHit = HitTester.hitTestTopmost(worldPos, nodes)
      setHoverNodeId(hoverHit ? hoverHit.id : null)
      setCursorStyle(hoverHit ? 'pointer' : 'default')
      return
    }

    // Active drag handling
    const mode = dragModeRef.current

    if (mode === 'pan') {
      const dx = screenPos.x - startScreenPosRef.current.x
      const dy = screenPos.y - startScreenPosRef.current.y
      startScreenPosRef.current = screenPos
      panBy(dx, dy)
      return
    }

    if (mode === 'draw' && previewShape) {
      setPreviewShape({
        ...previewShape,
        current: worldPos,
      })
      return
    }

    if (mode === 'marquee') {
      const x = Math.min(startWorldPosRef.current.x, worldPos.x)
      const y = Math.min(startWorldPosRef.current.y, worldPos.y)
      const width = Math.abs(worldPos.x - startWorldPosRef.current.x)
      const height = Math.abs(worldPos.y - startWorldPosRef.current.y)
      setMarqueeBox({ x, y, width, height })
      return
    }

    if (mode === 'move') {
      let dx = worldPos.x - startWorldPosRef.current.x
      let dy = worldPos.y - startWorldPosRef.current.y

      // Smart alignment snapping
      const movingNodes = Array.from(initialNodesStateRef.current.values())
      const movingBounds = NodeUtils.getNodesAABB(movingNodes)
      const projectedBounds = {
        x: movingBounds.x + dx,
        y: movingBounds.y + dy,
        width: movingBounds.width,
        height: movingBounds.height,
      }

      const unselectedNodes = nodes.filter((n) => !selectedNodeIds.includes(n.id))
      const snap = SnapEngine.computeSnap(projectedBounds, unselectedNodes, 6 / viewport.zoom)

      dx += snap.deltaX
      dy += snap.deltaY
      setSmartGuides(snap.guides)

      // Apply moved positions
      for (const [id, initialNode] of initialNodesStateRef.current.entries()) {
        if ('x' in initialNode && 'y' in initialNode) {
          updateNode(id, {
            x: Math.round(initialNode.x + dx),
            y: Math.round(initialNode.y + dy),
          })
        } else if (initialNode.type === 'line') {
          updateNode(id, {
            x1: Math.round(initialNode.x1 + dx),
            y1: Math.round(initialNode.y1 + dy),
            x2: Math.round(initialNode.x2 + dx),
            y2: Math.round(initialNode.y2 + dy),
          })
        }
      }
      return
    }

    if (mode === 'resize' && activeHandleRef.current) {
      const handle = activeHandleRef.current
      const lockAspect = e.shiftKey
      const initialMap = initialNodesStateRef.current

      for (const [id, initialNode] of initialMap.entries()) {
        const live = nodes.find((n) => n.id === id) || initialNode
        const resized = TransformEngine.resizeNode(
          live,
          handle,
          worldPos,
          initialNode,
          startWorldPosRef.current,
          { lockAspectRatio: lockAspect, minSize: 6 }
        )
        updateNode(id, resized)
      }
      return
    }

    if (mode === 'rotate') {
      const snap15 = e.shiftKey
      const initialMap = initialNodesStateRef.current

      for (const [id, initialNode] of initialMap.entries()) {
        const rotated = TransformEngine.rotateNode(
          initialNode,
          worldPos,
          startWorldPosRef.current,
          snap15
        )
        updateNode(id, rotated)
      }
      return
    }
  }

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    canvasRef.current.releasePointerCapture(e.pointerId)
    isPointerDownRef.current = false
    const mode = dragModeRef.current

    if (mode === 'draw' && previewShape) {
      const start = previewShape.start
      const current = previewShape.current
      const x = Math.round(Math.min(start.x, current.x))
      const y = Math.round(Math.min(start.y, current.y))
      const width = Math.round(Math.max(10, Math.abs(current.x - start.x)))
      const height = Math.round(Math.max(10, Math.abs(current.y - start.y)))

      let newNode: DesignNode | null = null

      switch (previewShape.tool) {
        case 'rectangle':
          newNode = createRectangle({ x, y, width, height })
          break
        case 'ellipse':
          newNode = createEllipse({ x, y, width, height })
          break
        case 'frame':
          newNode = createFrame({ x, y, width, height, name: 'Frame' })
          break
        case 'line':
          newNode = createLine({
            x1: Math.round(start.x),
            y1: Math.round(start.y),
            x2: Math.round(current.x),
            y2: Math.round(current.y),
          })
          break
      }

      if (newNode) {
        addNode(newNode)
        setActiveTool('select')
      }

      setPreviewShape(null)
    } else if (mode === 'marquee' && marqueeBox) {
      const selected = HitTester.hitTestMarquee(marqueeBox, nodes)
      selectNodes(selected.map((s) => s.id))
      setMarqueeBox(null)
    } else if (mode === 'move' || mode === 'resize' || mode === 'rotate') {
      commitHistory()
      setSmartGuides([])
    }

    dragModeRef.current = 'none'
    activeHandleRef.current = null
    initialNodesStateRef.current.clear()
    setSmartGuides([])
    setCursorStyle('default')
  }

  // Wheel (Zoom or Pan)
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const screenPos = getScreenPoint(e as unknown as React.PointerEvent<HTMLCanvasElement>)

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered at mouse position
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      zoomAt(screenPos, zoomFactor)
    } else {
      // Normal pan with mouse wheel / trackpad
      panBy(-e.deltaX, -e.deltaY)
    }
  }

  // Double Click for In-Place Text Editing
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = getScreenPoint(e as unknown as React.PointerEvent<HTMLCanvasElement>)
    const worldPos = ViewportController.screenToWorld(screenPos, viewport)
    const hit = HitTester.hitTestTopmost(worldPos, nodes)

    if (hit && hit.type === 'text') {
      setEditingTextNode(hit as TextNode)
      setEditTextValue((hit as TextNode).text)
    }
  }

  // Finish Pen Tool on Double Click or Enter
  const handleFinishPen = useCallback(() => {
    if (penPoints.length >= 2) {
      const newPath = createPath({
        points: penPoints.map((pt) => ({ id: generateId('pt'), point: pt })),
        closed: false,
      })
      addNode(newPath)
    }
    setPenPoints([])
    setActiveTool('select')
  }, [penPoints, addNode, setActiveTool])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool === 'pen' && (e.key === 'Enter' || e.key === 'Escape')) {
        handleFinishPen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTool, handleFinishPen])

  // In-place text editor position
  const textEditorPos = editingTextNode
    ? ViewportController.worldToScreen(
        { x: editingTextNode.x, y: editingTextNode.y },
        viewport
      )
    : null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const worldPos = ViewportController.screenToWorld(screenPos, viewport)

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        const aspect = img.naturalWidth / (img.naturalHeight || 1)
        const width = Math.min(400, Math.max(100, img.naturalWidth))
        const height = width / aspect
        const imgNode = createImage({
          x: Math.round(worldPos.x - width / 2),
          y: Math.round(worldPos.y - height / 2),
          width: Math.round(width),
          height: Math.round(height),
          src,
          name: file.name.replace(/\.[^/.]+$/, ''),
        })
        addNode(imgNode)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 h-full w-full relative overflow-hidden bg-zinc-950 focus:outline-none"
      style={{ cursor: cursorStyle }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        className="block w-full h-full touch-none"
      />

      {/* Floating finish button for Pen tool */}
      {activeTool === 'pen' && penPoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2">
          <span>Drawing vector path ({penPoints.length} points)</span>
          <button
            type="button"
            onClick={handleFinishPen}
            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
          >
            Done
          </button>
        </div>
      )}

      {/* In-Place DOM Text Editor Overlay */}
      {editingTextNode && textEditorPos && (
        <div
          className="absolute z-40 pointer-events-auto"
          style={{
            left: `${textEditorPos.x}px`,
            top: `${textEditorPos.y}px`,
            transform: `scale(${viewport.zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <textarea
            value={editTextValue}
            onChange={(e) => {
              setEditTextValue(e.target.value)
              updateNode(editingTextNode.id, { text: e.target.value })
            }}
            onBlur={() => {
              updateNode(editingTextNode.id, { text: editTextValue })
              setEditingTextNode(null)
            }}
            autoFocus
            rows={Math.max(1, editTextValue.split('\n').length)}
            style={{
              fontFamily: editingTextNode.fontFamily || 'Inter, sans-serif',
              fontSize: `${editingTextNode.fontSize || 16}px`,
              fontWeight: editingTextNode.fontWeight || 'normal',
              color: editingTextNode.fill || '#FFFFFF',
              width: `${Math.max(120, editingTextNode.width)}px`,
            }}
            className="bg-zinc-900/90 border border-blue-500 p-1 rounded focus:outline-none resize-none shadow-2xl leading-tight"
          />
        </div>
      )}
    </div>
  )
}
