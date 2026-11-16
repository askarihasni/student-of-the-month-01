import React, { useEffect, useState, useRef } from 'react'
import {
  Bell,
  Clock,
  ExternalLink,
  FileCode,
  Folder,
  Grid,
  Layers,
  List,
  LogOut,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Upload,
  User,
  Users,
} from 'lucide-react'
import type { ProjectMetadata, DocumentModel } from '../../types/document'
import { documentRepository } from '../../services/repositories/LocalDevelopmentDocumentRepository'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { FigmaLogo } from '../../components/ui/FigmaLogo'
import { ProjectCard } from './ProjectCard'
import { DocumentModelSchema } from '../../schemas/document.schema'

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [newDocModalOpen, setNewDocModalOpen] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [targetDelete, setTargetDelete] = useState<{ id: string; name: string } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    openDocument,
    searchQuery,
    setSearchQuery,
    dashboardViewMode,
    setDashboardViewMode,
    dashboardSortBy,
    setDashboardSortBy,
    setScreen,
  } = useUIStore()

  const { user, logout } = useAuthStore()
  const { setDocument } = useEditorStore()

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const list = await documentRepository.getAll()
      setProjects(list)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreateNew = async () => {
    const title = newDocName.trim() || 'Untitled Design'
    const newDoc = await documentRepository.create(title)
    setNewDocModalOpen(false)
    setNewDocName('')
    setDocument(newDoc)
    openDocument(newDoc.id)
  }

  const handleOpenProject = async (id: string) => {
    const doc = await documentRepository.getById(id)
    if (doc) {
      setDocument(doc)
      openDocument(doc.id)
    }
  }

  const handleDuplicate = async (id: string) => {
    await documentRepository.duplicate(id)
    await loadProjects()
  }

  const handleDeletePrompt = (id: string, name: string) => {
    setTargetDelete({ id, name })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (targetDelete) {
      await documentRepository.delete(targetDelete.id)
      setDeleteModalOpen(false)
      setTargetDelete(null)
      await loadProjects()
    }
  }

  const handleRename = async (id: string, newName: string) => {
    await documentRepository.rename(id, newName)
    await loadProjects()
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError(null)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        const validation = DocumentModelSchema.safeParse(parsed)

        if (!validation.success) {
          setImportError('Invalid Mini Figma JSON document format.')
          return
        }

        const validDoc = validation.data as DocumentModel
        await documentRepository.save(validDoc)
        await loadProjects()
        setDocument(validDoc)
        openDocument(validDoc.id)
      } catch (err) {
        setImportError('Could not parse JSON document.')
      }
    }
    reader.readAsText(file)
  }

  // Filter and sort
  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (dashboardSortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return b.updatedAt - a.updatedAt
    })

  return (
    <div className="min-h-screen bg-[#181818] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-[#2C2C2C] bg-[#242424] px-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <FigmaLogo size={18} showWordmark={true} />

          {/* Search bar with Ctrl+K shortcut badge */}
          <div className="relative w-80 hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#7E7E7E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files, teams, or components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#383838] text-xs rounded-md pl-9 pr-8 py-1.5 text-white placeholder-[#7E7E7E] focus:outline-none focus:border-[#0D99FF] focus:ring-1 focus:ring-[#0D99FF]"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#2C2C2C] text-[#7E7E7E] px-1 py-0.5 rounded text-[10px] font-mono border border-[#383838]">
              /
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJson}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2C2C2C] hover:bg-[#383838] text-[#B3B3B3] hover:text-white border border-[#383838] text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setNewDocModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Design File</span>
          </button>

          {/* User profile avatar dropdown */}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#0D99FF] transition-all focus:outline-none"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-[#444444]"
              />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-[#2C2C2C] border border-[#383838] rounded-xl shadow-2xl z-50 py-1.5 text-xs text-[#B3B3B3]">
                  <div className="px-4 py-2.5 border-b border-[#383838]">
                    <div className="font-semibold text-white">{user?.name || 'Askari Hasni'}</div>
                    <div className="text-[11px] text-[#7E7E7E] truncate">{user?.email || 'designer@minifigma.io'}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-[#0D99FF]/15 text-[#0D99FF] rounded text-[10px] font-semibold border border-[#0D99FF]/30">
                      <Sparkles className="w-3 h-3" /> Pro Workspace
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setScreen('auth')
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#7E7E7E]" />
                    Switch User / Account
                  </button>

                  <div className="border-t border-[#383838] my-1" />

                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false)
                      await logout()
                      setScreen('auth')
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-6 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block space-y-6">
          <nav className="space-y-0.5">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm"
            >
              <Clock className="w-4 h-4 text-[#0D99FF]" />
              <span>Recents</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] transition-colors"
            >
              <Folder className="w-4 h-4 text-[#7E7E7E]" />
              <span>Drafts</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] transition-colors"
            >
              <Users className="w-4 h-4 text-[#7E7E7E]" />
              <span>Shared with me</span>
            </button>
          </nav>

          {/* Teams list */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider px-3 mb-2">
              Teams
            </h4>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#242424] text-xs text-[#B3B3B3] cursor-pointer">
                <span className="w-3.5 h-3.5 rounded bg-blue-500/30 border border-blue-400 flex items-center justify-center text-[9px] font-bold text-blue-300">
                  D
                </span>
                <span>Design System</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#242424] text-xs text-[#B3B3B3] cursor-pointer">
                <span className="w-3.5 h-3.5 rounded bg-purple-500/30 border border-purple-400 flex items-center justify-center text-[9px] font-bold text-purple-300">
                  M
                </span>
                <span>Mobile App Team</span>
              </div>
            </div>
          </div>

          {/* Workspace Status Card */}
          <div className="p-3 bg-[#242424] rounded-xl border border-[#383838] text-xs space-y-2">
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-[11px] text-[#7E7E7E]">Mode</span>
              <span className="text-white font-medium">Local Dev</span>
            </div>
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-[11px] text-[#7E7E7E]">Total Files</span>
              <span className="text-white font-medium">{projects.length}</span>
            </div>
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-[11px] text-[#7E7E7E]">Renderer</span>
              <span className="text-emerald-400 font-mono text-[10px]">Canvas 2D</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Welcome & Quick Create Hero */}
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#242424] via-[#242424] to-[#1E1E1E] border border-[#2E2E2E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Designer'}
              </h1>
              <p className="text-xs text-[#B3B3B3] mt-1">
                Jump back into your recent vector designs or create a new blank canvas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewDocModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-xs font-semibold shadow-md shadow-[#0D99FF]/20 transition-all hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span>New Design File</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search feedback, Sort, Grid/List view */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2C2C2C]">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Recent Files</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#242424] text-[#B3B3B3] border border-[#383838]">
                {filteredProjects.length}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-[#B3B3B3] bg-[#242424] border border-[#383838] px-2.5 py-1 rounded-md">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#7E7E7E]" />
                <select
                  value={dashboardSortBy}
                  onChange={(e) => setDashboardSortBy(e.target.value as 'updatedAt' | 'name')}
                  aria-label="Sort projects"
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="updatedAt" className="bg-[#2C2C2C]">Last Modified</option>
                  <option value="name" className="bg-[#2C2C2C]">Name (A–Z)</option>
                </select>
              </div>

              {/* View switcher */}
              <div className="flex items-center bg-[#242424] border border-[#383838] p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('grid')}
                  className={`p-1 rounded ${
                    dashboardViewMode === 'grid' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('list')}
                  className={`p-1 rounded ${
                    dashboardViewMode === 'list' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {importError && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {importError}
            </div>
          )}

          {/* Grid / List of Projects */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-[#242424] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-[#383838] rounded-2xl bg-[#1E1E1E]/50">
              <div className="w-12 h-12 bg-[#2C2C2C] rounded-xl flex items-center justify-center mx-auto mb-3 text-[#7E7E7E]">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No documents found</h3>
              <p className="text-xs text-[#7E7E7E] max-w-xs mx-auto mt-1 mb-4">
                {searchQuery
                  ? `No designs matching "${searchQuery}". Clear your search query to see all files.`
                  : 'Start your creative journey by creating your first vector design document.'}
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setNewDocModalOpen(true)}
              >
                Create New Design
              </Button>
            </div>
          ) : dashboardViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  viewMode="grid"
                  onOpen={handleOpenProject}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeletePrompt}
                  onRename={handleRename}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  viewMode="list"
                  onOpen={handleOpenProject}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeletePrompt}
                  onRename={handleRename}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Document Modal */}
      <Modal
        isOpen={newDocModalOpen}
        onClose={() => setNewDocModalOpen(false)}
        title="Create New Vector Design"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#B3B3B3] mb-1.5">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Design System v2"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full bg-[#181818] border border-[#383838] rounded-md px-3 py-2 text-sm text-white placeholder-[#7E7E7E] focus:outline-none focus:border-[#0D99FF]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNew()
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#383838]">
            <Button variant="ghost" size="sm" onClick={() => setNewDocModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateNew}>
              Create File
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#B3B3B3] leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">&ldquo;{targetDelete?.name}&rdquo;</strong>? This file will be removed from your local workspace.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#383838]">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Keep File
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
