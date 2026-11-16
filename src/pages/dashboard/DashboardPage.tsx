import React, { useEffect, useState, useRef, useMemo } from 'react'
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

export type DashboardSection =
  | 'recents'
  | 'drafts'
  | 'shared'
  | 'team-design-system'
  | 'team-mobile-app'
  | string

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [newDocModalOpen, setNewDocModalOpen] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [targetDelete, setTargetDelete] = useState<{ id: string; name: string } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Active navigation section
  const [activeSection, setActiveSection] = useState<DashboardSection>('recents')

  // Teams list with ability to create new team
  const [teams, setTeams] = useState<
    { id: string; name: string; letter: string; color: string; border: string; activeColor: string }[]
  >([
    {
      id: 'team-design-system',
      name: 'Design System',
      letter: 'D',
      color: 'bg-blue-500/30 text-blue-300',
      border: 'border-blue-400',
      activeColor: 'bg-blue-500 text-white shadow-sm ring-2 ring-[#0D99FF]',
    },
    {
      id: 'team-mobile-app',
      name: 'Mobile App Team',
      letter: 'M',
      color: 'bg-purple-500/30 text-purple-300',
      border: 'border-purple-400',
      activeColor: 'bg-purple-500 text-white shadow-sm ring-2 ring-purple-400',
    },
  ])
  const [newTeamModalOpen, setNewTeamModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')

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
  }, [activeSection])

  // Section metadata configuration
  const sectionMeta = useMemo(() => {
    switch (activeSection) {
      case 'drafts':
        return {
          badge: 'Private Workspace',
          title: 'Drafts',
          subtitle: 'Your personal working drafts and exploratory vector sketches.',
          heading: 'Personal Drafts',
          newDocLabel: 'New Draft File',
          defaultDocName: 'Untitled Draft',
          emptyMessage: 'No draft files yet. Create a new draft to begin designing.',
        }
      case 'shared':
        return {
          badge: 'Shared Files',
          title: 'Shared with me',
          subtitle: 'Vector canvases and design files shared with you by team collaborators.',
          heading: 'Shared Documents',
          newDocLabel: 'New Shared Design',
          defaultDocName: 'Shared Workspace Design',
          emptyMessage: 'No shared files found. Team members can share files using the Share modal.',
        }
      case 'team-design-system':
        return {
          badge: 'Design System',
          title: 'Design System Team',
          subtitle: 'Official component libraries, typography tokens, and foundational design assets.',
          heading: 'Design System Assets',
          newDocLabel: 'New Component File',
          defaultDocName: 'Design System - New Component',
          emptyMessage: 'No design system files yet in this workspace.',
        }
      case 'team-mobile-app':
        return {
          badge: 'Mobile App',
          title: 'Mobile App Team',
          subtitle: 'iOS & Android mobile layouts, interactive user flows, and screen mockups.',
          heading: 'Mobile App Projects',
          newDocLabel: 'New Mobile Screen',
          defaultDocName: 'Mobile App - New Screen',
          emptyMessage: 'No mobile projects found in this team workspace.',
        }
      case 'recents':
      default:
        return {
          badge: 'All Files',
          title: `Welcome back, ${user?.name?.split(' ')[0] || 'Askari'}`,
          subtitle: 'Jump back into your recent vector designs or create a new blank canvas.',
          heading: 'Recent Files',
          newDocLabel: 'New Design File',
          defaultDocName: 'Untitled Design',
          emptyMessage: 'No documents found. Start your creative journey by creating your first vector file.',
        }
    }
  }, [activeSection, user])

  // Filter projects by current section
  const sectionFilteredProjects = useMemo(() => {
    switch (activeSection) {
      case 'drafts':
        return projects.filter(
          (p) =>
            p.name.toLowerCase().includes('styleguide') ||
            p.name.toLowerCase().includes('draft') ||
            p.name.toLowerCase().includes('untitled') ||
            (!p.id.includes('mobile') && !p.id.includes('landing'))
        )
      case 'shared':
        return projects.filter(
          (p) =>
            p.name.toLowerCase().includes('styleguide') ||
            p.name.toLowerCase().includes('hero') ||
            p.id.includes('shared')
        )
      case 'team-design-system':
        return projects.filter(
          (p) =>
            p.name.toLowerCase().includes('design system') ||
            p.name.toLowerCase().includes('styleguide') ||
            p.name.toLowerCase().includes('component') ||
            p.name.toLowerCase().includes('hero')
        )
      case 'team-mobile-app':
        return projects.filter(
          (p) =>
            p.name.toLowerCase().includes('mobile') ||
            p.name.toLowerCase().includes('wallet') ||
            p.name.toLowerCase().includes('crypto') ||
            p.name.toLowerCase().includes('app')
        )
      case 'recents':
      default:
        return projects
    }
  }, [projects, activeSection])

  // Search and Sort
  const filteredProjects = useMemo(() => {
    return sectionFilteredProjects
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (dashboardSortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        return b.updatedAt - a.updatedAt
      })
  }, [sectionFilteredProjects, searchQuery, dashboardSortBy])

  const handleCreateNew = async () => {
    const title = newDocName.trim() || sectionMeta.defaultDocName
    const newDoc = await documentRepository.create(title)
    setNewDocModalOpen(false)
    setNewDocName('')
    setDocument(newDoc)
    openDocument(newDoc.id)
  }

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    const teamId = `team-${Date.now().toString(36)}`
    const letter = newTeamName.trim().charAt(0).toUpperCase()
    setTeams((prev) => [
      ...prev,
      {
        id: teamId,
        name: newTeamName.trim(),
        letter,
        color: 'bg-emerald-500/30 text-emerald-300',
        border: 'border-emerald-400',
        activeColor: 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400',
      },
    ])
    setActiveSection(teamId)
    setNewTeamModalOpen(false)
    setNewTeamName('')
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

  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-[#181818] text-white flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-16 border-b border-[#2C2C2C] bg-[#242424] px-8 flex items-center justify-between sticky top-0 z-30 shadow-md shrink-0">
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
            onClick={() => {
              setNewDocName(sectionMeta.defaultDocName)
              setNewDocModalOpen(true)
            }}
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
          <nav className="space-y-1.5">
            {/* Recents Button */}
            <button
              type="button"
              onClick={() => setActiveSection('recents')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                activeSection === 'recents'
                  ? 'font-bold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm'
                  : 'font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] border border-transparent'
              }`}
            >
              <Clock className={`w-4.5 h-4.5 ${activeSection === 'recents' ? 'text-[#0D99FF]' : 'text-[#7E7E7E]'}`} />
              <span>Recents</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#B3B3B3] font-mono">
                {projects.length}
              </span>
            </button>

            {/* Drafts Button */}
            <button
              type="button"
              onClick={() => setActiveSection('drafts')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                activeSection === 'drafts'
                  ? 'font-bold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm'
                  : 'font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] border border-transparent'
              }`}
            >
              <Folder className={`w-4.5 h-4.5 ${activeSection === 'drafts' ? 'text-[#0D99FF]' : 'text-[#7E7E7E]'}`} />
              <span>Drafts</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#B3B3B3] font-mono">
                {projects.filter((p) => !p.id.includes('mobile') && !p.id.includes('landing')).length || 1}
              </span>
            </button>

            {/* Shared with me Button */}
            <button
              type="button"
              onClick={() => setActiveSection('shared')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                activeSection === 'shared'
                  ? 'font-bold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm'
                  : 'font-medium text-[#B3B3B3] hover:text-white hover:bg-[#242424] border border-transparent'
              }`}
            >
              <Users className={`w-4.5 h-4.5 ${activeSection === 'shared' ? 'text-[#0D99FF]' : 'text-[#7E7E7E]'}`} />
              <span>Shared with me</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#B3B3B3] font-mono">
                2
              </span>
            </button>
          </nav>

          {/* Teams list with + Create Team Button */}
          <div>
            <div className="flex items-center justify-between px-4 mb-2.5">
              <h4 className="text-xs font-bold text-[#7E7E7E] uppercase tracking-wider">
                Teams
              </h4>
              <button
                type="button"
                onClick={() => setNewTeamModalOpen(true)}
                className="p-1 rounded hover:bg-[#383838] text-[#7E7E7E] hover:text-white transition-colors"
                title="Create New Team"
                aria-label="Create New Team"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {teams.map((t) => {
                const isActive = activeSection === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveSection(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all cursor-pointer text-left ${
                      isActive
                        ? 'font-bold bg-[#2C2C2C] text-white border border-[#383838] shadow-sm'
                        : 'font-medium text-[#D0D0D0] hover:text-white hover:bg-[#242424] border border-transparent'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform ${
                        isActive ? t.activeColor : `${t.color} border ${t.border}`
                      }`}
                    >
                      {t.letter}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                )
              })}
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
          {/* Welcome & Quick Create Hero Banner */}
          <div className="mb-8 p-7 rounded-2xl bg-gradient-to-r from-[#242424] via-[#222222] to-[#1C1C1C] border border-[#333333] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#0D99FF]/15 text-[#0D99FF] font-bold border border-[#0D99FF]/30 uppercase tracking-wider">
                  {sectionMeta.badge}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {sectionMeta.title}
              </h1>
              <p className="text-sm text-[#B3B3B3] mt-1.5 font-normal">
                {sectionMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewDocName(sectionMeta.defaultDocName)
                  setNewDocModalOpen(true)
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#0D99FF] hover:bg-[#0C8CE9] text-white text-sm font-bold shadow-lg shadow-[#0D99FF]/20 transition-all hover:scale-102 active:scale-98"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>{sectionMeta.newDocLabel}</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Section heading, Sort, Grid/List view */}
          <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-[#2C2C2C]">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white">{sectionMeta.heading}</h2>
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
                  : sectionMeta.emptyMessage}
              </p>
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4.5 h-4.5" />}
                onClick={() => {
                  setNewDocName(sectionMeta.defaultDocName)
                  setNewDocModalOpen(true)
                }}
              >
                {sectionMeta.newDocLabel}
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
            <div className="space-y-2.5">
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
              placeholder={`e.g. ${sectionMeta.defaultDocName}`}
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

      {/* Create Team Modal */}
      <Modal
        isOpen={newTeamModalOpen}
        onClose={() => setNewTeamModalOpen(false)}
        title="Create New Team Workspace"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#B3B3B3] mb-1.5">Team Name</label>
            <input
              type="text"
              placeholder="e.g. Web Platform Team"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full bg-[#181818] border border-[#383838] rounded-md px-3 py-2 text-sm text-white placeholder-[#7E7E7E] focus:outline-none focus:border-[#0D99FF]"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#383838]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setNewTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Team
            </Button>
          </div>
        </form>
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
