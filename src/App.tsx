import React, { useEffect } from 'react'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import { AuthPage } from './pages/auth/AuthPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { EditorPage } from './pages/editor/EditorPage'

export function App() {
  const { currentScreen } = useUIStore()
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="w-full h-full min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100">
      {currentScreen === 'auth' && <AuthPage />}
      {currentScreen === 'dashboard' && <DashboardPage />}
      {currentScreen === 'editor' && <EditorPage />}
    </div>
  )
}

export default App
