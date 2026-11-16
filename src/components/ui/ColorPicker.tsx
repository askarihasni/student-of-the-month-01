import React, { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'

export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  showAlpha?: boolean
  showPalette?: boolean
  compact?: boolean
}

// Curated 14 design colors for instant 1-click access
const QUICK_PALETTE: { name: string; hex: string }[] = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Light Gray', hex: '#CBD5E1' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Dark Slate', hex: '#1E293B' },
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Figma Blue', hex: '#0D99FF' },
  { name: 'Sky Cyan', hex: '#06B6D4' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Coral Red', hex: '#EF4444' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Transparent', hex: 'transparent' },
]

// Extended swatches categorized for popover
const BRAND_SWATCHES = [
  '#0D99FF', // Focus Blue
  '#0ACF83', // Figma Green
  '#A259FF', // Figma Purple
  '#FF7262', // Figma Coral
  '#F24E1E', // Figma Red-Orange
  '#1ABCFE', // Figma Sky
]

const VIBRANT_SWATCHES = [
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#84CC16',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#6366F1',
  '#14B8A6',
  '#F43F5E',
]

const NEUTRAL_SWATCHES = [
  '#FFFFFF',
  '#F8FAFC',
  '#E2E8F0',
  '#94A3B8',
  '#64748B',
  '#334155',
  '#1E293B',
  '#0F172A',
  '#000000',
  'transparent',
]

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  showPalette = true,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isTransparent = color === 'transparent' || !color

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim()
    if (!val.startsWith('#') && val !== 'transparent') {
      val = `#${val}`
    }
    onChange(val)
  }

  // Extract unique colors used in current document layers
  const getDocumentColors = (): string[] => {
    try {
      const doc = useEditorStore.getState().document
      if (!doc || !doc.pages) return []
      const found = new Set<string>()
      for (const page of doc.pages) {
        const nodes = Array.isArray(page.nodes)
          ? page.nodes
          : page.nodes && typeof page.nodes === 'object'
          ? Object.values(page.nodes)
          : []
        for (const n of nodes as any[]) {
          if (n && typeof n.fill === 'string' && n.fill !== 'transparent' && n.fill.startsWith('#')) {
            found.add(n.fill.toUpperCase())
          }
          if (n && typeof n.stroke === 'string' && n.stroke !== 'transparent' && n.stroke.startsWith('#')) {
            found.add(n.stroke.toUpperCase())
          }
        }
      }
      return Array.from(found).slice(0, 12)
    } catch {
      return []
    }
  }

  const documentColors = isOpen ? getDocumentColors() : []

  return (
    <div className="relative select-none">
      {/* Label and Hex code badge */}
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">{label}</label>
          <span className="text-[10px] text-[#A1A1AA] font-mono uppercase bg-[#181818] px-1.5 py-0.5 rounded border border-[#333333]">
            {isTransparent ? 'TRANSPARENT' : color}
          </span>
        </div>
      )}

      {/* Main input row: Swatch + Hex Input + Native Wheel */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 h-6 rounded-[4px] border border-[#444444] shadow-inner flex items-center justify-center shrink-0 overflow-hidden hover:border-[#0D99FF] transition-all focus:outline-none focus:ring-1 focus:ring-[#0D99FF]"
          style={{
            backgroundColor: isTransparent ? 'transparent' : color,
            backgroundImage: isTransparent
              ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 6px 6px'
              : undefined,
          }}
          title={isTransparent ? 'Color: Transparent (Click for palette)' : `Color: ${color} (Click for palette)`}
          aria-label="Toggle color palette popover"
        />

        <div className="relative flex-1">
          <input
            type="text"
            value={isTransparent ? 'transparent' : color.toUpperCase()}
            onChange={handleHexChange}
            className="w-full bg-[#181818] border border-[#383838] text-[#E0E0E0] text-[11px] px-2 py-1 rounded-[4px] font-mono uppercase focus:outline-none focus:border-[#0D99FF] focus:text-white"
            placeholder="#HEX"
          />
        </div>

        <input
          type="color"
          value={isTransparent ? '#ffffff' : color.startsWith('#') ? color : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          id={`native-color-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'picker'}-${Math.random().toString(36).substring(2, 7)}`}
        />
        <label
          htmlFor={`native-color-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'picker'}-${Math.random().toString(36).substring(2, 7)}`}
          onClick={(e) => {
            const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
            if (input) input.click()
          }}
          className="cursor-pointer text-[10px] text-[#A0A0A0] hover:text-white px-2 py-1 rounded-[4px] border border-[#383838] bg-[#222222] hover:bg-[#2C2C2C] transition-colors shrink-0 font-medium select-none"
          title="Open native color spectrum wheel"
        >
          Wheel
        </label>
      </div>

      {/* Inline Quick Palette Swatches Strip (7 columns x 2 rows = 14 swatches) */}
      {showPalette && (
        <div className="mt-2 pt-2 border-t border-[#383838]/60">
          <div className="flex items-center justify-between text-[9px] text-[#7E7E7E] uppercase font-semibold mb-1">
            <span>Color Palette</span>
            <span className="text-[9px] text-[#555]">1-Click</span>
          </div>
          <div className={`grid ${compact ? 'grid-cols-7' : 'grid-cols-7'} gap-1.5`}>
            {QUICK_PALETTE.map((swatch) => {
              const isSelected = isTransparent
                ? swatch.hex === 'transparent'
                : (color || '').toLowerCase() === swatch.hex.toLowerCase()

              return (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => onChange(swatch.hex)}
                  className={`w-full aspect-square rounded-[3px] border transition-all hover:scale-110 flex items-center justify-center relative overflow-hidden ${
                    isSelected
                      ? 'border-[#0D99FF] ring-2 ring-[#0D99FF]/50 scale-105'
                      : 'border-[#444444] hover:border-white'
                  }`}
                  style={{
                    backgroundColor: swatch.hex === 'transparent' ? 'transparent' : swatch.hex,
                    backgroundImage:
                      swatch.hex === 'transparent'
                        ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 50% / 4px 4px'
                        : undefined,
                  }}
                  title={`${swatch.name} (${swatch.hex})`}
                  aria-label={`Select ${swatch.name}`}
                >
                  {isSelected && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        swatch.hex === '#FFFFFF' || swatch.hex === '#CBD5E1' || swatch.hex === 'transparent'
                          ? 'bg-black'
                          : 'bg-white'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Advanced Swatch Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 p-3 bg-[#242424] border border-[#383838] rounded-lg shadow-2xl z-50 w-64 text-white animate-in fade-in zoom-in-95 duration-100">
            {/* Document Colors section (if available) */}
            {documentColors.length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#0D99FF] mb-1.5">
                  Document Colors
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {documentColors.map((docColor) => (
                    <button
                      key={docColor}
                      type="button"
                      onClick={() => {
                        onChange(docColor)
                        setIsOpen(false)
                      }}
                      className="w-6 h-6 rounded-[3px] border border-[#444444] hover:scale-110 hover:border-white transition-all relative overflow-hidden"
                      style={{ backgroundColor: docColor }}
                      title={`Document color: ${docColor}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Standard Figma / UI Swatches */}
            <div className="mb-3">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C8C] mb-1.5">
                Standard UI Colors
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {BRAND_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      onChange(swatch)
                      setIsOpen(false)
                    }}
                    className="w-6 h-6 rounded-[3px] border border-[#444444] hover:scale-110 hover:border-white transition-all relative overflow-hidden"
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>

            {/* Vibrant Palette */}
            <div className="mb-3">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C8C] mb-1.5">
                Vibrant Palette
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {VIBRANT_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      onChange(swatch)
                      setIsOpen(false)
                    }}
                    className="w-6 h-6 rounded-[3px] border border-[#444444] hover:scale-110 hover:border-white transition-all relative overflow-hidden"
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>

            {/* Neutrals & Monochromes */}
            <div className="mb-3">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C8C] mb-1.5">
                Grayscale & Neutrals
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {NEUTRAL_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      onChange(swatch)
                      setIsOpen(false)
                    }}
                    className="w-6 h-6 rounded-[3px] border border-[#444444] hover:scale-110 hover:border-white transition-all relative overflow-hidden"
                    style={{
                      backgroundColor: swatch === 'transparent' ? 'transparent' : swatch,
                      backgroundImage:
                        swatch === 'transparent'
                          ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 50% / 4px 4px'
                          : undefined,
                    }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 border-t border-[#383838] flex justify-between items-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  onChange('transparent')
                  setIsOpen(false)
                }}
                className="text-[#8C8C8C] hover:text-[#FF7262] transition-colors font-medium"
              >
                Clear / Transparent
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#8C8C8C] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
