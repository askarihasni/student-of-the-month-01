import { create } from 'zustand'
import type { User } from '../services/auth/AuthAdapter'
import { httpAuthAdapter as authAdapter } from '../services/auth/HttpAuthAdapter'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const user = await authAdapter.getCurrentUser()
      set({ user, isAuthenticated: !!user, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authAdapter.login(email, password)
      set({ user, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authAdapter.register(name, email, password)
      set({ user, isAuthenticated: true, isLoading: false, error: null })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  logout: async () => {
    await authAdapter.logout()
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null }),
}))

