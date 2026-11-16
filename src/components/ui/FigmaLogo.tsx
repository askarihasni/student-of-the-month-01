import React from 'react'

export interface FigmaLogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
  textSize?: string
}

export const FigmaLogo: React.FC<FigmaLogoProps> = ({
  size = 24,
  showWordmark = true,
  className = '',
  textSize,
}) => {
  const isLarge = size >= 24
  const fontCls = textSize || (isLarge ? 'text-base font-bold' : 'text-sm font-semibold')

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 4-quadrant geometric logo: 3 rounded squircle tiles + 1 white circle */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
        aria-label="Logo"
      >
        {/* Top-Left: Purple squircle */}
        <rect x="2" y="2" width="12.5" height="12.5" rx="3.5" fill="#8B7CFF" />
        {/* Top-Right: Mint/Teal squircle */}
        <rect x="17.5" y="2" width="12.5" height="12.5" rx="3.5" fill="#38C9A5" />
        {/* Bottom-Left: Coral/Orange squircle */}
        <rect x="2" y="17.5" width="12.5" height="12.5" rx="3.5" fill="#FF9C68" />
        {/* Bottom-Right: White circle */}
        <circle cx="23.75" cy="23.75" r="6.25" fill="#FFFFFF" />
      </svg>

      {showWordmark && (
        <div className="flex items-center gap-2 leading-none">
          <span className={`text-white tracking-tight font-sans ${fontCls}`}>
            Mini Figma
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#383838] text-[#B3B3B3] border border-[#444444]">
            Pro
          </span>
        </div>
      )}
    </div>
  )
}
