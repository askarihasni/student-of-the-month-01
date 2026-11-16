import React, { useState } from 'react'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authAdapter } from '../../services/auth/MockAuthAdapter'
import { useUIStore } from '../../store/uiStore'

export const ForgotPasswordView: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setAuthView } = useUIStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      await authAdapter.requestPasswordReset(email)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request reset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {isSubmitted ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-950/60 border border-green-800 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            In this frontend simulation, a password reset link has been prepared for{' '}
            <span className="text-zinc-200 font-medium">{email}</span>.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setAuthView('login')}
          >
            Back to sign in
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              autoFocus
            />

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </button>
          </div>
        </>
      )}
    </div>
  )
}
