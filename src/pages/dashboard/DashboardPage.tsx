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
    <div className="min-h-screen h-screen overflow-y-auto bg-[#181818] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-[#2C2C2C] bg-[#242424] px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-8">
          <FigmaLogo size={26} showWordmark={true} />

          {/* Search bar with Ctrl+K shortcut badge */}
          <div className="relative w-96 hidden md:block">
            <Search className="w-4 h-4 text-[#7E7E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files, teams, or components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#383838] text-sm rounded-lg pl-10 pr-9 py-2 text-white placeholder-[#7E7E7E] focus:outline-none focus:border-[#0D99FF] focus:ring-1 focus:ring-[#0D99FF] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2C2C2C] text-[#7E7E7E] px-1.5 py-0.5 rounded text-xs font-mono border border-[#383838]">
              /
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2C2C2C] hover:bg-[#383838] text-[#D0D0D0] hover:text-white border border-[#383838] text-sm font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setNewDocModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-sm font-bold shadow-md shadow-[#0D99FF]/20 transition-all active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Design File</span>
          </button>

          {/* User profile avatar dropdown */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-[#0D99FF] transition-all focus:outline-none"
            >
              <img
                src={user?.avatar || '/avatar.jpg'}
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-[#444444]"
              />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-[#2C2C2C] border border-[#383838] rounded-2xl shadow-2xl z-50 py-2 text-xs text-[#B3B3B3]">
                  <div className="px-4 py-3 border-b border-[#383838] flex items-center gap-3">
                    <img
                      src={user?.avatar || '/avatar.jpg'}
                      alt={user?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-[#444444] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm truncate">{user?.name || 'Askari Hasni'}</div>
                      <div className="text-xs text-[#7E7E7E] truncate">{user?.email || 'designer@minifigma.io'}</div>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-[#0D99FF]/15 text-[#0D99FF] rounded text-[10px] font-bold border border-[#0D99FF]/30">
                        <Sparkles className="w-3 h-3" /> Pro Workspace
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setScreen('auth')
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#383838] hover:text-white flex items-center gap-2.5 text-xs font-medium"
                  >
                    <User className="w-4 h-4 text-[#7E7E7E]" />
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
                    className="w-full px-4 py-2.5 text-left hover:bg-red-950/60 text-red-400 flex items-center gap-2.5 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-[1500px] w-full mx-auto px-8 py-8 gap-10">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block space-y-7">
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm"
            >
              <Clock className="w-4.5 h-4.5 text-[#0D99FF]" />
              <span>Recents</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] transition-colors"
            >
              <Folder className="w-4.5 h-4.5 text-[#7E7E7E]" />
              <span>Drafts</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] transition-colors"
            >
              <Users className="w-4.5 h-4.5 text-[#7E7E7E]" />
              <span>Shared with me</span>
            </button>
          </nav>

          {/* Teams list */}
          <div>
            <h4 className="text-xs font-bold text-[#7E7E7E] uppercase tracking-wider px-4 mb-2.5">
              Teams
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#242424] text-sm text-[#D0D0D0] cursor-pointer">
                <span className="w-4.5 h-4.5 rounded bg-blue-500/30 border border-blue-400 flex items-center justify-center text-[10px] font-bold text-blue-300">
                  D
                </span>
                <span>Design System</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#242424] text-sm text-[#D0D0D0] cursor-pointer">
                <span className="w-4.5 h-4.5 rounded bg-purple-500/30 border border-purple-400 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  M
                </span>
                <span>Mobile App Team</span>
              </div>
            </div>
          </div>

          {/* Workspace Status Card */}
          <div className="p-4 bg-[#242424] rounded-2xl border border-[#383838] text-sm space-y-2.5">
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-xs text-[#7E7E7E]">Mode</span>
              <span className="text-white font-medium">Local Dev</span>
            </div>
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-xs text-[#7E7E7E]">Total Files</span>
              <span className="text-white font-medium">{projects.length}</span>
            </div>
            <div className="flex items-center justify-between text-[#B3B3B3]">
              <span className="text-xs text-[#7E7E7E]">Renderer</span>
              <span className="text-emerald-400 font-mono text-xs">Canvas 2D</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Welcome & Quick Create Hero */}
          <div className="mb-8 p-7 rounded-2xl bg-gradient-to-r from-[#242424] via-[#222222] to-[#1C1C1C] border border-[#333333] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'Designer'}
              </h1>
              <p className="text-sm text-[#B3B3B3] mt-1.5 font-normal">
                Jump back into your recent vector designs or create a new blank canvas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setNewDocModalOpen(true)}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-sm font-bold shadow-lg shadow-[#0D99FF]/20 transition-all hover:scale-102 active:scale-98"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>New Design File</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search feedback, Sort, Grid/List view */}
          <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-[#2C2C2C]">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white">Recent Files</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#242424] text-[#B3B3B3] border border-[#383838] font-semibold">
                {filteredProjects.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-2 text-sm text-[#D0D0D0] bg-[#242424] border border-[#383838] px-3 py-1.5 rounded-lg">
                <SlidersHorizontal className="w-4 h-4 text-[#7E7E7E]" />
                <select
                  value={dashboardSortBy}
                  onChange={(e) => setDashboardSortBy(e.target.value as 'updatedAt' | 'name')}
                  aria-label="Sort projects"
                  className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="updatedAt" className="bg-[#2C2C2C]">Last Modified</option>
                  <option value="name" className="bg-[#2C2C2C]">Name (A–Z)</option>
                </select>
              </div>

              {/* View switcher */}
              <div className="flex items-center bg-[#242424] border border-[#383838] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('grid')}
                  className={`p-1.5 rounded ${
                    dashboardViewMode === 'grid' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('list')}
                  className={`p-1.5 rounded ${
                    dashboardViewMode === 'list' ? 'bg-[#383838] text-white' : 'text-[#7E7E7E] hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {importError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
              {importError}
            </div>
          )}

          {/* Grid / List of Projects */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#242424] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#383838] rounded-2xl bg-[#1E1E1E]/50">
              <div className="w-14 h-14 bg-[#2C2C2C] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#7E7E7E]">
                <Folder className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No documents found</h3>
              <p className="text-sm text-[#7E7E7E] max-w-sm mx-auto mt-1 mb-5">
                {searchQuery
                  ? `No designs matching "${searchQuery}". Clear your search query to see all files.`
                  : 'Start your creative journey by creating your first vector design document.'}
              </p>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4.5 h-4.5" />}
                onClick={() => setNewDocModalOpen(true)}
              >
                Create New Design
              </Button>
            </div>
          ) : dashboardViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
