# Mini Figma — A Browser-Based Vector Design Tool

> **A professional, high-performance browser-based vector graphics editor inspired by Figma, built from scratch using the HTML5 Canvas 2D API, React, TypeScript (strict mode), Zustand, and Tailwind CSS.**

---

## 1. Project Overview

Mini Figma is a frontend-first, production-architected collaborative vector design editor. It provides an infinite 2D canvas, a custom-built 3×3 affine transformation engine, hit-testing algorithms, bezier path editing, hierarchical layers, smart snapping guides, undo/redo history with interaction coalescing, and persistent document storage via an extensible repository pattern.

**Important Note**: This phase is **Frontend Only**. No third-party vector/canvas engines (such as Fabric.js, Konva, Excalidraw, or tldraw) were used. The rendering loop, coordinate transformations, hit-testing, resize handles, and undo/redo stacks were authored entirely from scratch.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Build & Bundler** | [Vite 8](https://vite.dev/) |
| **Graphics Engine** | HTML5 Canvas 2D API (High-DPI retina rendering loop) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with modern CSS variables |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) |
| **Schema Validation** | [Zod v4](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Unit & Integration Testing** | [Vitest](https://vitest.dev/) + `@testing-library/react` + `jsdom` |

---

## 3. Installation & Development Commands

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Run automated test suites (35 tests passing)
npm test

# 4. Build for production (TypeScript checking + minified bundle)
npm run build
```

---

## 4. Application Architecture

```
src/
├── app/
├── components/
│   └── ui/                     # Accessible UI design system (Button, Input, Modal, Tooltip, ColorPicker)
├── editor/
│   ├── canvas/
│   │   └── CanvasEngine.ts     # Central requestAnimationFrame render loop with dirty flags
│   ├── events/
│   │   └── useKeyboardShortcuts.ts # Global keyboard shortcuts with input element guarding
│   ├── history/
│   │   └── HistoryManager.ts   # Command pattern & interaction batch coalescing
│   ├── math/
│   │   ├── Vector2D.ts         # 2D vector mathematics (dot, cross, rotate, distance)
│   │   ├── Matrix3x3.ts        # 3×3 affine transformation matrix (Canvas 2D matching)
│   │   ├── Geometry.ts         # Bounding boxes, ray-casting point-in-polygon, segment distance
│   │   └── Bezier.ts           # Cubic Bézier evaluation and distance sampling
│   ├── model/
│   │   ├── factory.ts          # Safe shape instantiation & initial document seed
│   │   └── nodeUtils.ts        # Node AABBs, rotated corners, transform matrix recalculation
│   ├── rendering/
│   │   ├── ShapeRenderer.ts    # Renders rects, ellipses, lines, text, frames, paths, images
│   │   ├── OverlayRenderer.ts  # Selection bounds, 8 resize handles, rotation handle, marquee
│   │   └── GridRenderer.ts     # Adaptive infinite dot/line grid
│   ├── selection/
│   │   └── HitTester.ts        # Reverse z-order hit tests, rotated rect/ellipse, marquee overlap
│   ├── transforms/
│   │   ├── TransformEngine.ts  # 8 resize handles, center rotation, multi-object movement
│   │   └── SnapEngine.ts       # Smart edge and center alignment guides
│   └── viewport/
│       └── ViewportController.ts # Screen-to-world & world-to-screen coordinate mapping
├── pages/
│   ├── auth/                   # Mock auth screens (Login, Register, Forgot Password)
│   ├── dashboard/              # Project dashboard, recent files, search, duplicate, delete
│   └── editor/                 # TopToolbar, LeftSidebar (layers & pages), CanvasViewport, RightSidebar
├── schemas/
│   └── document.schema.ts      # Strict Zod schemas for Document, Page, and Nodes
├── services/
│   ├── auth/                   # AuthAdapter interface & MockAuthAdapter implementation
│   └── repositories/           # DocumentRepository interface & LocalDevelopmentDocumentRepository
├── store/
│   ├── authStore.ts            # User auth session state
│   ├── editorStore.ts          # Central editor state and document mutations
│   └── uiStore.ts              # Screen navigation, modals, and panel visibility
├── tests/
│   ├── document.test.ts        # Document model & schema tests
│   ├── integration.test.ts     # End-to-end integration workflows
│   ├── math.test.ts            # Vector2D, Matrix3x3, Geometry & Bezier tests
│   └── transforms.test.ts      # Hit testing, resize, rotation, snapping, and undo tests
└── types/
    └── document.ts             # TypeScript definitions for nodes, pages, and tools
```

---

## 5. Canvas Rendering Architecture

The graphics subsystem operates on an explicit 10-stage rendering pipeline executed on an HTML5 `<canvas>` 2D context inside a centralized `requestAnimationFrame` loop:

1. **High-DPI Retina Scaling**: Automatically adapts to `window.devicePixelRatio` for razor-sharp rendering on 4K/Retina displays without blurriness.
2. **Background Clear**: Clears canvas using the active page's designated background color.
3. **Viewport Matrix Application**:
   $$\text{ctx.translate}(V_x, V_y); \quad \text{ctx.scale}(V_z, V_z);$$
4. **Adaptive Infinite Grid**: Renders subtle grid dots/lines that adjust step intervals dynamically (10px, 20px, 50px, 100px) based on zoom level.
5. **Node Hierarchy Traversal**: Renders nodes in z-index order (bottom to top), applying each node's local affine transformation matrix, corner radii, drop shadow filters, fills, and strokes.
6. **Active Creation Preview**: Dashed live outline preview while dragging to draw rectangles, ellipses, lines, or frames.
7. **Pen Tool Path**: Renders in-progress cubic Bézier vectors with control anchor handles.
8. **Hover Highlighting**: Displays subtle cyan outline over hovered elements.
9. **Selection Bounding Box & Transformation Handles**: Renders 1.5px cyan bounding box, 8 square resize handles, and rotation stem handle with circular grab anchor.
10. **Smart Alignment Guides**: Renders magenta dashed guide lines when objects snap along edges or centers.

---

## 6. Coordinate Systems & Transformation Mathematics

Mini Figma maintains two distinct coordinate spaces:

- **Screen Space**: Pixel coordinates relative to the top-left of the `<canvas>` DOM element.
- **World Space**: Infinite 2D space where shapes, frames, and vectors live.

### Coordinate Conversion
Given viewport translation $(V_x, V_y)$ and zoom level $V_z$:

$$\text{World Point} = \left(\frac{P_{\text{screen}, x} - V_x}{V_z}, \frac{P_{\text{screen}, y} - V_y}{V_z}\right)$$

$$\text{Screen Point} = (P_{\text{world}, x} \cdot V_z + V_x, P_{\text{world}, y} \cdot V_z + V_y)$$

### Zoom Around Mouse Cursor
When zooming by factor $s$ at cursor position $P_{\text{pivot}}$:
$$W_{\text{pivot}} = \text{ScreenToWorld}(P_{\text{pivot}}, V)$$
$$V'_z = \text{clamp}(V_z \cdot s, 0.05, 32.0)$$
$$V'_x = P_{\text{pivot}, x} - W_{\text{pivot}, x} \cdot V'_z$$
$$V'_y = P_{\text{pivot}, y} - W_{\text{pivot}, y} \cdot V'_z$$

### 3×3 Affine Transformation Matrices
Every shape maintains a standard 2D affine transformation matrix:
$$\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = \begin{bmatrix} a & c & e \\ b & d & f \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$
Matched directly with HTML5 Canvas 2D `ctx.transform(a, b, c, d, e, f)`.

---

## 7. Undo / Redo & Interaction Coalescing

The undo/redo system uses an immutable history stack with interaction coalescing:
- **Continuous Operations (Move, Resize, Rotate, Slider Scrub)**:
  - When the user presses the pointer down, `HistoryManager.startBatch(currentDoc)` records the initial snapshot.
  - During continuous dragging, live nodes update without pushing intermediate states.
  - On pointer up, `HistoryManager.endBatch()` commits the single combined interaction.
- **Atomic Operations (Create Shape, Delete, Duplicate, Paste)**:
  - Immediately push the snapshot onto the undo stack and clear the redo stack.
- **Shortcuts**: `Ctrl+Z` (Undo), `Ctrl+Shift+Z` / `Ctrl+Y` (Redo).
- All keyboard shortcuts are guarded to never trigger when typing in inputs or textareas.

---

## 8. Feature Completion Matrix

| Category | Feature | Status |
|---|---|---|
| **Auth UI** | Mock login, registration, forgot password, demo one-click access | **Completed** |
| **Dashboard** | Project listing, search, sort by modified/name, grid/list view, duplicate, delete | **Completed** |
| **Document Navigation** | Create new document, open document, inline rename document | **Completed** |
| **Viewport** | Infinite pan (Space+drag, middle click), zoom centered on mouse (Ctrl+wheel), zoom presets | **Completed** |
| **Basic Shapes** | Rectangle (with corner radius), Ellipse, Line, Text (in-place editor), Frame | **Completed** |
| **Selection Engine** | Single-click, Shift-click additive, marquee drag selection, reverse z-order hit test | **Completed** |
| **Transformation Engine** | 8 resize handles (rotated shape aware), rotation around center, multi-node movement | **Completed** |
| **Pen Tool (Level 2)** | Vector path drawing, anchor points, cubic Bézier rendering | **Completed** |
| **Smart Alignment (Level 2)** | Edge & center snapping against unselected objects, magenta alignment guides | **Completed** |
| **Layers Panel (Level 2)** | Reverse z-order tree, search layers, reorder up/down, visibility toggle, lock toggle | **Completed** |
| **Properties Inspector** | Position, dimensions, rotation, fill picker, stroke, opacity slider, drop shadow | **Completed** |
| **Multi-Page Support** | Add pages, switch active page, delete page | **Completed** |
| **Media Import** | Drag-and-drop local images onto canvas, file picker image import (PNG, JPG, SVG) | **Completed** |
| **Clipboard** | Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V), Duplicate (Ctrl+D) | **Completed** |
| **Persistence** | Local development repository (`localStorage`), debounced auto-save, save status | **Completed** |
| **Export / Import** | High-DPI 2x PNG raster export, JSON document export, JSON schema validated import | **Completed** |
| **Version History** | Snapshot creation with custom labels, snapshot restoration | **Completed** |

---

## 9. Future Backend Integration Contracts

The frontend has been decoupled from data persistence via the `DocumentRepository` and `AuthAdapter` interfaces (`src/services/`). When connecting a real Node.js / PostgreSQL / Supabase / Go backend later, implement the following endpoints without altering the core canvas components:

### Authentication API Endpoints
- `POST /api/auth/register` — `{ name, email, password } -> { user, token }`
- `POST /api/auth/login` — `{ email, password } -> { user, token }`
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/me` — Return current authenticated user profile
- `POST /api/auth/forgot-password` — `{ email } -> { message }`

### Document API Endpoints
- `GET /api/documents` — Return array of `ProjectMetadata` (id, name, updatedAt, pageCount, nodeCount)
- `POST /api/documents` — `{ name } -> DocumentModel`
- `GET /api/documents/:id` — Return full `DocumentModel` JSON validated against `DocumentModelSchema`
- `PUT /api/documents/:id` — `{ document: DocumentModel } -> 200 OK`
- `POST /api/documents/:id/duplicate` — Duplicate document and return copy
- `DELETE /api/documents/:id` — Delete document
- `GET /api/documents/:id/versions` — Return array of `DocumentVersion` snapshots
- `POST /api/documents/:id/versions` — `{ label } -> DocumentVersion`
- `POST /api/documents/:id/versions/:versionId/restore` — Restore snapshot to live document

### Real-time Collaboration (Future WebSocket Plan)
- WebSocket connection to `/ws/documents/:id`
- Broadcast cursor coordinates: `{ type: 'cursor', userId, x, y }`
- Broadcast shape change operational transforms (OT) or CRDT state: `{ type: 'node_update', nodeId, changes }`
