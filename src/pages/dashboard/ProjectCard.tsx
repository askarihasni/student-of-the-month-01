import React, { useState } from 'react'
import {
  Copy,
  Edit2,
  ExternalLink,
  FileCode,
  FileText,
  Folder,
  Layers,
  MoreHorizontal,
  Square,
  Trash2,
} from 'lucide-react'
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

  // Format relative time or clean date
  const now = Date.now()
  const diffHours = Math.round((now - project.updatedAt) / (1000 * 3600))
  let timeText = 'Just now'
  if (diffHours >= 24) {
    const days = Math.round(diffHours / 24)
    timeText = `${days} day${days > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  // Color theme per project id for thumbnail vibrancy
  const isMobile = project.id.includes('mobile') || project.name.toLowerCase().includes('mobile')
  const isLanding = project.id.includes('landing') || project.name.toLowerCase().includes('hero')

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center justify-between p-3 bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-[#2E2E2E] hover:border-[#3E3E3E] rounded-lg transition-all">
        <div
          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpen(project.id)}
        >
          <div className="w-9 h-9 rounded-md bg-[#2C2C2C] group-hover:bg-[#383838] border border-[#383838] text-[#0D99FF] flex items-center justify-center shrink-0 transition-colors">
            <Layers className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleRenameSubmit}
                  className="bg-[#181818] border border-[#0D99FF] text-white text-xs px-2 py-0.5 rounded focus:outline-none"
                  autoFocus
                />
              </form>
            ) : (
              <h3 className="text-xs font-semibold text-white truncate group-hover:text-[#0D99FF] transition-colors">
                {project.name}
              </h3>
            )}
            <p className="text-[11px] text-[#7E7E7E] mt-0.5">
              {project.pageCount} page{project.pageCount > 1 ? 's' : ''} &bull; {project.nodeCount} layers &bull; Edited {timeText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7E7E7E]">
          <button
            type="button"
            onClick={() => onOpen(project.id)}
            className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-[#383838] hover:bg-[#444] text-white rounded text-[11px] font-medium transition-all"
          >
            Open
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
              aria-label="Document options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-[#2C2C2C] border border-[#383838] rounded-lg shadow-2xl z-30 py-1 text-xs text-[#B3B3B3]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenaming(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#7E7E7E]" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate(project.id)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#7E7E7E]" />
                    Duplicate
                  </button>
                  <div className="border-t border-[#383838] my-1" />
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
    <div className="group bg-[#1E1E1E] hover:bg-[#242424] border border-[#2E2E2E] hover:border-[#0D99FF]/50 rounded-xl overflow-hidden transition-all shadow-md hover:shadow-xl flex flex-col hover:-translate-y-0.5 duration-150">
      {/* Thumbnail preview area styled like a mini design canvas */}
      <div
        className="h-36 bg-[#161616] border-b border-[#2E2E2E] flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:bg-[#121212] transition-colors p-4"
        onClick={() => onOpen(project.id)}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#555 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Mini simulated artboard mockup */}
        {isMobile ? (
          <div className="w-20 h-28 rounded-lg bg-[#0F172A] border border-[#1E293B] shadow-lg flex flex-col p-1.5 gap-1 transform group-hover:scale-105 transition-transform">
            <div className="w-full h-8 rounded bg-blue-600/80" />
            <div className="w-3/4 h-2 rounded-sm bg-white/40" />
            <div className="w-1/2 h-2 rounded-sm bg-white/20" />
            <div className="mt-auto flex justify-between">
              <div className="w-4 h-4 rounded-full bg-amber-500/80" />
              <div className="w-8 h-4 rounded bg-blue-500/60" />
            </div>
          </div>
        ) : isLanding ? (
          <div className="w-36 h-24 rounded-lg bg-[#111116] border border-[#27272A] shadow-lg flex flex-col p-2 gap-1.5 transform group-hover:scale-105 transition-transform">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <div className="w-10 h-1.5 rounded-sm bg-white/40" />
            </div>
            <div className="w-24 h-3 rounded-sm bg-gradient-to-r from-rose-500/80 to-purple-500/80" />
            <div className="w-20 h-2 rounded-sm bg-white/20" />
            <div className="w-12 h-3 rounded bg-indigo-600/90 mt-auto" />
          </div>
        ) : (
          <div className="w-28 h-20 rounded-lg bg-[#18181B] border border-[#2E2E38] shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
            <Layers className="w-8 h-8 text-[#0D99FF]/80" />
          </div>
        )}

        {/* Hover quick open badge */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-[11px] bg-[#0D99FF] text-white font-semibold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <ExternalLink className="w-3 h-3" /> Open Canvas
          </span>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleRenameSubmit}
                className="bg-[#181818] border border-[#0D99FF] text-white text-xs px-2 py-0.5 rounded focus:outline-none w-full"
                autoFocus
              />
            </form>
          ) : (
            <h3
              onClick={() => onOpen(project.id)}
              className="text-xs font-semibold text-white truncate cursor-pointer hover:text-[#0D99FF] transition-colors"
              title={project.name}
            >
              {project.name}
            </h3>
          )}
          <p className="text-[10px] text-[#7E7E7E] mt-0.5">
            Edited {timeText} &bull; {project.nodeCount} layers
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
            aria-label="Project actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-[#2C2C2C] border border-[#383838] rounded-lg shadow-2xl z-30 py-1 text-xs text-[#B3B3B3]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenaming(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7E7E7E]" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(project.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7E7E7E]" />
                  Duplicate
                </button>
                <div className="border-t border-[#383838] my-1" />
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
