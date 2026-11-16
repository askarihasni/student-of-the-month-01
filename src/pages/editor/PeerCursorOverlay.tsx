import React from 'react';
import type { PeerCursor } from '../../services/collaboration/useCollaboration';
import type { Viewport } from '../../editor/viewport/ViewportController';

interface PeerCursorOverlayProps {
  peers: PeerCursor[];
  viewport: Viewport;
  activePageId: string;
}

export const PeerCursorOverlay: React.FC<PeerCursorOverlayProps> = ({
  peers,
  viewport,
  activePageId,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {peers.map((peer) => {
        if (!peer.cursor || peer.cursor.pageId !== activePageId) return null;

        // Transform world coordinates to screen coordinates
        const screenX = peer.cursor.x * viewport.zoom + viewport.x;
        const screenY = peer.cursor.y * viewport.zoom + viewport.y;

        return (
          <div
            key={peer.socketId}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
              willChange: 'transform',
            }}
          >
            {/* Custom SVG cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-sm"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={peer.color}
                stroke="#000000"
                strokeWidth="1"
              />
            </svg>

            {/* Peer badge label */}
            <div
              className="ml-4 -mt-1 px-2 py-0.5 rounded text-[11px] font-semibold text-white whitespace-nowrap shadow-md flex items-center gap-1"
              style={{ backgroundColor: peer.color }}
            >
              {peer.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
