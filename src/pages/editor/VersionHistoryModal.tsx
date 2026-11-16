import React, { useEffect, useState } from 'react'
import { Clock, History, Plus, RotateCcw } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import type { DocumentVersion } from '../../types/document'
import { documentRepository } from '../../services/repositories/LocalDevelopmentDocumentRepository'
import { useEditorStore } from '../../store/editorStore'

export const VersionHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { document, setDocument } = useEditorStore()
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [snapshotLabel, setSnapshotLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadVersions = async () => {
    if (!document) return
    const list = await documentRepository.getVersions(document.id)
    setVersions(list)
  }

  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
  }, [isOpen, document])

  const handleCreateSnapshot = async () => {
    if (!document) return
    setIsLoading(true)
    try {
      await documentRepository.saveVersion(document.id, snapshotLabel.trim() || 'Manual Snapshot')
      setSnapshotLabel('')
      await loadVersions()
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (versionId: string) => {
    if (!document) return
    const confirmed = window.confirm('Restore this snapshot? Unsaved changes will be replaced.')
    if (!confirmed) return

    setIsLoading(true)
    try {
      const restored = await documentRepository.restoreVersion(document.id, versionId)
      setDocument(restored)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version History & Snapshots" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Create new snapshot */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Snapshot name (e.g. Before redesigning navbar)"
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleCreateSnapshot}
            isLoading={isLoading}
          >
            Create Snapshot
          </Button>
        </div>

        {/* Snapshot list */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {versions.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
              <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p>No snapshots saved yet.</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Create snapshots to bookmark important design milestones.
              </p>
            </div>
          ) : (
            versions.map((v) => {
              const dateStr = new Date(v.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">{v.label}</h4>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {dateStr} &bull; {v.document.pages.reduce((acc, p) => acc + p.nodes.length, 0)} layers
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="xs"
                    icon={<RotateCcw className="w-3 h-3" />}
                    onClick={() => handleRestore(v.id)}
                  >
                    Restore
                  </Button>
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

