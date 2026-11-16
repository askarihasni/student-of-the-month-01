import type { DocumentRepository } from './DocumentRepository';
import type { DocumentModel, ProjectMetadata, DocumentVersion } from '../../types/document';
import { apiClient } from '../api/apiClient';

export class HttpDocumentRepository implements DocumentRepository {
  async getAll(filter: string = 'recent', query?: string): Promise<ProjectMetadata[]> {
    const data = await apiClient.get<{ documents: any[] }>('/documents', {
      filter,
      q: query,
      limit: 50,
    });

    return data.documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      createdAt: new Date(doc.createdAt).getTime(),
      updatedAt: new Date(doc.updatedAt).getTime(),
      pageCount: doc.pagesCount || 1,
      nodeCount: doc.layerCount || 0,
      thumbnail: doc.thumbnailUrl || undefined,
    }));
  }

  async getById(id: string): Promise<DocumentModel | null> {
    try {
      const data = await apiClient.get<{ document: any }>(`/documents/${id}`);
      const rawData = data.document.data;

      // Ensure proper DocumentModel shape
      return {
        id: data.document.id,
        name: data.document.name,
        createdAt: typeof rawData.createdAt === 'string' ? new Date(rawData.createdAt).getTime() : rawData.createdAt,
        updatedAt: typeof rawData.updatedAt === 'string' ? new Date(rawData.updatedAt).getTime() : rawData.updatedAt,
        version: data.document.version,
        pages: rawData.pages || [],
        activePageId: rawData.activePageId || rawData.pages?.[0]?.id || 'page_1',
        thumbnail: data.document.thumbnailUrl || undefined,
      };
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  }

  async save(document: DocumentModel): Promise<void> {
    const payload = {
      expectedVersion: document.version,
      data: {
        ...document,
        updatedAt: Date.now(),
      },
      thumbnailUrl: document.thumbnail || null,
    };

    const res = await apiClient.patch<{ documentId: string; version: number; updatedAt: string }>(
      `/documents/${document.id}/sync`,
      payload
    );

    // Update document in memory to match server version
    document.version = res.version;
    document.updatedAt = new Date(res.updatedAt).getTime();
  }

  async create(name: string = 'Untitled Design', template: string = 'blank'): Promise<DocumentModel> {
    const data = await apiClient.post<{ document: any }>('/documents', {
      name,
      template,
    });

    const doc = data.document;
    const rawData = doc.data;

    return {
      id: doc.id,
      name: doc.name,
      createdAt: typeof rawData.createdAt === 'string' ? new Date(rawData.createdAt).getTime() : rawData.createdAt,
      updatedAt: typeof rawData.updatedAt === 'string' ? new Date(rawData.updatedAt).getTime() : rawData.updatedAt,
      version: doc.version,
      pages: rawData.pages || [],
      activePageId: rawData.activePageId || rawData.pages?.[0]?.id || 'page_1',
      thumbnail: doc.thumbnailUrl || undefined,
    };
  }

  async duplicate(id: string): Promise<DocumentModel> {
    const data = await apiClient.post<{ document: any }>(`/documents/${id}/duplicate`);
    const doc = data.document;
    const rawData = doc.data;

    return {
      id: doc.id,
      name: doc.name,
      createdAt: typeof rawData.createdAt === 'string' ? new Date(rawData.createdAt).getTime() : rawData.createdAt,
      updatedAt: typeof rawData.updatedAt === 'string' ? new Date(rawData.updatedAt).getTime() : rawData.updatedAt,
      version: doc.version,
      pages: rawData.pages || [],
      activePageId: rawData.activePageId || rawData.pages?.[0]?.id || 'page_1',
      thumbnail: doc.thumbnailUrl || undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }

  async rename(id: string, newName: string): Promise<void> {
    await apiClient.patch(`/documents/${id}`, { name: newName });
  }

  async getVersions(id: string): Promise<DocumentVersion[]> {
    const data = await apiClient.get<{ versions: any[] }>(`/documents/${id}/versions`);

    return data.versions.map((v) => ({
      id: v.id,
      documentId: id,
      timestamp: new Date(v.createdAt).getTime(),
      label: v.name || `Version ${v.versionNumber}`,
      document: v.snapshot as DocumentModel,
    }));
  }

  async saveVersion(id: string, label: string): Promise<DocumentVersion> {
    const data = await apiClient.post<{ version: any }>(`/documents/${id}/versions`, {
      name: label,
    });

    const v = data.version;
    return {
      id: v.id,
      documentId: id,
      timestamp: new Date(v.createdAt).getTime(),
      label: v.name || `Version ${v.versionNumber}`,
      document: v.snapshot as DocumentModel,
    };
  }

  async restoreVersion(id: string, versionId: string): Promise<DocumentModel> {
    const data = await apiClient.post<{ document: any }>(`/documents/${id}/versions/${versionId}/restore`);
    const doc = data.document;
    const rawData = doc.data;

    return {
      id: doc.id,
      name: doc.name,
      createdAt: typeof rawData.createdAt === 'string' ? new Date(rawData.createdAt).getTime() : rawData.createdAt,
      updatedAt: typeof rawData.updatedAt === 'string' ? new Date(rawData.updatedAt).getTime() : rawData.updatedAt,
      version: doc.version,
      pages: rawData.pages || [],
      activePageId: rawData.activePageId || rawData.pages?.[0]?.id || 'page_1',
      thumbnail: doc.thumbnailUrl || undefined,
    };
  }
}

export const httpDocumentRepository = new HttpDocumentRepository();
