import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../../shared/utils/tokens.js';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

interface PeerState {
  socketId: string;
  userId: string;
  name: string;
  color: string;
  avatarUrl?: string | null;
  cursor?: { x: number; y: number; pageId: string };
  selectedNodeIds?: string[];
}

const PEER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export class CollaborationGateway {
  private io: SocketIOServer | null = null;
  // Map of documentId -> Map of socketId -> PeerState
  private rooms: Map<string, Map<string, PeerState>> = new Map();

  initialize(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.isProduction ? false : true,
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 15000,
    });

    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        let token: string | undefined = socket.handshake.auth?.token;

        if (!token && socket.handshake.headers.authorization) {
          const authHeader = socket.handshake.headers.authorization;
          if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
          }
        }

        if (token) {
          const payload = verifyAccessToken(token);
          const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, name: true, email: true, avatarUrl: true },
          });

          if (user) {
            socket.data.user = user;
            return next();
          }
        }

        // Allow guest view if anonymous
        const guestId = `guest_${socket.id.substring(0, 6)}`;
        socket.data.user = {
          id: guestId,
          name: `Guest ${socket.id.substring(0, 4)}`,
          email: `${guestId}@anonymous.vectorly`,
          avatarUrl: null,
          isGuest: true,
        };
        next();
      } catch (err) {
        logger.warn({ err }, 'Socket authentication error; assigning guest mode');
        const guestId = `guest_${socket.id.substring(0, 6)}`;
        socket.data.user = {
          id: guestId,
          name: `Guest ${socket.id.substring(0, 4)}`,
          email: `${guestId}@anonymous.vectorly`,
          avatarUrl: null,
          isGuest: true,
        };
        next();
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user;
      logger.info({ socketId: socket.id, userId: user.id }, 'Socket client connected');

      // Pick a random color for peer cursor
      const colorIndex = Math.floor(Math.random() * PEER_COLORS.length);
      const peerColor = PEER_COLORS[colorIndex];

      // Join document room
      socket.on('join-document', async (data: { documentId: string }) => {
        const { documentId } = data;
        if (!documentId) return;

        const roomName = `doc:${documentId}`;
        socket.join(roomName);

        if (!this.rooms.has(documentId)) {
          this.rooms.set(documentId, new Map());
        }

        const roomPeers = this.rooms.get(documentId)!;
        const peer: PeerState = {
          socketId: socket.id,
          userId: user.id,
          name: user.name,
          color: peerColor,
          avatarUrl: user.avatarUrl,
        };
        roomPeers.set(socket.id, peer);

        // Send existing room peers to this client
        const activePeers = Array.from(roomPeers.values()).filter((p) => p.socketId !== socket.id);
        socket.emit('room-peers', { peers: activePeers });

        // Broadcast peer-joined to others in room
        socket.to(roomName).emit('peer-joined', { peer });
        logger.debug({ documentId, userId: user.id }, 'User joined document room');
      });

      // Leave document room
      socket.on('leave-document', (data: { documentId: string }) => {
        const { documentId } = data;
        if (!documentId) return;

        this.handlePeerLeave(socket, documentId);
      });

      // Cursor movement
      socket.on('cursor-move', (data: { documentId: string; pageId: string; x: number; y: number }) => {
        const { documentId, pageId, x, y } = data;
        if (!documentId) return;

        const roomPeers = this.rooms.get(documentId);
        if (roomPeers && roomPeers.has(socket.id)) {
          const peer = roomPeers.get(socket.id)!;
          peer.cursor = { x, y, pageId };
        }

        socket.to(`doc:${documentId}`).emit('peer-cursor', {
          socketId: socket.id,
          userId: user.id,
          name: user.name,
          color: peerColor,
          cursor: { x, y, pageId },
        });
      });

      // Selection changes
      socket.on('selection-change', (data: { documentId: string; selectedNodeIds: string[] }) => {
        const { documentId, selectedNodeIds } = data;
        if (!documentId) return;

        const roomPeers = this.rooms.get(documentId);
        if (roomPeers && roomPeers.has(socket.id)) {
          const peer = roomPeers.get(socket.id)!;
          peer.selectedNodeIds = selectedNodeIds;
        }

        socket.to(`doc:${documentId}`).emit('peer-selection', {
          socketId: socket.id,
          userId: user.id,
          selectedNodeIds,
        });
      });

      // Document changes broadcast
      socket.on('document-change', (data: { documentId: string; version: number }) => {
        const { documentId, version } = data;
        if (!documentId) return;

        socket.to(`doc:${documentId}`).emit('document-updated', {
          version,
          updatedBy: user.id,
        });
      });

      // Comments events broadcast
      socket.on('comment-event', (data: { documentId: string; type: string; comment: any }) => {
        const { documentId, type, comment } = data;
        if (!documentId) return;

        socket.to(`doc:${documentId}`).emit('comment-updated', {
          type,
          comment,
        });
      });

      // Disconnect cleanup
      socket.on('disconnect', () => {
        logger.info({ socketId: socket.id }, 'Socket client disconnected');
        for (const [documentId, roomPeers] of this.rooms.entries()) {
          if (roomPeers.has(socket.id)) {
            this.handlePeerLeave(socket, documentId);
          }
        }
      });
    });

    return this.io;
  }

  private handlePeerLeave(socket: Socket, documentId: string) {
    const roomName = `doc:${documentId}`;
    socket.leave(roomName);

    const roomPeers = this.rooms.get(documentId);
    if (roomPeers) {
      roomPeers.delete(socket.id);
      if (roomPeers.size === 0) {
        this.rooms.delete(documentId);
      }
    }

    socket.to(roomName).emit('peer-left', { socketId: socket.id });
  }
}

export const collaborationGateway = new CollaborationGateway();
