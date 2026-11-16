import { create } from 'zustand'

export type ScreenType = 'auth' | 'dashboard' | 'editor'
export type AuthViewType = 'login' | 'register' | 'forgot'
export type LeftSidebarTab = 'layers' | 'pages'
export type ModalType =
  | 'newDocument'
  | 'deleteConfirm'
  | 'versionHistory'
  | 'export'
  | 'shortcuts'
  | null

interface UIState {
  currentScreen: ScreenType
  authView: AuthViewType
  openDocumentId: string | null
  theme: 'dark' | 'light'
  leftSidebarTab: LeftSidebarTab
  isLeftSidebarOpen: boolean
  isRightSidebarOpen: boolean
  activeModal: ModalType
  deleteTargetId: string | null
  deleteTargetName: string
  searchQuery: string
  dashboardViewMode: 'grid' | 'list'
  dashboardSortBy: 'updatedAt' | 'name'

  setScreen: (screen: ScreenType) => void
  setAuthView: (view: AuthViewType) => void
  openDocument: (id: string) => void
  closeDocument: () => void
  toggleTheme: () => void
  setLeftSidebarTab: (tab: LeftSidebarTab) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  openModal: (modal: ModalType, targetId?: string, targetName?: string) => void
  closeModal: () => void
  setSearchQuery: (query: string) => void
  setDashboardViewMode: (mode: 'grid' | 'list') => void
  setDashboardSortBy: (sort: 'updatedAt' | 'name') => void
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'dashboard', // default to dashboard with easy auth toggle
  authView: 'login',
  openDocumentId: null,
  theme: 'dark',
  leftSidebarTab: 'layers',
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  activeModal: null,
  deleteTargetId: null,
  deleteTargetName: '',
  searchQuery: '',
  dashboardViewMode: 'grid',
  dashboardSortBy: 'updatedAt',

  setScreen: (screen) => set({ currentScreen: screen }),
  setAuthView: (view) => set({ authView: view }),
  openDocument: (id) => set({ openDocumentId: id, currentScreen: 'editor' }),
  closeDocument: () => set({ openDocumentId: null, currentScreen: 'dashboard' }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setLeftSidebarTab: (tab) => set({ leftSidebarTab: tab }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  openModal: (modal, targetId = undefined, targetName = '') =>
    set({ activeModal: modal, deleteTargetId: targetId ?? null, deleteTargetName: targetName }),
  closeModal: () => set({ activeModal: null, deleteTargetId: null, deleteTargetName: '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDashboardViewMode: (mode) => set({ dashboardViewMode: mode }),
  setDashboardSortBy: (sort) => set({ dashboardSortBy: sort }),
}))
