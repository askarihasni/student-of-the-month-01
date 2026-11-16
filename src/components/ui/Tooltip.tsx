import React, { useState } from 'react'

export interface TooltipProps {
  content: string
  shortcut?: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  children,
  side = 'bottom',
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const sidePositions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-nowrap bg-zinc-900 border border-zinc-700/80 text-zinc-200 text-[11px] px-2 py-1 rounded shadow-lg flex items-center gap-1.5 ${sidePositions[side]}`}
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded text-[10px] font-mono border border-zinc-700">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  )
}
