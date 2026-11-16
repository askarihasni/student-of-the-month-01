import React from 'react'
import { useUIStore } from '../../store/uiStore'
import { FigmaLogo } from '../../components/ui/FigmaLogo'
import { LoginView } from './LoginView'
import { RegisterView } from './RegisterView'
import { ForgotPasswordView } from './ForgotPasswordView'

export const AuthPage: React.FC = () => {
  const { authView, setScreen } = useUIStore()

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#181818] text-white p-6 selection:bg-[#0D99FF] selection:text-white font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="cursor-pointer" onClick={() => setScreen('dashboard')}>
          <FigmaLogo size={20} showWordmark={true} />
        </div>

        <button
          type="button"
          onClick={() => setScreen('dashboard')}
          className="text-xs text-[#B3B3B3] hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-[#2C2C2C] border border-transparent hover:border-[#383838]"
        >
          Skip to Workspace →
        </button>
      </header>

      {/* Main Content Card */}
      <main className="my-auto py-10 w-full">
        <div className="max-w-md w-full mx-auto bg-[#242424] border border-[#383838] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {authView === 'login' && <LoginView />}
          {authView === 'register' && <RegisterView />}
          {authView === 'forgot' && <ForgotPasswordView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#7E7E7E] py-4 border-t border-[#2C2C2C]">
        <p>Mini Figma Vector Editor &bull; Phase 1 Frontend Architecture &bull; Local Development Storage Mode</p>
      </footer>
    </div>
  )
}
