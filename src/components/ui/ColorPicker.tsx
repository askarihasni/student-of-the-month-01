import React, { useState } from 'react'

export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  showAlpha?: boolean
}

const PRESET_SWATCHES = [
  '#000000',
  '#FFFFFF',
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#18181B', // Dark Zinc
  '#64748B', // Slate
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
      {label && <label className="block text-[11px] text-zinc-400 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 h-6 rounded border border-zinc-700 shadow-inner flex items-center justify-center shrink-0 overflow-hidden focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{
            backgroundColor: isTransparent ? 'transparent' : color,
            backgroundImage: isTransparent
              ? 'repeating-conic-gradient(#555 0% 25%, #333 0% 50%) 50% / 8px 8px'
              : undefined,
          }}
          title="Pick color"
        />

        <input
          type="text"
          value={color.toUpperCase()}
          onChange={handleHexChange}
          className="w-24 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded font-mono uppercase focus:outline-none focus:border-blue-500"
        />

        <input
          type="color"
          value={isTransparent ? '#ffffff' : color.startsWith('#') ? color : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute w-0 h-0 pointer-events-none"
          id={`native-color-${label || 'picker'}`}
        />
        <label
          htmlFor={`native-color-${label || 'picker'}`}
          className="cursor-pointer text-xs text-zinc-400 hover:text-white px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-850 hover:bg-zinc-800"
        >
          Wheel
        </label>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 w-52">
            <div className="text-[11px] font-medium text-zinc-400 mb-2">Preset Colors</div>
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {PRESET_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => {
                    onChange(swatch)
                    setIsOpen(false)
                  }}
                  className="w-6 h-6 rounded border border-zinc-700/80 hover:scale-110 transition-transform relative overflow-hidden"
                  style={{
                    backgroundColor: swatch === 'transparent' ? 'transparent' : swatch,
                    backgroundImage:
                      swatch === 'transparent'
                        ? 'repeating-conic-gradient(#666 0% 25%, #333 0% 50%) 50% / 6px 6px'
                        : undefined,
                  }}
                  title={swatch}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  onChange('transparent')
                  setIsOpen(false)
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear / Transparent
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
