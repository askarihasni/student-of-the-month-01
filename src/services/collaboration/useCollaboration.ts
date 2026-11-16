import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../api/apiClient';
import type { Viewport } from '../../editor/viewport/ViewportController';

export interface PeerCursor {
  socketId: string;
  userId: string;
  name: string;
  color: string;
  avatarUrl?: string | null;
  cursor?: { x: number; y: number; pageId: string };
  selectedNodeIds?: string[];
}

export function useCollaboration(documentId?: string, activePageId?: string) {
  const [peers, setPeers] = useState<Map<string, PeerCursor>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const token = apiClient.getToken();
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-document', { documentId });
    });

    socket.on('connect_error', () => {
      // Gracefully handle connection error when offline
    });

    socket.on('room-peers', (data: { peers: PeerCursor[] }) => {
      const map = new Map<string, PeerCursor>();
      data.peers.forEach((p) => map.set(p.socketId, p));
      setPeers(map);
    });

    socket.on('peer-joined', (data: { peer: PeerCursor }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        next.set(data.peer.socketId, data.peer);
        return next;
      });
    });

    socket.on('peer-left', (data: { socketId: string }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        next.delete(data.socketId);
        return next;
      });
    });

    socket.on('peer-cursor', (data: PeerCursor) => {
      setPeers((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.socketId) || data;
        next.set(data.socketId, {
          ...existing,
          cursor: data.cursor,
        });
        return next;
      });
    });

    socket.on('peer-selection', (data: { socketId: string; selectedNodeIds: string[] }) => {
      setPeers((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.socketId);
        if (existing) {
          next.set(data.socketId, {
            ...existing,
            selectedNodeIds: data.selectedNodeIds,
          });
        }
        return next;
      });
    });

    return () => {
      if (socket.connected) {
        socket.emit('leave-document', { documentId });
        socket.disconnect();
      }
    };
  }, [documentId]);

  const sendCursorMove = useCallback(
    (worldX: number, worldY: number) => {
      if (!socketRef.current || !documentId || !activePageId) return;
      socketRef.current.emit('cursor-move', {
        documentId,
        pageId: activePageId,
        x: worldX,
        y: worldY,
      });
    },
    [documentId, activePageId]
  );

  const sendSelectionChange = useCallback(
    (selectedNodeIds: string[]) => {
      if (!socketRef.current || !documentId) return;
      socketRef.current.emit('selection-change', {
        documentId,
        selectedNodeIds,
      });
    },
    [documentId]
  );

  const broadcastDocumentChange = useCallback(
    (version: number) => {
      if (!socketRef.current || !documentId) return;
      socketRef.current.emit('document-change', {
        documentId,
        version,
      });
    },
    [documentId]
  );

  return {
    peers: Array.from(peers.values()),
    sendCursorMove,
    sendSelectionChange,
    broadcastDocumentChange,
  };
}

