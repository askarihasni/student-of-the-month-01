# VECTORLY — Full-Stack Creative Vector Workspace

> **A professional, high-performance browser-based vector graphics editor and collaborative design platform inspired by Figma. Built from scratch with an HTML5 Canvas 2D engine, React 19, TypeScript strict mode, Tailwind CSS v4, and backed by a production Node.js, PostgreSQL, Prisma ORM, and Socket.IO real-time backend.**

---

## 1. System Architecture

VECTORLY is architected as a decoupled, full-stack vector design suite:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          VECTORLY CLIENT (React 19)                             │
│   • HTML5 Canvas 2D Rendering Engine (zero 3rd-party vector engine libraries)   │
│   • 3×3 Affine Transformation Matrices & Viewport Pan/Zoom Controller          │
│   • Hit-Testing & 8-Handle Bounding Box Resizing with Rotation Handles          │
│   • Real-Time Collaborative Cursors & Peer Presence Overlay                     │
│   • Zustand State Management & Zod Schema Parity                                │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │ HTTP REST API (JSON / Multipart)│ WebSocket (Socket.IO)
                        ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      VECTORLY BACKEND SERVER (Node.js)                          │
│   • Express + TypeScript + Strict Zod Validation Middleware                     │
│   • Argon2id Password Hashing & JWT Access + Rotating Refresh Tokens            │
│   • Optimistic Concurrency Control (PATCH /api/documents/:id/sync, 409 Conflict)│
│   • Document Versioning, Milestone Snapshots, & Rollback Restoration           │
│   • Role-Based Access Control (OWNER, EDITOR, VIEWER)                           │
│   • SVG Sanitization Pipeline (stripping stored XSS executable scripts)         │
│   • Export Engine (Vector SVG, PDFKit printable PDF, JSON, PNG)                 │
│   • Socket.IO Collaboration Gateway with Document Room Isolation                │
└───────────────────────┬─────────────────────────────────────────────────────────┘
                        │ Prisma ORM 5
                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL 16 DATABASE                                 │
│   • users: Accounts, credentials, avatars, and plans                            │
│   • documents: Complete vector document trees in PostgreSQL JSONB              │
│   • document_permissions: Multi-user workspace access matrix                   │
│   • refresh_tokens: SHA-256 hashed rotating authentication sessions            │
│   • document_versions: Immutable historical vector snapshots                    │
│   • assets: Image and SVG metadata with filesystem persistence                  │
│   • document_comments: Canvas pin coordinates (x, y, pageId) & threaded replies │
│   • export_jobs: Asynchronous export queue status and artifacts                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript (Strict Mode), Vite 8 |
| **Graphics Engine** | Native HTML5 Canvas 2D API (High-DPI Retina loop, zero 3rd-party engine) |
| **Client State** | Zustand v5, Zod v4 |
| **Styling** | Tailwind CSS v4 |
| **Backend Runtime** | Node.js (ESM), Express 4, TypeScript (Strict Mode) |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 5 (JSONB document storage) |
| **Authentication & Security** | Argon2id, JWT (Access + Rotating Refresh), Helmet, Rate Limiting, SVG Sanitizer |
| **Real-time Collaboration** | Socket.IO (WebSocket / Polling fallback) |
| **Testing** | Vitest, Supertest, Testing Library React, JSDOM |
| **Containerization** | Docker, Docker Compose (Multi-stage build) |

---

## 3. Quick Start & Development

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL 16 (or Docker Compose)

### 1. Database Setup & Seeding
```bash
# In server directory
cd server
npm install
npx prisma db push
npm run prisma:seed
```
*Seeds default user `designer@minifigma.io` / `password123` and 3 starter design documents: Crypto Wallet Mobile App, Design System Hero & Components, and Brand Styleguide & Icons.*

### 2. Start Full-Stack Application
```bash
# Terminal 1: Start Backend API & Collaboration Server (Port 5000)
npm run server:dev

# Terminal 2: Start Frontend Application (Port 5173 with Vite proxy)
npm run dev
```

Visit `http://localhost:5173` to open the application.
Interactive Swagger API documentation is available at `http://localhost:5000/api/docs`.

---

## 4. Automated Testing

The project maintains **65 automated tests** across client and server:

```bash
# Run both frontend and backend test suites
npm run test:all

# Or run separately:
npm test                   # Frontend tests (35 passing)
npm run server:test        # Backend integration tests (30 passing)
```

---

## 5. Docker Deployment

Launch PostgreSQL and the backend with a single command:
```bash
docker compose up -d --build
```
- PostgreSQL: `localhost:5432`
- Vectorly API: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`
