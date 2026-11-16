import { prisma } from '../../database/prisma.js';
import { hashPassword, verifyPassword, hashToken } from '../../shared/utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} from '../../shared/utils/tokens.js';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors/app-error.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { Role } from '@prisma/client';

export class AuthService {
  async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        avatarUrl: input.avatarUrl || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Create starter documents for new user
    await this.createStarterDocuments(user.id);

    // Issue tokens
    const { accessToken, refreshToken } = await this.issueTokenPair(
      user.id,
      user.email,
      user.name,
      userAgent,
      ipAddress
    );

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.issueTokenPair(
      user.id,
      user.email,
      user.name,
      userAgent,
      ipAddress
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(providedRefreshToken: string, userAgent?: string, ipAddress?: string) {
    if (!providedRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(providedRefreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(providedRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Reuse detection: if token exists but was already revoked, revoke all tokens for this user
    if (storedToken && storedToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token reuse detected. Please log in again.');
    }

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new pair
    const { accessToken, refreshToken } = await this.issueTokenPair(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.name,
      userAgent,
      ipAddress
    );

    return {
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        name: storedToken.user.name,
        avatarUrl: storedToken.user.avatarUrl,
        createdAt: storedToken.user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(providedRefreshToken?: string) {
    if (!providedRefreshToken) return;

    try {
      const tokenHash = hashToken(providedRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Ignore errors on logout
    }
  }

  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  private async issueTokenPair(
    userId: string,
    email: string,
    name: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    const accessToken = generateAccessToken({ sub: userId, email, name });
    const refreshToken = generateRefreshToken({ sub: userId });

    const hashedToken = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashedToken,
        expiresAt,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
      },
    });

    return { accessToken, refreshToken };
  }

  private async createStarterDocuments(userId: string) {
    const initialPages = [
      {
        id: 'page_main',
        name: 'Page 1',
        viewport: { x: 0, y: 0, zoom: 1 },
        rootNodeIds: ['welcome_frame'],
        nodes: {
          welcome_frame: {
            id: 'welcome_frame',
            type: 'frame',
            name: 'Welcome Artboard',
            x: 80,
            y: 80,
            width: 480,
            height: 360,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            style: {
              fill: '#1e293b',
              stroke: '#3b82f6',
              strokeWidth: 2,
              cornerRadius: 12,
            },
            childIds: ['welcome_title', 'welcome_desc'],
          },
          welcome_title: {
            id: 'welcome_title',
            type: 'text',
            name: 'Title Text',
            x: 120,
            y: 130,
            width: 400,
            height: 48,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            text: 'Welcome to Vectorly',
            fontSize: 28,
            fontFamily: 'Inter',
            fontWeight: 700,
            textAlign: 'left',
            style: {
              fill: '#ffffff',
            },
            parentId: 'welcome_frame',
          },
          welcome_desc: {
            id: 'welcome_desc',
            type: 'text',
            name: 'Description Text',
            x: 120,
            y: 190,
            width: 400,
            height: 60,
            rotation: 0,
            opacity: 0.85,
            visible: true,
            locked: false,
            text: 'Your modern browser-based vector design suite with persistent PostgreSQL cloud storage.',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: 400,
            textAlign: 'left',
            style: {
              fill: '#94a3b8',
            },
            parentId: 'welcome_frame',
          },
        },
      },
    ];

    const documentData = {
      schemaVersion: 1,
      id: '', // Will update with created doc id
      name: 'Untitled Design',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activePageId: 'page_main',
      pages: initialPages,
    };

    const doc = await prisma.document.create({
      data: {
        name: 'Getting Started with Vectorly',
        ownerId: userId,
        version: 1,
        data: documentData as any,
      },
    });

    // Update internal id in json data
    documentData.id = doc.id;
    await prisma.document.update({
      where: { id: doc.id },
      data: { data: documentData as any },
    });

    // Add OWNER permission
    await prisma.documentPermission.create({
      data: {
        documentId: doc.id,
        userId,
        role: Role.OWNER,
      },
    });
  }
}

export const authService = new AuthService();
