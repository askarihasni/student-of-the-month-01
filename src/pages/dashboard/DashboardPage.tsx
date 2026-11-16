import React, { useEffect, useState, useRef } from 'react'
import {
  Clock,
  Folder,
  Grid,
  Layers,
  List,
  LogOut,
  Plus,
  Search,
  Upload,
  User,
  SlidersHorizontal,
} from 'lucide-react'
import type { ProjectMetadata, DocumentModel } from '../../types/document'
import { documentRepository } from '../../services/repositories/LocalDevelopmentDocumentRepository'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
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
          setImportError('Invalid Mini Figma JSON document structure.')
          return
        }

        const validDoc = validation.data as DocumentModel
        // Save and open
        await documentRepository.save(validDoc)
        await loadProjects()
        setDocument(validDoc)
        openDocument(validDoc.id)
      } catch (err) {
        setImportError('Could not parse JSON file.')
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">Mini Figma</span>
          </div>

          <div className="relative w-72 hidden md:block">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files and designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-lg pl-9 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
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

          <Button
            variant="secondary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setNewDocModalOpen(true)}
          >
            Create New Design
          </Button>

          {/* User profile dropdown */}
          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all focus:outline-none"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700"
              />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1.5 text-xs text-zinc-300">
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-white">{user?.name || 'Designer'}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user?.email || 'designer@minifigma.io'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-950 text-blue-400 rounded text-[10px] font-medium border border-blue-800/40">
                      Pro Plan (Simulated)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      setScreen('auth')
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Switch Account / Sign In
                  </button>

                  <div className="border-t border-zinc-800 my-1" />

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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-6 gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-52 shrink-0 hidden md:block">
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-850 text-white border border-zinc-800"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              Recent Files
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <Folder className="w-4 h-4" />
              All Projects
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">
              Workspace
            </h4>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Storage:</span>
                <span className="text-zinc-200">Local Dev</span>
              </div>
              <div className="flex justify-between">
                <span>Total Files:</span>
                <span className="text-zinc-200">{projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Engine:</span>
                <span className="text-green-400 font-medium">Canvas 2D</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Recent Files</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {filteredProjects.length} document{filteredProjects.length === 1 ? '' : 's'} available
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <select
                  value={dashboardSortBy}
                  onChange={(e) => setDashboardSortBy(e.target.value as 'updatedAt' | 'name')}
                  aria-label="Sort projects"
                  className="bg-transparent text-zinc-200 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="updatedAt">Last Modified</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              {/* View switcher */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('grid')}
                  className={`p-1.5 rounded ${
                    dashboardViewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardViewMode('list')}
                  className={`p-1.5 rounded ${
                    dashboardViewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
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
                <div key={i} className="h-48 bg-zinc-900/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No documents found</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 mb-4">
                {searchQuery
                  ? `No designs matching "${searchQuery}". Clear your search to see all files.`
                  : 'Get started by creating your first vector design document.'}
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
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Mobile App Redesign"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNew()
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setNewDocModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateNew}>
              Create Document
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
          <p className="text-xs text-zinc-300 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">&ldquo;{targetDelete?.name}&rdquo;</strong>? This action cannot be
            undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
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
