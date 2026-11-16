import type { DocumentModel } from '../../types/document'

export interface HistoryEntry {
  document: DocumentModel
  description: string
  timestamp: number
}

export class HistoryManager {
  private undoStack: HistoryEntry[] = []
  private redoStack: HistoryEntry[] = []
  private maxDepth = 50
  private isBatching = false
  private batchInitialEntry: HistoryEntry | null = null

  /**
   * Pushes a new snapshot onto the undo stack and clears the redo stack
   */
  push(document: DocumentModel, description = 'Edit'): void {
    if (this.isBatching) {
      return // Wait until batch completes
    }

    const cloned = JSON.parse(JSON.stringify(document)) as DocumentModel
    this.undoStack.push({
      document: cloned,
      description,
      timestamp: Date.now(),
    })

    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift()
    }

    this.redoStack = []
  }

  /**
   * Starts a continuous interaction batch (e.g. dragging, resizing, slider change)
   */
  startBatch(initialDoc: DocumentModel, description = 'Drag Operation'): void {
    if (this.isBatching) return
    this.isBatching = true
    this.batchInitialEntry = {
      document: JSON.parse(JSON.stringify(initialDoc)),
      description,
      timestamp: Date.now(),
    }
  }

  /**
   * Ends a continuous interaction batch and records the initial state as the undo point
   */
  endBatch(): void {
    if (!this.isBatching) return
    this.isBatching = false

    if (this.batchInitialEntry) {
      this.undoStack.push(this.batchInitialEntry)
      if (this.undoStack.length > this.maxDepth) {
        this.undoStack.shift()
      }
      this.redoStack = []
      this.batchInitialEntry = null
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /**
   * Undoes the last operation, returning the restored DocumentModel
   */
  undo(currentDoc: DocumentModel): DocumentModel | null {
    if (!this.canUndo()) return null

    const previous = this.undoStack.pop()!
    const currentCloned = JSON.parse(JSON.stringify(currentDoc)) as DocumentModel
    this.redoStack.push({
      document: currentCloned,
      description: previous.description,
      timestamp: Date.now(),
    })

    return previous.document
  }

  /**
   * Redoes the previously undone operation
   */
  redo(currentDoc: DocumentModel): DocumentModel | null {
    if (!this.canRedo()) return null

    const next = this.redoStack.pop()!
    const currentCloned = JSON.parse(JSON.stringify(currentDoc)) as DocumentModel
    this.undoStack.push({
      document: currentCloned,
      description: next.description,
      timestamp: Date.now(),
    })

    return next.document
  }

  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.isBatching = false
    this.batchInitialEntry = null
  }
}
