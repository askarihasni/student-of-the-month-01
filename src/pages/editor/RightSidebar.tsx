import React, { useState } from 'react'
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  Baseline,
  Bold,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Italic,
  Link,
  Lock,
  Minus,
  MoveDown,
  MoveUp,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RotateCw,
  Sliders,
  Sparkles,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  Unlink,
} from 'lucide-react'
import type { DesignNode, RectangleNode, TextNode } from '../../types/document'
import { useEditorStore } from '../../store/editorStore'
import { ColorPicker } from '../../components/ui/ColorPicker'
import { NodeUtils } from '../../editor/model/nodeUtils'

export const RightSidebar: React.FC = () => {
  const {
    document,
    activePageId,
    selectedNodeIds,
    updateNode,
    updateNodes,
    alignSelected,
  } = useEditorStore()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [constrainAspect, setConstrainAspect] = useState(false)

  // Collapsible section states
  const [designOpen, setDesignOpen] = useState(true)
  const [typographyOpen, setTypographyOpen] = useState(true)
  const [appearanceOpen, setAppearanceOpen] = useState(true)
  const [effectsOpen, setEffectsOpen] = useState(true)
  const [exportOpen, setExportOpen] = useState(true)

  const activePage =
    document?.pages.find((p) => p.id === activePageId) || document?.pages[0]

  const rawNodes = activePage?.nodes
  const pageNodes: DesignNode[] = Array.isArray(rawNodes)
    ? rawNodes
    : rawNodes && typeof rawNodes === 'object'
    ? Object.values(rawNodes)
    : []

  const selectedNodes =
    pageNodes.filter((n) => selectedNodeIds.includes(n.id)) || []

  if (isCollapsed) {
    return (
      <aside className="w-9 bg-[#2C2C2C] border-l border-[#383838] flex flex-col items-center py-2 text-[#7E7E7E] shrink-0 h-[calc(100vh-48px)] select-none z-20">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded hover:bg-[#383838] hover:text-white transition-colors"
          title="Open Properties Inspector"
          aria-label="Open Properties Inspector"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
      </aside>
    )
  }

  // If no object is selected, show page / canvas settings
  if (selectedNodes.length === 0) {
    return (
      <aside className="w-72 bg-[#2C2C2C] border-l border-[#383838] p-4 select-none text-[#B3B3B3] text-xs shrink-0 h-[calc(100vh-48px)] overflow-y-auto z-20 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#383838]">
          <h3 className="font-semibold text-white text-[11px] uppercase tracking-wider">
            Page & Canvas
          </h3>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
            title="Collapse panel"
            aria-label="Collapse panel"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] text-[#7E7E7E] mb-1 font-medium">Active Page</label>
            <input
              type="text"
              value={activePage?.name || 'Page'}
              readOnly
              className="w-full bg-[#1E1E1E] border border-[#383838] rounded px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div>
            <ColorPicker
              label="Canvas Background"
              color={activePage?.backgroundColor || '#1E1E1E'}
              onChange={(color) => {
                if (document && activePage) {
                  const pages = document.pages.map((p) =>
                    p.id === activePage.id ? { ...p, backgroundColor: color } : p
                  )
                  useEditorStore.setState({ document: { ...document, pages }, saveStatus: 'unsaved' })
                  useEditorStore.getState().saveDocumentNow()
                }
              }}
            />
          </div>

          <div className="pt-3 border-t border-[#383838]">
            <h4 className="text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider mb-2">
              Document Info
            </h4>
            <div className="space-y-1.5 text-[#B3B3B3] text-[11px] bg-[#1E1E1E] p-2.5 rounded-lg border border-[#383838]">
              <div className="flex justify-between">
                <span className="text-[#7E7E7E]">Layers on Page:</span>
                <span className="text-white font-medium">{pageNodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E7E7E]">Total Pages:</span>
                <span className="text-white font-medium">{document?.pages.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E7E7E]">Engine:</span>
                <span className="text-emerald-400 font-mono text-[10px]">HTML5 Canvas 2D</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    )
  }

  const primaryNode = selectedNodes[0]

  // Alignment helpers
  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    alignSelected(alignment)
  }

  const handleWidthChange = (newWidth: number) => {
    if (!('width' in primaryNode)) return
    const w = Math.max(1, newWidth)
    if (constrainAspect && 'height' in primaryNode && primaryNode.width > 0) {
      const aspect = primaryNode.height / primaryNode.width
      updateNode(primaryNode.id, { width: w, height: Math.round(w * aspect) })
    } else {
      updateNode(primaryNode.id, { width: w })
    }
  }

  const handleHeightChange = (newHeight: number) => {
    if (!('height' in primaryNode)) return
    const h = Math.max(1, newHeight)
    if (constrainAspect && 'width' in primaryNode && primaryNode.height > 0) {
      const aspect = primaryNode.width / primaryNode.height
      updateNode(primaryNode.id, { height: h, width: Math.round(h * aspect) })
    } else {
      updateNode(primaryNode.id, { height: h })
    }
  }

  return (
    <aside className="w-72 bg-[#2C2C2C] border-l border-[#383838] p-4 select-none text-[#B3B3B3] text-xs shrink-0 h-[calc(100vh-48px)] overflow-y-auto z-20 space-y-4">
      {/* Header with Title and Collapse Button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#383838]">
        <div className="truncate">
          <h3 className="font-semibold text-white text-xs truncate max-w-[150px]">
            {selectedNodes.length === 1 ? primaryNode.name : `${selectedNodes.length} Layers Selected`}
          </h3>
          <span className="text-[10px] text-[#7E7E7E] capitalize">{primaryNode.type}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
          title="Collapse panel"
          aria-label="Collapse panel"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. DESIGN / ALIGNMENT SECTION */}
      <div className="space-y-2.5">
        <div
          className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
          onClick={() => setDesignOpen(!designOpen)}
        >
          <div className="flex items-center gap-1">
            {designOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>Design</span>
          </div>
        </div>

        {designOpen && (
          <div className="space-y-2.5 animate-in fade-in duration-100">
            {/* Alignment Grid */}
            <div className="grid grid-cols-6 gap-0.5 bg-[#1E1E1E] p-0.5 rounded border border-[#383838] text-center">
              <button
                type="button"
                onClick={() => handleAlign('left')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded transition-colors"
                title="Align Left"
                aria-label="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5 mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('center')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded transition-colors"
                title="Align Horizontal Centers"
                aria-label="Align Horizontal Centers"
              >
                <AlignCenter className="w-3.5 h-3.5 mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('right')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded transition-colors"
                title="Align Right"
                aria-label="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5 mx-auto" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('top')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded text-[10px] font-bold transition-colors"
                title="Align Top"
                aria-label="Align Top"
              >
                ⊤
              </button>
              <button
                type="button"
                onClick={() => handleAlign('middle')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded text-[10px] font-bold transition-colors"
                title="Align Vertical Centers"
                aria-label="Align Vertical Centers"
              >
                ⊣
              </button>
              <button
                type="button"
                onClick={() => handleAlign('bottom')}
                className="p-1.5 hover:bg-[#383838] hover:text-white rounded text-[10px] font-bold transition-colors"
                title="Align Bottom"
                aria-label="Align Bottom"
              >
                ⊥
              </button>
            </div>

            {/* Position and Dimensions with Figma inner label badges */}
            {'x' in primaryNode && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="figma-input-group">
                    <span className="figma-input-label">X</span>
                    <input
                      type="number"
                      value={Math.round(primaryNode.x)}
                      onChange={(e) => updateNode(primaryNode.id, { x: Number(e.target.value) })}
                      className="figma-input-field"
                    />
                  </div>
                  <div className="figma-input-group">
                    <span className="figma-input-label">Y</span>
                    <input
                      type="number"
                      value={Math.round(primaryNode.y)}
                      onChange={(e) => updateNode(primaryNode.id, { y: Number(e.target.value) })}
                      className="figma-input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <div className="figma-input-group">
                      <span className="figma-input-label">W</span>
                      <input
                        type="number"
                        value={Math.round(primaryNode.width)}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="figma-input-field"
                      />
                    </div>
                    <div className="figma-input-group">
                      <span className="figma-input-label">H</span>
                      <input
                        type="number"
                        value={Math.round(primaryNode.height)}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="figma-input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConstrainAspect(!constrainAspect)}
                    className={`p-1.5 rounded hover:bg-[#383838] transition-colors ${
                      constrainAspect ? 'text-[#0D99FF]' : 'text-[#7E7E7E]'
                    }`}
                    title={constrainAspect ? 'Constrain proportions (Locked)' : 'Constrain proportions (Unlocked)'}
                  >
                    {constrainAspect ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="figma-input-group">
                    <span className="figma-input-label">∠</span>
                    <input
                      type="number"
                      value={Math.round(primaryNode.rotation)}
                      onChange={(e) => updateNode(primaryNode.id, { rotation: Number(e.target.value) })}
                      className="figma-input-field"
                    />
                  </div>

                  {'cornerRadius' in primaryNode ? (
                    <div className="figma-input-group">
                      <span className="figma-input-label">R</span>
                      <input
                        type="number"
                        min="0"
                        value={primaryNode.cornerRadius ?? 0}
                        onChange={(e) =>
                          updateNode(primaryNode.id, { cornerRadius: Math.max(0, Number(e.target.value)) })
                        }
                        className="figma-input-field"
                      />
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. TYPOGRAPHY SECTION (If Text node) */}
      {primaryNode.type === 'text' && (() => {
        const textNode = primaryNode as TextNode
        const isBold = textNode.fontWeight === 'bold' || textNode.fontWeight === '700' || textNode.fontWeight === '800' || textNode.fontWeight === '900'
        const isItalic = textNode.fontStyle === 'italic'
        const isUnderline = textNode.textDecoration === 'underline'
        const isStrikethrough = textNode.textDecoration === 'line-through'

        const presetSizes = [12, 14, 16, 20, 24, 32, 48]

        return (
          <div className="pt-2 border-t border-[#383838] space-y-2.5">
            <div
              className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
              onClick={() => setTypographyOpen(!typographyOpen)}
            >
              <div className="flex items-center gap-1">
                {typographyOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Typography</span>
              </div>
            </div>

            {typographyOpen && (
              <div className="space-y-3 animate-in fade-in duration-100">
                {/* 1. Font family selector */}
                <div>
                  <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Font Family</label>
                  <select
                    value={textNode.fontFamily || 'Inter, sans-serif'}
                    onChange={(e) => updateNode(textNode.id, { fontFamily: e.target.value })}
                    aria-label="Font Family"
                    className="w-full bg-[#1E1E1E] border border-[#383838] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0D99FF] cursor-pointer"
                  >
                    <optgroup label="Sans-Serif (Modern & Clean)">
                      <option value="Inter, sans-serif">Inter (Figma Standard)</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Montserrat, sans-serif">Montserrat</option>
                      <option value="-apple-system, BlinkMacSystemFont, sans-serif">SF Pro / Apple</option>
                      <option value="system-ui, sans-serif">System Default</option>
                    </optgroup>
                    <optgroup label="Serif (Editorial & Elegant)">
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="Merriweather, serif">Merriweather</option>
                      <option value="Georgia, serif">Georgia</option>
                    </optgroup>
                    <optgroup label="Monospace (Code & Technical)">
                      <option value="'Fira Code', monospace">Fira Code</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="ui-monospace, monospace">Consolas / Mono</option>
                    </optgroup>
                  </select>
                </div>

                {/* 2. Font Weight & Size */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Weight</label>
                    <select
                      value={textNode.fontWeight || 'normal'}
                      onChange={(e) => updateNode(textNode.id, { fontWeight: e.target.value })}
                      aria-label="Font Weight"
                      className="w-full bg-[#1E1E1E] border border-[#383838] rounded px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="300">Light (300)</option>
                      <option value="normal">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">Semibold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Size (px)</label>
                    <div className="flex items-center bg-[#1E1E1E] border border-[#383838] rounded overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateNode(textNode.id, { fontSize: Math.max(8, (textNode.fontSize || 16) - 1) })}
                        className="px-2 py-1.5 text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C] transition-colors"
                        title="Decrease size"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="8"
                        max="240"
                        value={textNode.fontSize || 16}
                        onChange={(e) => updateNode(textNode.id, { fontSize: Math.max(8, Number(e.target.value)) })}
                        className="w-full bg-transparent text-center text-xs text-white focus:outline-none py-1"
                      />
                      <button
                        type="button"
                        onClick={() => updateNode(textNode.id, { fontSize: Math.min(240, (textNode.fontSize || 16) + 1) })}
                        className="px-2 py-1.5 text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C] transition-colors"
                        title="Increase size"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Size Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {presetSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateNode(textNode.id, { fontSize: sz })}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors shrink-0 ${
                        textNode.fontSize === sz
                          ? 'bg-[#0D99FF] text-white font-bold'
                          : 'bg-[#1E1E1E] text-[#B3B3B3] hover:bg-[#383838] hover:text-white border border-[#383838]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* 4. Style & Decoration Buttons (Bold, Italic, Underline, Strikethrough) */}
                <div>
                  <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Text Style</label>
                  <div className="grid grid-cols-4 gap-1 bg-[#1E1E1E] p-1 rounded-lg border border-[#383838] text-center">
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { fontWeight: isBold ? 'normal' : 'bold' })}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isBold ? 'bg-[#0D99FF] text-white' : 'text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C]'
                      }`}
                      title={isBold ? 'Remove Bold' : 'Make Bold'}
                      aria-label="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { fontStyle: isItalic ? 'normal' : 'italic' })}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isItalic ? 'bg-[#0D99FF] text-white' : 'text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C]'
                      }`}
                      title={isItalic ? 'Remove Italic' : 'Make Italic'}
                      aria-label="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { textDecoration: isUnderline ? 'none' : 'underline' })}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isUnderline ? 'bg-[#0D99FF] text-white' : 'text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C]'
                      }`}
                      title={isUnderline ? 'Remove Underline' : 'Underline'}
                      aria-label="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { textDecoration: isStrikethrough ? 'none' : 'line-through' })}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isStrikethrough ? 'bg-[#0D99FF] text-white' : 'text-[#7E7E7E] hover:text-white hover:bg-[#2C2C2C]'
                      }`}
                      title={isStrikethrough ? 'Remove Strikethrough' : 'Strikethrough'}
                      aria-label="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5. Text Alignment & Letter Spacing */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Alignment</label>
                    <div className="grid grid-cols-3 gap-0.5 bg-[#1E1E1E] p-0.5 rounded border border-[#383838] text-center">
                      <button
                        type="button"
                        onClick={() => updateNode(textNode.id, { textAlign: 'left' })}
                        className={`p-1 rounded ${
                          textNode.textAlign === 'left' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                        }`}
                        title="Align Left"
                        aria-label="Align Left"
                      >
                        <AlignLeft className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateNode(textNode.id, { textAlign: 'center' })}
                        className={`p-1 rounded ${
                          textNode.textAlign === 'center' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                        }`}
                        title="Align Center"
                        aria-label="Align Center"
                      >
                        <AlignCenter className="w-3.5 h-3.5 mx-auto" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateNode(textNode.id, { textAlign: 'right' })}
                        className={`p-1 rounded ${
                          textNode.textAlign === 'right' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                        }`}
                        title="Align Right"
                        aria-label="Align Right"
                      >
                        <AlignRight className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Letter Spacing</label>
                    <div className="flex items-center bg-[#1E1E1E] border border-[#383838] rounded px-2 py-1 text-xs">
                      <span className="text-[#7E7E7E] text-[10px] mr-1.5 font-mono">px</span>
                      <input
                        type="number"
                        min="-5"
                        max="20"
                        value={textNode.letterSpacing ?? 0}
                        onChange={(e) => updateNode(textNode.id, { letterSpacing: Number(e.target.value) })}
                        className="w-full bg-transparent text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Text Transform (UPPERCASE, lowercase, Title Case) */}
                <div>
                  <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Letter Case</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1E1E1E] p-1 rounded border border-[#383838] text-center text-xs">
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { text: (textNode.text || '').toUpperCase() })}
                      className="px-2 py-1 rounded bg-[#2C2C2C] hover:bg-[#383838] text-[#B3B3B3] hover:text-white text-[11px] font-bold transition-colors"
                      title="Transform to UPPERCASE"
                    >
                      AA
                    </button>
                    <button
                      type="button"
                      onClick={() => updateNode(textNode.id, { text: (textNode.text || '').toLowerCase() })}
                      className="px-2 py-1 rounded bg-[#2C2C2C] hover:bg-[#383838] text-[#B3B3B3] hover:text-white text-[11px] font-bold transition-colors"
                      title="Transform to lowercase"
                    >
                      aa
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateNode(textNode.id, {
                          text: (textNode.text || '').replace(
                            /\w\S*/g,
                            (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
                          ),
                        })
                      }
                      className="px-2 py-1 rounded bg-[#2C2C2C] hover:bg-[#383838] text-[#B3B3B3] hover:text-white text-[11px] font-bold transition-colors"
                      title="Transform to Title Case"
                    >
                      Aa
                    </button>
                  </div>
                </div>

                {/* 7. Direct Text Content Editor */}
                <div>
                  <label className="block text-[10px] text-[#7E7E7E] uppercase font-semibold mb-1">Text Content</label>
                  <textarea
                    rows={2}
                    value={textNode.text || ''}
                    onChange={(e) => updateNode(textNode.id, { text: e.target.value })}
                    className="w-full bg-[#1E1E1E] border border-[#383838] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0D99FF] resize-none"
                    placeholder="Enter text..."
                  />
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* 3. APPEARANCE SECTION (Fill, Stroke, Opacity) */}
      <div className="pt-2 border-t border-[#383838] space-y-2.5">
        <div
          className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
          onClick={() => setAppearanceOpen(!appearanceOpen)}
        >
          <div className="flex items-center gap-1">
            {appearanceOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>Appearance</span>
          </div>
        </div>

        {appearanceOpen && (
          <div className="space-y-3 animate-in fade-in duration-100">
            {/* Fill Color */}
            {'fill' in primaryNode && (
              <ColorPicker
                label="Fill"
                color={primaryNode.fill || 'transparent'}
                onChange={(color) => updateNode(primaryNode.id, { fill: color })}
              />
            )}

            {/* Stroke Color & Width */}
            {'stroke' in primaryNode && (
              <div className="space-y-2">
                <ColorPicker
                  label="Stroke"
                  color={primaryNode.stroke || 'transparent'}
                  onChange={(color) => updateNode(primaryNode.id, { stroke: color })}
                />
                <div className="figma-input-group">
                  <span className="figma-input-label">Width</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={primaryNode.strokeWidth ?? 1}
                    onChange={(e) =>
                      updateNode(primaryNode.id, { strokeWidth: Math.max(0, Number(e.target.value)) })
                    }
                    className="figma-input-field"
                  />
                </div>
              </div>
            )}

            {/* Layer Opacity Slider & Percentage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-[#7E7E7E] font-medium">Layer Opacity</span>
                <span className="text-[11px] font-mono text-white">
                  {Math.round((primaryNode.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((primaryNode.opacity ?? 1) * 100)}
                onChange={(e) => updateNode(primaryNode.id, { opacity: Number(e.target.value) / 100 })}
                className="w-full accent-[#0D99FF] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. EFFECTS SECTION (Drop Shadow) */}
      {'shadow' in primaryNode && (
        <div className="pt-2 border-t border-[#383838] space-y-2.5">
          <div
            className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
            onClick={() => setEffectsOpen(!effectsOpen)}
          >
            <div className="flex items-center gap-1">
              {effectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Effects</span>
            </div>
            <input
              type="checkbox"
              checked={!!primaryNode.shadow}
              onChange={(e) => {
                if (e.target.checked) {
                  updateNode(primaryNode.id, {
                    shadow: {
                      color: 'rgba(0, 0, 0, 0.4)',
                      blur: 16,
                      offsetX: 0,
                      offsetY: 8,
                    },
                  })
                } else {
                  updateNode(primaryNode.id, { shadow: undefined })
                }
              }}
              className="accent-[#0D99FF] rounded cursor-pointer"
              title="Toggle drop shadow"
            />
          </div>

          {effectsOpen && primaryNode.shadow && (
            <div className="space-y-2 bg-[#1E1E1E] p-2.5 rounded-lg border border-[#383838] animate-in fade-in duration-100">
              <ColorPicker
                label="Shadow Color"
                color={primaryNode.shadow.color}
                onChange={(color) =>
                  updateNode(primaryNode.id, {
                    shadow: { ...primaryNode.shadow!, color },
                  })
                }
              />

              <div className="grid grid-cols-3 gap-1 pt-1">
                <div className="figma-input-group">
                  <span className="figma-input-label">B</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.blur}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, blur: Math.max(0, Number(e.target.value)) },
                      })
                    }
                    className="figma-input-field"
                  />
                </div>
                <div className="figma-input-group">
                  <span className="figma-input-label">X</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.offsetX}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, offsetX: Number(e.target.value) },
                      })
                    }
                    className="figma-input-field"
                  />
                </div>
                <div className="figma-input-group">
                  <span className="figma-input-label">Y</span>
                  <input
                    type="number"
                    value={primaryNode.shadow.offsetY}
                    onChange={(e) =>
                      updateNode(primaryNode.id, {
                        shadow: { ...primaryNode.shadow!, offsetY: Number(e.target.value) },
                      })
                    }
                    className="figma-input-field"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
