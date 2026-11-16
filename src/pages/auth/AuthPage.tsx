import React from 'react'
import { Layers } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { LoginView } from './LoginView'
import { RegisterView } from './RegisterView'
import { ForgotPasswordView } from './ForgotPasswordView'

export const AuthPage: React.FC = () => {
  const { authView, setScreen } = useUIStore()

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-zinc-950 text-zinc-100 p-6 selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setScreen('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Mini Figma</span>
        </div>

        <button
          type="button"
          onClick={() => setScreen('dashboard')}
          className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
        >
          Skip to Dashboard →
        </button>
      </header>

      {/* Main Content Card */}
      <main className="my-auto py-10 w-full">
        <div className="max-w-md w-full mx-auto bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {authView === 'login' && <LoginView />}
          {authView === 'register' && <RegisterView />}
          {authView === 'forgot' && <ForgotPasswordView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-500 py-4 border-t border-zinc-900">
        <p>Mini Figma Vector Editor &bull; Phase 1 Frontend Architecture &bull; Local Development Storage Mode</p>
      </footer>
    </div>
  )
}
