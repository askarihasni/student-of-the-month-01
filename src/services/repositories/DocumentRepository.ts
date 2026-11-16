import type { DocumentModel, ProjectMetadata, DocumentVersion } from '../../types/document'

export interface DocumentRepository {
  getAll(): Promise<ProjectMetadata[]>
  getById(id: string): Promise<DocumentModel | null>
  save(document: DocumentModel): Promise<void>
  create(name?: string): Promise<DocumentModel>
  duplicate(id: string): Promise<DocumentModel>
  delete(id: string): Promise<void>
  rename(id: string, newName: string): Promise<void>
  getVersions(id: string): Promise<DocumentVersion[]>
  saveVersion(id: string, label: string): Promise<DocumentVersion>
  restoreVersion(id: string, versionId: string): Promise<DocumentModel>
}
