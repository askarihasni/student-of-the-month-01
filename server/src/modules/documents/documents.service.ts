import { Role, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors/app-error.js';
import { DocumentModel } from '../../shared/schemas/document.schema.js';
import { ListDocumentsQuery } from './documents.schema.js';
import { randomUUID } from 'node:crypto';

export class DocumentsService {
  async createDocument(userId: string, name: string = 'Untitled Design', template: string = 'blank') {
    const documentId = randomUUID();
    const now = new Date().toISOString();

    const initialData = this.generateDocumentTemplate(documentId, name, template, now);

    const doc = await prisma.document.create({
      data: {
        id: documentId,
        name,
        ownerId: userId,
        version: 1,
        data: initialData as any,
        permissions: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return {
      ...doc,
      userRole: Role.OWNER,
    };
  }

  async listDocuments(userId: string, query: ListDocumentsQuery) {
    const { filter, q, page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentWhereInput = {
      isDeleted: false,
    };

    // Filter logic
    if (filter === 'shared') {
      // Shared with user (user has permission, but is not the owner)
      where.ownerId = { not: userId };
      where.permissions = {
        some: { userId },
      };
    } else if (filter === 'drafts') {
      // User's private drafts
      where.ownerId = userId;
      where.name = { contains: 'Draft', mode: 'insensitive' };
    } else if (filter === 'design-system') {
      // Team / Design system templates
      where.OR = [
        { ownerId: userId },
        { permissions: { some: { userId } } },
        { isPublic: true },
      ];
      where.name = { contains: 'Design System', mode: 'insensitive' };
    } else if (filter === 'mobile-app') {
      // Mobile app team files
      where.OR = [
        { ownerId: userId },
        { permissions: { some: { userId } } },
        { isPublic: true },
      ];
      where.name = { contains: 'Mobile', mode: 'insensitive' };
    } else {
      // 'recent' - all accessible documents
      where.OR = [
        { ownerId: userId },
        { permissions: { some: { userId } } },
        { isPublic: true },
      ];
    }

    // Search query
    if (q) {
      where.name = { contains: q, mode: 'insensitive' };
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          permissions: {
            where: { userId },
            select: { role: true },
          },
        },
      }),
    ]);

    const formattedDocuments = documents.map((doc) => {
      let role: Role = Role.VIEWER;
      if (doc.ownerId === userId) {
        role = Role.OWNER;
      } else if (doc.permissions.length > 0) {
        role = doc.permissions[0].role;
      }

      const docData = doc.data as any;
      const pagesCount = docData?.pages?.length || 1;
      let layerCount = 0;
      if (docData?.pages) {
        for (const p of docData.pages) {
          layerCount += Object.keys(p.nodes || {}).length;
        }
      }

      return {
        id: doc.id,
        name: doc.name,
        version: doc.version,
        thumbnailUrl: doc.thumbnailUrl,
        isPublic: doc.isPublic,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        owner: doc.owner,
        userRole: role,
        pagesCount,
        layerCount,
      };
    });

    return {
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(documentId: string, userId?: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        permissions: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!doc || doc.isDeleted) {
      throw new NotFoundError('Document not found');
    }

    let userRole: Role | null = null;
    if (userId) {
      if (doc.ownerId === userId) {
        userRole = Role.OWNER;
      } else {
        const perm = doc.permissions.find((p) => p.userId === userId);
        if (perm) {
          userRole = perm.role;
        }
      }
    }

    if (!userRole && doc.isPublic) {
      userRole = Role.VIEWER;
    }

    if (!userRole) {
      throw new ForbiddenError('You do not have permission to view this document');
    }

    return {
      ...doc,
      userRole,
    };
  }

  async updateDocumentMetadata(documentId: string, name?: string, isPublic?: boolean) {
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(name ? { name } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
      },
    });

    return updated;
  }

  async softDeleteDocument(documentId: string) {
    await prisma.document.update({
      where: { id: documentId },
      data: { isDeleted: true },
    });
  }

  async duplicateDocument(documentId: string, userId: string) {
    const sourceDoc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!sourceDoc || sourceDoc.isDeleted) {
      throw new NotFoundError('Source document not found');
    }

    const newDocId = randomUUID();
    const sourceData = sourceDoc.data as any;
    const duplicatedData = {
      ...sourceData,
      id: newDocId,
      name: `${sourceDoc.name} (Copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDoc = await prisma.document.create({
      data: {
        id: newDocId,
        name: `${sourceDoc.name} (Copy)`,
        ownerId: userId,
        version: 1,
        thumbnailUrl: sourceDoc.thumbnailUrl,
        data: duplicatedData as any,
        permissions: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return {
      ...newDoc,
      userRole: Role.OWNER,
    };
  }

  async syncDocument(
    documentId: string,
    expectedVersion: number,
    data: DocumentModel,
    userId?: string,
    thumbnailUrl?: string | null,
    _nodeCount?: number
  ) {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.document.findUnique({
        where: { id: documentId },
        select: { id: true, version: true, updatedAt: true, isDeleted: true },
      });

      if (!current || current.isDeleted) {
        throw new NotFoundError('Document not found');
      }

      if (current.version !== expectedVersion) {
        throw new ConflictError(
          `Version conflict: Expected version ${expectedVersion}, but current database version is ${current.version}`,
          {
            currentVersion: current.version,
            serverUpdatedAt: current.updatedAt.toISOString(),
          }
        );
      }

      const nextVersion = expectedVersion + 1;
      const updatedData = {
        ...data,
        id: documentId,
        version: nextVersion,
        updatedAt: new Date().toISOString(),
      };

      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          data: updatedData as any,
          version: nextVersion,
          name: data.name || undefined,
          ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
        },
        select: {
          id: true,
          name: true,
          version: true,
          updatedAt: true,
          thumbnailUrl: true,
        },
      });

      // Automatically create snapshot every 10 versions
      if (nextVersion % 10 === 0 && userId) {
        await tx.documentVersion.create({
          data: {
            documentId,
            versionNumber: nextVersion,
            name: `Autosave milestone v${nextVersion}`,
            snapshot: updatedData as any,
            createdById: userId,
          },
        });
      }

      return updated;
    });
  }

  private generateDocumentTemplate(
    docId: string,
    name: string,
    template: string,
    now: string
  ): DocumentModel {
    const pageId = 'page_1';

    if (template === 'mobile-app') {
      return {
        schemaVersion: 1,
        id: docId,
        name,
        version: 1,
        createdAt: now,
        updatedAt: now,
        activePageId: pageId,
        pages: [
          {
            id: pageId,
            name: 'Mobile Screen',
            viewport: { x: 0, y: 0, zoom: 1 },
            rootNodeIds: ['screen_frame'],
            nodes: {
              screen_frame: {
                id: 'screen_frame',
                type: 'frame',
                name: 'iPhone 15 Pro',
                x: 100,
                y: 60,
                width: 393,
                height: 852,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: {
                  fill: '#0f172a',
                  stroke: '#334155',
                  strokeWidth: 2,
                  cornerRadius: 48,
                },
                childIds: ['app_header', 'balance_card', 'action_btn'],
              },
              app_header: {
                id: 'app_header',
                type: 'text',
                name: 'Header',
                x: 130,
                y: 120,
                width: 330,
                height: 36,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                text: 'Crypto Wallet',
                fontSize: 22,
                fontFamily: 'Inter',
                fontWeight: 700,
                textAlign: 'left',
                style: { fill: '#ffffff' },
                parentId: 'screen_frame',
              },
              balance_card: {
                id: 'balance_card',
                type: 'rectangle',
                name: 'Card Background',
                x: 125,
                y: 180,
                width: 343,
                height: 180,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: {
                  fill: '#1e293b',
                  stroke: '#3b82f6',
                  strokeWidth: 1.5,
                  cornerRadius: 20,
                },
                parentId: 'screen_frame',
              },
              action_btn: {
                id: 'action_btn',
                type: 'rectangle',
                name: 'Send Button',
                x: 145,
                y: 390,
                width: 140,
                height: 48,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: {
                  fill: '#2563eb',
                  cornerRadius: 12,
                },
                parentId: 'screen_frame',
              },
            },
          },
        ],
      };
    }

    if (template === 'design-system') {
      return {
        schemaVersion: 1,
        id: docId,
        name,
        version: 1,
        createdAt: now,
        updatedAt: now,
        activePageId: pageId,
        pages: [
          {
            id: pageId,
            name: 'Design System',
            viewport: { x: 0, y: 0, zoom: 1 },
            rootNodeIds: ['typography_frame', 'palette_frame'],
            nodes: {
              typography_frame: {
                id: 'typography_frame',
                type: 'frame',
                name: 'Typography System',
                x: 80,
                y: 80,
                width: 440,
                height: 360,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: {
                  fill: '#18181b',
                  stroke: '#27272a',
                  strokeWidth: 1,
                  cornerRadius: 16,
                },
                childIds: ['heading_text', 'body_text'],
              },
              heading_text: {
                id: 'heading_text',
                type: 'text',
                name: 'Display H1',
                x: 110,
                y: 120,
                width: 380,
                height: 48,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                text: 'Display Bold 32px',
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: 800,
                textAlign: 'left',
                style: { fill: '#ffffff' },
                parentId: 'typography_frame',
              },
              body_text: {
                id: 'body_text',
                type: 'text',
                name: 'Body Regular',
                x: 110,
                y: 180,
                width: 380,
                height: 60,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                text: 'Inter Regular 16px - High readability system typography with balanced tracking.',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: 400,
                textAlign: 'left',
                style: { fill: '#a1a1aa' },
                parentId: 'typography_frame',
              },
              palette_frame: {
                id: 'palette_frame',
                type: 'frame',
                name: 'Color Tokens',
                x: 560,
                y: 80,
                width: 440,
                height: 360,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: {
                  fill: '#18181b',
                  stroke: '#27272a',
                  strokeWidth: 1,
                  cornerRadius: 16,
                },
                childIds: ['color_swatch_1', 'color_swatch_2'],
              },
              color_swatch_1: {
                id: 'color_swatch_1',
                type: 'rectangle',
                name: 'Primary 500',
                x: 590,
                y: 130,
                width: 80,
                height: 80,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: { fill: '#3b82f6', cornerRadius: 10 },
                parentId: 'palette_frame',
              },
              color_swatch_2: {
                id: 'color_swatch_2',
                type: 'rectangle',
                name: 'Accent Violet',
                x: 690,
                y: 130,
                width: 80,
                height: 80,
                rotation: 0,
                opacity: 1,
                visible: true,
                locked: false,
                style: { fill: '#8b5cf6', cornerRadius: 10 },
                parentId: 'palette_frame',
              },
            },
          },
        ],
      };
    }

    // Default blank template
    return {
      schemaVersion: 1,
      id: docId,
      name,
      version: 1,
      createdAt: now,
      updatedAt: now,
      activePageId: pageId,
      pages: [
        {
          id: pageId,
          name: 'Page 1',
          viewport: { x: 0, y: 0, zoom: 1 },
          rootNodeIds: [],
          nodes: {},
        },
      ],
    };
  }
}

export const documentsService = new DocumentsService();
