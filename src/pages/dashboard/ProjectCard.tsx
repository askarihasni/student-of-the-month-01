import React, { useState } from 'react'
import { Copy, Edit2, FileText, MoreVertical, Trash2 } from 'lucide-react'
import type { ProjectMetadata } from '../../types/document'

export interface ProjectCardProps {
  project: ProjectMetadata
  viewMode: 'grid' | 'list'
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string, name: string) => void
  onRename: (id: string, newName: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode,
  onOpen,
  onDuplicate,
  onDelete,
  onRename,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameInput, setNameInput] = useState(project.name)

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nameInput.trim()) {
      onRename(project.id, nameInput.trim())
    }
    setIsRenaming(false)
  }

  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center justify-between p-3.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded-lg transition-all">
        <div
          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpen(project.id)}
        >
          <div className="w-9 h-9 rounded bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleRenameSubmit}
                  className="bg-zinc-800 border border-blue-500 text-white text-sm px-2 py-0.5 rounded focus:outline-none"
                  autoFocus
                />
              </form>
            ) : (
              <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>
            )}
            <p className="text-xs text-zinc-500 mt-0.5">
              {project.pageCount} page{project.pageCount > 1 ? 's' : ''} &bull; {project.nodeCount} layers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="hidden sm:inline-block">{formattedDate}</span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white"
              aria-label="Document options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 py-1 text-xs text-zinc-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenaming(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate(project.id)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    Duplicate
                  </button>
                  <div className="border-t border-zinc-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(project.id, project.name)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="group bg-zinc-900/60 hover:bg-zinc-850/90 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl overflow-hidden transition-all shadow-sm flex flex-col">
      {/* Thumbnail preview area */}
      <div
        className="h-36 bg-zinc-950/70 border-b border-zinc-800/80 flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:bg-zinc-950/90 transition-colors"
        onClick={() => onOpen(project.id)}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-800/30 text-blue-400 flex items-center justify-center transform group-hover:scale-110 transition-transform">
          <FileText className="w-6 h-6" />
        </div>

        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] bg-blue-600 text-white font-medium px-2 py-0.5 rounded shadow">
            Open Canvas
          </span>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleRenameSubmit}
                className="bg-zinc-800 border border-blue-500 text-white text-xs px-2 py-0.5 rounded focus:outline-none w-full"
                autoFocus
              />
            </form>
          ) : (
            <h3
              onClick={() => onOpen(project.id)}
              className="text-xs font-semibold text-zinc-100 truncate cursor-pointer hover:text-blue-400 transition-colors"
            >
              {project.name}
            </h3>
          )}
          <p className="text-[11px] text-zinc-500 mt-0.5">Edited {formattedDate}</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            aria-label="Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-30 py-1 text-xs text-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenaming(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(project.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  Duplicate
                </button>
                <div className="border-t border-zinc-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete(project.id, project.name)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
