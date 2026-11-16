export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Vectorly API — Vector Design Suite Backend',
    version: '1.0.0',
    description:
      'Production REST and WebSocket backend for Vectorly (Mini Figma). Provides robust authentication, PostgreSQL JSONB vector persistence, optimistic locking synchronization, real-time collaboration, asset upload, comments, and export generation.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/healthz': {
      get: {
        summary: 'Health check endpoint',
        responses: {
          200: { description: 'Server and database healthy' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        responses: { 201: { description: 'User created with starter documents' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user with email and password',
        responses: { 200: { description: 'Authenticated with access token and refresh cookie' } },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue new access token',
        responses: { 200: { description: 'New token pair' } },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        responses: { 200: { description: 'User profile' } },
      },
    },
    '/api/documents': {
      get: {
        summary: 'List user documents with pagination and category filters',
        responses: { 200: { description: 'Document list' } },
      },
      post: {
        summary: 'Create a new design document from template',
        responses: { 201: { description: 'Document created' } },
      },
    },
    '/api/documents/{id}': {
      get: {
        summary: 'Get document details and full vector tree',
        responses: { 200: { description: 'Document details' } },
      },
      patch: {
        summary: 'Update document metadata',
        responses: { 200: { description: 'Document updated' } },
      },
      delete: {
        summary: 'Soft-delete document',
        responses: { 200: { description: 'Document deleted' } },
      },
    },
    '/api/documents/{id}/sync': {
      patch: {
        summary: 'Synchronize document vector tree with optimistic locking',
        responses: {
          200: { description: 'Document updated successfully with next version' },
          409: { description: 'Version conflict (stale client version)' },
          422: { description: 'Validation error (invalid document schema)' },
        },
      },
    },
    '/api/documents/{id}/permissions': {
      get: {
        summary: 'List collaborators and roles for document',
        responses: { 200: { description: 'Collaborator list' } },
      },
      post: {
        summary: 'Invite collaborator with role (EDITOR / VIEWER)',
        responses: { 201: { description: 'Collaborator invited' } },
      },
    },
    '/api/documents/{id}/assets': {
      get: {
        summary: 'List uploaded document assets',
        responses: { 200: { description: 'Assets list' } },
      },
      post: {
        summary: 'Upload asset (PNG, JPEG, WEBP, GIF, SVG with XSS sanitization)',
        responses: { 201: { description: 'Asset uploaded' } },
      },
    },
    '/api/documents/{id}/comments': {
      get: {
        summary: 'List threaded canvas comments and pins',
        responses: { 200: { description: 'Comments list' } },
      },
      post: {
        summary: 'Create canvas comment pin',
        responses: { 201: { description: 'Comment created' } },
      },
    },
    '/api/documents/{id}/exports': {
      post: {
        summary: 'Generate export (SVG, PDF, JSON, PNG)',
        responses: { 202: { description: 'Export job initiated' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};
