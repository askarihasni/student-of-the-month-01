import type { DocumentModel, ProjectMetadata, DocumentVersion } from '../../types/document'
import type { DocumentRepository } from './DocumentRepository'
import { httpDocumentRepository } from './HttpDocumentRepository'
import {
  createDefaultDocument,
  generateId,
  createFrame,
  createRectangle,
  createText,
  createEllipse,
  createLine,
} from '../../editor/model/factory'
import { DocumentModelSchema } from '../../schemas/document.schema'

const STORAGE_KEY_PREFIX = 'minifigma_doc_'
const METADATA_KEY = 'minifigma_metadata_list'
const VERSIONS_KEY_PREFIX = 'minifigma_versions_'

export class LocalDevelopmentDocumentRepository implements DocumentRepository {
  constructor() {
    this.seedInitialDocumentsIfEmpty()
  }

  private seedInitialDocumentsIfEmpty(): void {
    try {
      const existing = localStorage.getItem(METADATA_KEY)
      if (existing) {
        const parsed = JSON.parse(existing)
        if (Array.isArray(parsed) && parsed.length > 0) return
      }

      // Seed 3 realistic projects
      const doc1 = this.createMobileAppStarter()
      const doc2 = this.createLandingPageStarter()
      const doc3 = createDefaultDocument('Brand Styleguide & Icons')

      this.saveSync(doc1)
      this.saveSync(doc2)
      this.saveSync(doc3)
    } catch (e) {
      console.warn('LocalStorage unavailable for seed, using in-memory mode', e)
    }
  }

  private createMobileAppStarter(): DocumentModel {
    const pageId = generateId('page')
    const now = Date.now() - 3600 * 1000 * 4

    return {
      id: 'doc_mobile_app_design_system',
      name: 'Crypto Wallet Mobile App',
      createdAt: now,
      updatedAt: now,
      version: 1,
      activePageId: pageId,
      pages: [
        {
          id: pageId,
          name: 'Home & Feed',
          backgroundColor: '#13141B',
          nodes: [
            createFrame({
              x: 100,
              y: 80,
              width: 390,
              height: 780,
              name: 'iPhone 15 Pro - Dashboard',
              fill: '#0F172A',
              cornerRadius: 36,
            }),
            createRectangle({
              x: 124,
              y: 120,
              width: 342,
              height: 190,
              name: 'Balance Card',
              fill: '#2563EB',
              cornerRadius: 20,
              shadow: { color: 'rgba(37, 99, 235, 0.4)', blur: 24, offsetX: 0, offsetY: 10 },
            }),
            createText({
              x: 150,
              y: 150,
              width: 200,
              height: 24,
              name: 'Card Label',
              text: 'Total Portfolio Balance',
              fontSize: 14,
              fill: '#93C5FD',
            }),
            createText({
              x: 150,
              y: 185,
              width: 250,
              height: 48,
              name: 'Balance Value',
              text: '$84,290.45',
              fontSize: 32,
              fontWeight: 'bold',
              fill: '#FFFFFF',
            }),
            createRectangle({
              x: 150,
              y: 245,
              width: 110,
              height: 36,
              name: 'Send Button',
              fill: '#3B82F6',
              cornerRadius: 8,
            }),
            createText({
              x: 175,
              y: 254,
              width: 60,
              height: 20,
              name: 'Send Text',
              text: '↑ Send',
              fontSize: 13,
              fontWeight: '600',
              fill: '#FFFFFF',
            }),
            createRectangle({
              x: 275,
              y: 245,
              width: 110,
              height: 36,
              name: 'Receive Button',
              fill: '#1E40AF',
              cornerRadius: 8,
            }),
            createText({
              x: 295,
              y: 254,
              width: 70,
              height: 20,
              name: 'Receive Text',
              text: '↓ Receive',
              fontSize: 13,
              fontWeight: '600',
              fill: '#FFFFFF',
            }),
            createText({
              x: 124,
              y: 340,
              width: 200,
              height: 24,
              name: 'Section Title',
              text: 'Recent Transactions',
              fontSize: 18,
              fontWeight: 'bold',
              fill: '#F8FAFC',
            }),
            createRectangle({
              x: 124,
              y: 380,
              width: 342,
              height: 70,
              name: 'Tx Row 1',
              fill: '#1E293B',
              cornerRadius: 12,
            }),
            createEllipse({
              x: 140,
              y: 395,
              width: 40,
              height: 40,
              name: 'Bitcoin Icon',
              fill: '#F59E0B',
            }),
            createText({
              x: 195,
              y: 405,
              width: 150,
              height: 22,
              name: 'BTC Label',
              text: 'Bitcoin Purchase',
              fontSize: 15,
              fontWeight: '600',
              fill: '#F8FAFC',
            }),
          ],
        },
      ],
    }
  }

  private createLandingPageStarter(): DocumentModel {
    const pageId = generateId('page')
    const now = Date.now() - 3600 * 1000 * 24

    return {
      id: 'doc_saas_landing_page',
      name: 'Design System Hero & Components',
      createdAt: now,
      updatedAt: now,
      version: 1,
      activePageId: pageId,
      pages: [
        {
          id: pageId,
          name: 'Hero Section',
          backgroundColor: '#0A0A0C',
          nodes: [
            createFrame({
              x: 80,
              y: 60,
              width: 960,
              height: 540,
              name: 'Desktop 1440 Frame',
              fill: '#111116',
              cornerRadius: 12,
              stroke: '#27272A',
            }),
            createRectangle({
              x: 120,
              y: 90,
              width: 40,
              height: 40,
              name: 'Logo Mark',
              fill: '#EC4899',
              cornerRadius: 8,
            }),
            createText({
              x: 175,
              y: 100,
              width: 200,
              height: 24,
              name: 'Brand Title',
              text: 'Vectora Studio',
              fontSize: 18,
              fontWeight: 'bold',
              fill: '#FFFFFF',
            }),
            createText({
              x: 120,
              y: 200,
              width: 700,
              height: 80,
              name: 'Hero Heading',
              text: 'Design faster together in the browser',
              fontSize: 42,
              fontWeight: 'bold',
              fill: '#F43F5E',
            }),
            createText({
              x: 120,
              y: 290,
              width: 650,
              height: 50,
              name: 'Hero Subhead',
              text: 'Pixel-perfect vector canvas built with custom 2D transformations, high-DPI scaling, and collaborative architecture.',
              fontSize: 18,
              fill: '#A1A1AA',
            }),
            createRectangle({
              x: 120,
              y: 380,
              width: 170,
              height: 48,
              name: 'CTA Button',
              fill: '#6366F1',
              cornerRadius: 10,
              shadow: { color: 'rgba(99, 102, 241, 0.4)', blur: 16, offsetX: 0, offsetY: 6 },
            }),
            createText({
              x: 155,
              y: 394,
              width: 100,
              height: 22,
              name: 'CTA Text',
              text: 'Get Started →',
              fontSize: 15,
              fontWeight: 'bold',
              fill: '#FFFFFF',
            }),
          ],
        },
      ],
    }
  }

  private saveSync(doc: DocumentModel): void {
    const serialized = JSON.stringify(doc)
    localStorage.setItem(STORAGE_KEY_PREFIX + doc.id, serialized)
    this.updateMetadataList(doc)
  }

  private updateMetadataList(doc: DocumentModel): void {
    const metaList = this.getMetadataList()
    const index = metaList.findIndex(m => m.id === doc.id)

    const meta: ProjectMetadata = {
      id: doc.id,
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      pageCount: doc.pages.length,
      nodeCount: doc.pages.reduce((acc, p) => acc + p.nodes.length, 0),
      thumbnail: doc.thumbnail,
    }

    if (index >= 0) {
      metaList[index] = meta
    } else {
      metaList.unshift(meta)
    }

    localStorage.setItem(METADATA_KEY, JSON.stringify(metaList))
  }

  private getMetadataList(): ProjectMetadata[] {
    try {
      const raw = localStorage.getItem(METADATA_KEY)
      if (!raw) return []
      return JSON.parse(raw) as ProjectMetadata[]
    } catch {
      return []
    }
  }

  async getAll(): Promise<ProjectMetadata[]> {
    try {
      const remote = await httpDocumentRepository.getAll()
      if (remote && remote.length > 0) return remote
    } catch {
      // Backend offline or running in mock mode
    }
    return this.getMetadataList()
  }

  async getById(id: string): Promise<DocumentModel | null> {
    try {
      const remote = await httpDocumentRepository.getById(id)
      if (remote) return remote
    } catch {
      // Backend offline
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PREFIX + id)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      const validated = DocumentModelSchema.safeParse(parsed)
      if (validated.success) {
        return validated.data as DocumentModel
      } else {
        console.error('Validation error restoring document:', validated.error)
        return parsed as DocumentModel
      }
    } catch (e) {
      console.error('Failed to get document by id', e)
      return null
    }
  }

  async save(document: DocumentModel): Promise<void> {
    try {
      await httpDocumentRepository.save(document)
      this.saveSync(document)
      return
    } catch (err: any) {
      if (err?.status === 409) {
        throw err
      }
      const updatedDoc: DocumentModel = {
        ...document,
        updatedAt: Date.now(),
        version: document.version + 1,
      }
      this.saveSync(updatedDoc)
    }
  }

  async create(name = 'Untitled Design'): Promise<DocumentModel> {
    try {
      const remote = await httpDocumentRepository.create(name)
      if (remote) {
        this.saveSync(remote)
        return remote
      }
    } catch {
      // Backend offline
    }
    const doc = createDefaultDocument(name)
    this.saveSync(doc)
    return doc
  }

  async duplicate(id: string): Promise<DocumentModel> {
    try {
      const remote = await httpDocumentRepository.duplicate(id)
      if (remote) {
        this.saveSync(remote)
        return remote
      }
    } catch {
      // Backend offline
    }
    const orig = await this.getById(id)
    if (!orig) throw new Error(`Document ${id} not found`)

    const newDoc: DocumentModel = {
      ...orig,
      id: generateId('doc'),
      name: `${orig.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    }

    this.saveSync(newDoc)
    return newDoc
  }

  async delete(id: string): Promise<void> {
    try {
      await httpDocumentRepository.delete(id)
    } catch {
      // Backend offline
    }
    localStorage.removeItem(STORAGE_KEY_PREFIX + id)
    localStorage.removeItem(VERSIONS_KEY_PREFIX + id)
    const metaList = this.getMetadataList().filter(m => m.id !== id)
    localStorage.setItem(METADATA_KEY, JSON.stringify(metaList))
  }

  async rename(id: string, newName: string): Promise<void> {
    try {
      await httpDocumentRepository.rename(id, newName)
    } catch {
      // Backend offline
    }
    const doc = await this.getById(id)
    if (!doc) return
    doc.name = newName
    this.saveSync(doc)
  }

  async getVersions(id: string): Promise<DocumentVersion[]> {
    try {
      const remote = await httpDocumentRepository.getVersions(id)
      if (remote && remote.length > 0) return remote
    } catch {
      // Backend offline
    }
    try {
      const raw = localStorage.getItem(VERSIONS_KEY_PREFIX + id)
      if (!raw) return []
      return JSON.parse(raw)
    } catch {
      return []
    }
  }

  async saveVersion(id: string, label: string): Promise<DocumentVersion> {
    try {
      const remote = await httpDocumentRepository.saveVersion(id, label)
      if (remote) return remote
    } catch {
      // Backend offline
    }
    const doc = await this.getById(id)
    if (!doc) throw new Error('Document not found')

    const versions = await this.getVersions(id)
    const version: DocumentVersion = {
      id: generateId('ver'),
      documentId: id,
      timestamp: Date.now(),
      label: label || `Snapshot ${versions.length + 1}`,
      document: JSON.parse(JSON.stringify(doc)),
    }

    versions.unshift(version)
    const trimmed = versions.slice(0, 20)
    localStorage.setItem(VERSIONS_KEY_PREFIX + id, JSON.stringify(trimmed))
    return version
  }

  async restoreVersion(id: string, versionId: string): Promise<DocumentModel> {
    try {
      const remote = await httpDocumentRepository.restoreVersion(id, versionId)
      if (remote) return remote
    } catch {
      // Backend offline
    }
    const versions = await this.getVersions(id)
    const match = versions.find(v => v.id === versionId)
    if (!match) throw new Error('Version snapshot not found')

    const restored: DocumentModel = {
      ...match.document,
      updatedAt: Date.now(),
      version: match.document.version + 1,
    }

    this.saveSync(restored)
    return restored
  }
}

export const documentRepository = new LocalDevelopmentDocumentRepository()

