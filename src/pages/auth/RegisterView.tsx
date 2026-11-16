import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

export const RegisterView: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { register, isLoading, error, clearError } = useAuthStore()
  const { setAuthView, setScreen } = useUIStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    if (!name.trim()) {
      setValidationError('Please enter your full name.')
      return
    }
    if (!email || !email.includes('@')) {
      setValidationError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    const success = await register(name, email, password)
    if (success) {
      setScreen('dashboard')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
        <p className="text-sm text-zinc-400 mt-1">Start designing with Mini Figma today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(validationError || error) && (
          <div className="p-3 rounded-md bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
            {validationError || error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          autoFocus
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="jane@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-2.5 text-zinc-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 focus:border-blue-500 text-zinc-100 text-sm rounded px-3 py-1.5 pl-8 pr-9 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 text-zinc-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Confirm Password</label>
          <div className="relative flex items-center">
            <div className="absolute left-2.5 text-zinc-500 pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 focus:border-blue-500 text-zinc-100 text-sm rounded px-3 py-1.5 pl-8 pr-9 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-zinc-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setAuthView('login')}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
