import { prisma } from './prisma.js';
import { hashPassword } from '../shared/utils/hash.js';
import { Role } from '@prisma/client';
import { logger } from '../config/logger.js';

async function seed() {
  logger.info('Starting database seed...');

  // 1. Create or update default designer user
  const email = 'designer@minifigma.io';
  const passwordHash = await hashPassword('password123');

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Askari Hasni',
      avatarUrl: '/avatar.jpg',
    },
    create: {
      email,
      name: 'Askari Hasni',
      passwordHash,
      avatarUrl: '/avatar.jpg',
    },
  });

  logger.info({ userId: user.id, email: user.email }, 'Seeded default user');

  // 2. Check if default documents already exist
  const existingDocs = await prisma.document.count({
    where: { ownerId: user.id },
  });

  if (existingDocs === 0) {
    logger.info('Creating starter design documents...');

    // Document 1: Crypto Wallet Mobile App
    const doc1Id = 'doc_crypto_wallet_001';
    const doc1Data = {
      schemaVersion: 1,
      id: doc1Id,
      name: 'Crypto Wallet Mobile App',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activePageId: 'page_crypto',
      pages: [
        {
          id: 'page_crypto',
          name: 'Wallet Screens',
          viewport: { x: 0, y: 0, zoom: 1 },
          rootNodeIds: ['phone_frame'],
          nodes: {
            phone_frame: {
              id: 'phone_frame',
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
              childIds: ['wallet_header', 'balance_card', 'send_button', 'receive_button'],
            },
            wallet_header: {
              id: 'wallet_header',
              type: 'text',
              name: 'Header Title',
              x: 130,
              y: 120,
              width: 330,
              height: 36,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              text: 'Total Balance',
              fontSize: 18,
              fontFamily: 'Inter',
              fontWeight: 500,
              textAlign: 'left',
              style: { fill: '#94a3b8' },
              parentId: 'phone_frame',
            },
            balance_card: {
              id: 'balance_card',
              type: 'rectangle',
              name: 'Portfolio Card',
              x: 125,
              y: 170,
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
                cornerRadius: 24,
              },
              parentId: 'phone_frame',
            },
            send_button: {
              id: 'send_button',
              type: 'rectangle',
              name: 'Send Action',
              x: 145,
              y: 380,
              width: 140,
              height: 48,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: {
                fill: '#2563eb',
                cornerRadius: 14,
              },
              parentId: 'phone_frame',
            },
            receive_button: {
              id: 'receive_button',
              type: 'rectangle',
              name: 'Receive Action',
              x: 305,
              y: 380,
              width: 140,
              height: 48,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: {
                fill: '#334155',
                cornerRadius: 14,
              },
              parentId: 'phone_frame',
            },
          },
        },
      ],
    };

    await prisma.document.create({
      data: {
        id: doc1Id,
        name: 'Crypto Wallet Mobile App',
        ownerId: user.id,
        version: 1,
        data: doc1Data as any,
        permissions: {
          create: {
            userId: user.id,
            role: Role.OWNER,
          },
        },
      },
    });

    // Document 2: Design System Hero & Components
    const doc2Id = 'doc_design_system_002';
    const doc2Data = {
      schemaVersion: 1,
      id: doc2Id,
      name: 'Design System Hero & Components',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activePageId: 'page_ds',
      pages: [
        {
          id: 'page_ds',
          name: 'Core System',
          viewport: { x: 0, y: 0, zoom: 1 },
          rootNodeIds: ['system_board'],
          nodes: {
            system_board: {
              id: 'system_board',
              type: 'frame',
              name: 'Typography & Colors',
              x: 80,
              y: 60,
              width: 800,
              height: 500,
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
              childIds: ['ds_title', 'color_1', 'color_2', 'color_3'],
            },
            ds_title: {
              id: 'ds_title',
              type: 'text',
              name: 'Heading',
              x: 120,
              y: 110,
              width: 400,
              height: 40,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              text: 'Vectorly Design System v2.0',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 700,
              textAlign: 'left',
              style: { fill: '#ffffff' },
              parentId: 'system_board',
            },
            color_1: {
              id: 'color_1',
              type: 'rectangle',
              name: 'Brand Blue',
              x: 120,
              y: 180,
              width: 100,
              height: 100,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: { fill: '#3b82f6', cornerRadius: 12 },
              parentId: 'system_board',
            },
            color_2: {
              id: 'color_2',
              type: 'rectangle',
              name: 'Accent Purple',
              x: 240,
              y: 180,
              width: 100,
              height: 100,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: { fill: '#a855f7', cornerRadius: 12 },
              parentId: 'system_board',
            },
            color_3: {
              id: 'color_3',
              type: 'rectangle',
              name: 'Emerald Success',
              x: 360,
              y: 180,
              width: 100,
              height: 100,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: { fill: '#10b981', cornerRadius: 12 },
              parentId: 'system_board',
            },
          },
        },
      ],
    };

    await prisma.document.create({
      data: {
        id: doc2Id,
        name: 'Design System Hero & Components',
        ownerId: user.id,
        version: 1,
        data: doc2Data as any,
        permissions: {
          create: {
            userId: user.id,
            role: Role.OWNER,
          },
        },
      },
    });

    // Document 3: Brand Styleguide & Icons
    const doc3Id = 'doc_brand_styleguide_003';
    const doc3Data = {
      schemaVersion: 1,
      id: doc3Id,
      name: 'Brand Styleguide & Icons',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activePageId: 'page_brand',
      pages: [
        {
          id: 'page_brand',
          name: 'Logos & Badges',
          viewport: { x: 0, y: 0, zoom: 1 },
          rootNodeIds: ['brand_frame'],
          nodes: {
            brand_frame: {
              id: 'brand_frame',
              type: 'frame',
              name: 'Brand Assets',
              x: 60,
              y: 60,
              width: 640,
              height: 400,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: {
                fill: '#111827',
                stroke: '#1f2937',
                strokeWidth: 1,
                cornerRadius: 16,
              },
              childIds: ['logo_circle', 'brand_text'],
            },
            logo_circle: {
              id: 'logo_circle',
              type: 'ellipse',
              name: 'Logo Mark',
              x: 100,
              y: 100,
              width: 80,
              height: 80,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              style: {
                fill: '#6366f1',
                stroke: '#818cf8',
                strokeWidth: 3,
              },
              parentId: 'brand_frame',
            },
            brand_text: {
              id: 'brand_text',
              type: 'text',
              name: 'Brand Name',
              x: 210,
              y: 120,
              width: 300,
              height: 40,
              rotation: 0,
              opacity: 1,
              visible: true,
              locked: false,
              text: 'VECTORLY STUDIOS',
              fontSize: 26,
              fontFamily: 'Inter',
              fontWeight: 800,
              textAlign: 'left',
              style: { fill: '#f3f4f6' },
              parentId: 'brand_frame',
            },
          },
        },
      ],
    };

    await prisma.document.create({
      data: {
        id: doc3Id,
        name: 'Brand Styleguide & Icons',
        ownerId: user.id,
        version: 1,
        data: doc3Data as any,
        permissions: {
          create: {
            userId: user.id,
            role: Role.OWNER,
          },
        },
      },
    });

    logger.info('Starter documents seeded successfully');
  }

  logger.info('Database seed complete!');
}

seed()
  .catch((err) => {
    logger.error({ err }, 'Failed to seed database');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

