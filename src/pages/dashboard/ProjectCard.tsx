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
      <div className="group flex items-center justify-between p-4 bg-[#1E1E1E] hover:bg-[#2C2C2C] border border-[#2E2E2E] hover:border-[#3E3E3E] rounded-xl transition-all shadow-sm">
        <div
          className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpen(project.id)}
        >
          <div className="w-12 h-12 rounded-lg bg-[#2C2C2C] group-hover:bg-[#383838] border border-[#383838] text-[#0D99FF] flex items-center justify-center shrink-0 transition-colors">
            <Layers className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleRenameSubmit}
                  className="bg-[#181818] border border-[#0D99FF] text-white text-sm px-2.5 py-1 rounded focus:outline-none"
                  autoFocus
                />
              </form>
            ) : (
              <h3 className="text-sm font-bold text-white truncate group-hover:text-[#0D99FF] transition-colors">
                {project.name}
              </h3>
            )}
            <p className="text-xs text-[#9E9E9E] mt-1">
              {project.pageCount} page{project.pageCount > 1 ? 's' : ''} &bull; {project.nodeCount} layers &bull; Edited {timeText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7E7E7E]">
          <button
            type="button"
            onClick={() => onOpen(project.id)}
            className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-[#383838] hover:bg-[#0D99FF] text-white rounded-lg text-xs font-semibold transition-all"
          >
            Open
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
              aria-label="Document options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-[#2C2C2C] border border-[#383838] rounded-xl shadow-2xl z-30 py-1.5 text-xs text-[#B3B3B3]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenaming(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2.5"
                  >
                    <Edit2 className="w-4 h-4 text-[#7E7E7E]" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDuplicate(project.id)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2.5"
                  >
                    <Copy className="w-4 h-4 text-[#7E7E7E]" />
                    Duplicate
                  </button>
                  <div className="border-t border-[#383838] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(project.id, project.name)
                      setIsMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
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
    <div className="group bg-[#1E1E1E] hover:bg-[#242424] border border-[#2E2E2E] hover:border-[#0D99FF]/60 rounded-2xl overflow-hidden transition-all shadow-md hover:shadow-2xl flex flex-col hover:-translate-y-1 duration-200">
      {/* Thumbnail preview area styled like a mini design canvas */}
      <div
        className="h-52 bg-[#141414] border-b border-[#2E2E2E] flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:bg-[#111111] transition-colors p-6"
        onClick={() => onOpen(project.id)}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#666 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Mini simulated artboard mockup */}
        {isMobile ? (
          <div className="w-28 h-40 rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-2xl flex flex-col p-2 gap-1.5 transform group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-12 rounded-lg bg-blue-600/90" />
            <div className="w-3/4 h-2.5 rounded bg-white/40" />
            <div className="w-1/2 h-2.5 rounded bg-white/20" />
            <div className="mt-auto flex justify-between items-center">
              <div className="w-5 h-5 rounded-full bg-amber-500/90" />
              <div className="w-10 h-5 rounded-md bg-blue-500/70" />
            </div>
          </div>
        ) : isLanding ? (
          <div className="w-52 h-36 rounded-xl bg-[#111116] border border-[#27272A] shadow-2xl flex flex-col p-3 gap-2 transform group-hover:scale-105 transition-transform duration-200">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-rose-500" />
              <div className="w-14 h-2 rounded bg-white/40" />
            </div>
            <div className="w-36 h-4 rounded bg-gradient-to-r from-rose-500/80 to-purple-500/80" />
            <div className="w-28 h-2.5 rounded bg-white/20" />
            <div className="w-16 h-4 rounded-md bg-indigo-600/90 mt-auto" />
          </div>
        ) : (
          <div className="w-40 h-28 rounded-xl bg-[#18181B] border border-[#2E2E38] shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-12 h-12 text-[#0D99FF]/90" />
          </div>
        )}

        {/* Hover quick open badge */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs bg-[#0D99FF] text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <ExternalLink className="w-3.5 h-3.5" /> Open Canvas
          </span>
        </div>
      </div>

      {/* Info footer */}
      <div className="p-4 flex items-center justify-between gap-3 bg-[#1C1C1C]">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleRenameSubmit}
                className="bg-[#181818] border border-[#0D99FF] text-white text-sm px-2.5 py-1 rounded focus:outline-none w-full"
                autoFocus
              />
            </form>
          ) : (
            <h3
              onClick={() => onOpen(project.id)}
              className="text-sm font-bold text-white truncate cursor-pointer hover:text-[#0D99FF] transition-colors"
              title={project.name}
            >
              {project.name}
            </h3>
          )}
          <p className="text-xs text-[#9E9E9E] mt-1 font-medium">
            Edited {timeText} &bull; {project.nodeCount} layers
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
            aria-label="Project actions"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-[#2C2C2C] border border-[#383838] rounded-xl shadow-2xl z-30 py-1.5 text-xs text-[#B3B3B3]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenaming(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2.5"
                >
                  <Edit2 className="w-4 h-4 text-[#7E7E7E]" />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(project.id)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2.5"
                >
                  <Copy className="w-4 h-4 text-[#7E7E7E]" />
                  Duplicate
                </button>
                <div className="border-t border-[#383838] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete(project.id, project.name)
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2.5"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
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
