# VECTORLY — Production Backend API & Real-time Collaboration Server

Production Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, and Socket.IO backend for the Vectorly browser-based vector design suite.

---

## 1. Architecture Overview

VECTORLY's backend provides persistent cloud storage, atomic document synchronization, real-time multiplayer collaboration, media management, and export generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                 VECTORLY Browser Client                         │
│   React 19 • Custom Canvas 2D Engine • Zustand • Socket.IO      │
└──────────────┬───────────────────────────────────┬──────────────┘
               │ HTTP REST API (JSON)              │ WebSocket
               ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Server                    │
│                                                                 │
│  [Middleware Pipeline]                                          │
│   • Helmet (Security Headers)                                   │
│   • CORS (Credentials & Allowed Origins)                       │
│   • Rate Limiting (Brute-force protection & sync throttling)    │
│   • Request Correlation ID (X-Request-ID)                       │
│   • Centralized Error & Zod Schema Validation                   │
│                                                                 │
│  [Modules]                                                      │
│   • Auth: Argon2id hashing, JWT access + rotating refresh tokens│
│   • Documents: CRUD, JSONB tree persistence, templates          │
│   • Sync: Optimistic concurrency control (HTTP 409 Conflict)    │
│   • Permissions: Role-Based Access Control (OWNER, EDITOR, ...) │
│   • Versions: Milestone snapshots & restoration                 │
│   • Assets: Multer disk storage, SVG XSS sanitization           │
│   • Comments: Spatial canvas coordinates (x, y), thread replies │
│   • Exports: Vector SVG, PDFKit printable PDF, JSON, PNG        │
│   • Collaboration Gateway: Socket.IO rooms, live cursors        │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 Database                       │
│                                                                 │
│   • users: Accounts, Argon2id hashes, profile avatars           │
│   • documents: Metadata, title, current_version, JSONB tree     │
│   • document_permissions: Composite key (docId, userId) + Role │
│   • refresh_tokens: SHA-256 hashed rotating tokens              │
│   • document_versions: Historical JSONB vector snapshots        │
│   • assets: Uploaded file metadata, storage paths, mime types   │
│   • document_comments: Page coordinates (x,y), parent-child     │
│   • export_jobs: Asynchronous export queue & artifacts          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema & Models (Prisma ORM)

| Model | Table | Description |
|---|---|---|
| `User` | `users` | Accounts with email, name, Argon2id password hash, and avatar URL |
| `Document` | `documents` | Design documents storing full vector canvas trees in PostgreSQL JSONB |
| `DocumentPermission` | `document_permissions` | RBAC access control with roles (`OWNER`, `EDITOR`, `VIEWER`) |
| `RefreshToken` | `refresh_tokens` | SHA-256 hashed refresh tokens with automatic reuse detection and revocation |
| `DocumentVersion` | `document_versions` | Immutable historical snapshots for checkpoint restoration |
| `Asset` | `assets` | Uploaded images with SVG sanitization preventing stored XSS |
| `DocumentComment` | `document_comments` | Spatial canvas pin coordinates (`x`, `y`, `pageId`), threaded replies, and resolution status |
| `ExportJob` | `export_jobs` | Asynchronous export tracking (`svg`, `pdf`, `json`, `png`) |

---

## 3. Optimistic Concurrency Control (`PATCH /api/documents/:id/sync`)

Vector design editors require reliable autosave without race conditions. Vectorly enforces atomic version increments:

1. Client sends payload with `expectedVersion` and complete `DocumentModel`.
2. Server verifies `expectedVersion === document.version` inside an interactive database transaction.
3. **If matching**: Server advances version to `expectedVersion + 1`, stores updated JSONB vector data, records autosave snapshots every 10 versions, and returns `{ version: nextVersion, updatedAt }`.
4. **If stale**: Server aborts update and returns **HTTP 409 Conflict** with:
   ```json
   {
     "success": false,
     "error": {
       "code": "CONFLICT",
       "message": "Version conflict: Expected version 1, but current database version is 2",
       "details": {
         "currentVersion": 2,
         "serverUpdatedAt": "2026-11-16T14:30:00.000Z"
       }
     }
   }
   ```

---

## 4. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register`: Register user with Argon2id hashing, creates 3 starter documents, sets HTTP-only refresh cookie.
- `POST /login`: Authenticate with email/password, issues JWT access token + rotating refresh token.
- `POST /refresh`: Rotates refresh token, issues new access token. Detects token reuse and revokes compromised sessions.
- `POST /logout`: Revokes current refresh token.
- `POST /logout-all`: Terminates all active sessions for the user.
- `GET /me`: Returns profile of authenticated user.

### Documents (`/api/documents`)
- `POST /`: Create design document (`blank`, `mobile-app`, `design-system`).
- `GET /`: List accessible documents with pagination (`page`, `limit`), sorting, and category filters (`recent`, `drafts`, `shared`, `design-system`, `mobile-app`).
- `GET /:id`: Retrieve full document JSONB tree and effective permissions.
- `PATCH /:id`: Rename or toggle public sharing.
- `DELETE /:id`: Soft delete document (`isDeleted: true`).
- `POST /:id/duplicate`: Duplicate document into a new independent copy.
- `PATCH /:id/sync`: Atomic optimistic locking vector tree synchronization.

### Permissions & Sharing (`/api/documents/:id/permissions`)
- `GET /`: List all collaborators and roles.
- `POST /`: Invite collaborator by email with role (`EDITOR` or `VIEWER`).
- `PATCH /:permissionId`: Update role (OWNER only).
- `DELETE /:permissionId`: Revoke collaborator access.

### Assets & SVG Sanitization (`/api/documents/:id/assets`)
- `POST /`: Upload raster or vector image (up to 10MB). Strips executable `<script>`, `<iframe>`, `onclick`, and `javascript:` URIs from SVGs.
- `GET /`: List document assets.
- `DELETE /:assetId`: Remove asset from database and filesystem.

### Canvas Comments (`/api/documents/:id/comments`)
- `POST /`: Create canvas pin comment at `(x, y)` on a specific `pageId`.
- `GET /`: List threaded comments and nested replies.
- `POST /:commentId/replies`: Post threaded reply.
- `PATCH /:commentId`: Toggle `resolved` status or edit comment text.
- `DELETE /:commentId`: Remove comment.

### Exports (`/api/documents/:id/exports` & `/api/exports`)
- `POST /api/documents/:id/exports`: Queue export (`format`: 'svg' | 'pdf' | 'json' | 'png').
- `GET /api/exports/:jobId`: Query export progress and artifact URL.
- `GET /api/exports/:jobId/download`: Stream file directly.

### Health & Documentation
- `GET /healthz`: PostgreSQL connectivity health check.
- `GET /api/docs`: Interactive Swagger UI API documentation.
- `GET /api/docs/json`: Raw OpenAPI 3.0 specification.

---

## 5. Real-Time Collaboration (Socket.IO Gateway)

- **Room Namespace**: `doc:{documentId}`
- **Handshake**: Bearer JWT token verification with fallback guest assignment.
- **Events**:
  - `join-document`: Join document room and broadcast `peer-joined`.
  - `leave-document`: Broadcast `peer-left`.
  - `cursor-move`: Real-time streaming of world coordinates `(x, y, pageId)`.
  - `selection-change`: Broadcasts active selected node IDs to collaborators.
  - `document-change`: Notifies room peers of version advances.
  - `comment-event`: Real-time canvas pin additions and thread updates.

---

## 6. Testing & Quality Assurance

30 automated integration tests verify all core systems:
```bash
cd server
npm test
```

Test Suites:
- `auth.test.ts`: 8 tests (Registration, Argon2id, JWT issuance, refresh rotation, reuse detection)
- `documents.test.ts`: 7 tests (Templates, pagination, metadata, duplication, soft deletion)
- `sync.test.ts`: 4 tests (Optimistic concurrency control, version bumping, 409 conflict, Zod schema validation)
- `permissions.test.ts`: 6 tests (RBAC enforcement, VIEWER edit restriction, EDITOR permissions, revocation)
- `assets.test.ts`: 3 tests (Multipart upload, SVG XSS sanitization, deletion)
- `health.test.ts`: 2 tests (PostgreSQL health probe, OpenAPI specification)

---

## 7. Running with Docker Compose

To run PostgreSQL and the Vectorly backend in isolated containers:
```bash
docker compose up -d --build
```
- PostgreSQL available on `localhost:5432`
- Vectorly API available on `http://localhost:5000`
- Swagger documentation at `http://localhost:5000/api/docs`
