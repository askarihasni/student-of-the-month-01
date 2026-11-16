import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { login, isLoading, error, clearError } = useAuthStore()
  const { setAuthView, setScreen } = useUIStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    if (!email) {
      setValidationError('Please enter your email address.')
      return
    }
    if (!password) {
      setValidationError('Please enter your password.')
      return
    }

    const success = await login(email, password)
    if (success) {
      setScreen('dashboard')
    }
  }

  const handleDemoSignIn = async () => {
    setEmail('designer@minifigma.io')
    setPassword('password123')
    const success = await login('designer@minifigma.io', 'password123')
    if (success) {
      setScreen('dashboard')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-sm text-zinc-400 mt-1">Sign in to your Mini Figma account</p>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={handleDemoSignIn}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>One-Click Demo Sign In (Instant Access)</span>
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-zinc-900 px-2 text-zinc-500">or sign in with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(validationError || error) && (
          <div className="p-3 rounded-md bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
            {validationError || error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
          autoFocus
        />

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-zinc-400">Password</label>
            <button
              type="button"
              onClick={() => setAuthView('forgot')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-2.5 text-zinc-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 focus:border-blue-500 text-zinc-100 text-sm rounded px-3 py-1.5 pl-8 pr-9 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 text-zinc-400 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-zinc-400">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => setAuthView('register')}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Create account
        </button>
      </div>
    </div>
  )
}

