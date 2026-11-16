import React, { useState } from 'react'

export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  showAlpha?: boolean
}

const FIGMA_SWATCHES = [
  '#000000',
  '#FFFFFF',
  '#F24E1E', // Figma Red-Orange
  '#FF7262', // Figma Coral
  '#A259FF', // Figma Purple
  '#1ABCFE', // Figma Sky Blue
  '#0ACF83', // Figma Green
  '#0D99FF', // Figma Focus Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#2C2C2C', // Dark Slate
  'transparent',
]

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
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

  return (
    <div className="relative">
      {label && <label className="block text-[11px] font-medium text-[#8C8C8C] mb-1">{label}</label>}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 h-6 rounded-[3px] border border-[#444444] shadow-inner flex items-center justify-center shrink-0 overflow-hidden hover:border-[#0D99FF] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0D99FF]"
          style={{
            backgroundColor: isTransparent ? 'transparent' : color,
            backgroundImage: isTransparent
              ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 6px 6px'
              : undefined,
          }}
          title="Pick color"
        />

        <div className="relative flex-1">
          <input
            type="text"
            value={color.toUpperCase()}
            onChange={handleHexChange}
            className="w-full bg-[#1E1E1E] border border-[#383838] text-[#E0E0E0] text-[11px] px-2 py-1 rounded-[3px] font-mono uppercase focus:outline-none focus:border-[#0D99FF] focus:text-white"
          />
        </div>

        <input
          type="color"
          value={isTransparent ? '#ffffff' : color.startsWith('#') ? color : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          id={`native-color-${label || 'picker'}`}
        />
        <label
          htmlFor={`native-color-${label || 'picker'}`}
          className="cursor-pointer text-[10px] text-[#A0A0A0] hover:text-white px-1.5 py-1 rounded-[3px] border border-[#383838] bg-[#242424] hover:bg-[#2C2C2C] transition-colors shrink-0 font-medium"
          title="Open native color picker wheel"
        >
          Wheel
        </label>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1.5 p-3 bg-[#242424] border border-[#383838] rounded-md shadow-2xl z-50 w-52 text-white">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C8C] mb-2">Preset Swatches</div>
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {FIGMA_SWATCHES.map((swatch) => (
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
                        ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 50% / 5px 5px'
                        : undefined,
                  }}
                  title={swatch}
                />
              ))}
            </div>

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

