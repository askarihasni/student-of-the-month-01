import React, { useState, useEffect } from 'react'
import { Check, Copy, Globe, Lock, Shield, UserPlus, Users } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'
import { apiClient } from '../../services/api/apiClient'

export interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { document } = useEditorStore()
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)

  const [collaborators, setCollaborators] = useState<
    { id: string; name: string; email: string; avatar: string; role: string; isOwner: boolean }[]
  >([])

  const loadCollaborators = async () => {
    if (!document?.id) return
    try {
      const data = await apiClient.get<{ isPublic: boolean; collaborators: any[] }>(
        `/documents/${document.id}/permissions`
      )
      setIsPublic(data.isPublic)
      const mapped = data.collaborators.map((c) => ({
        id: c.id,
        name: c.user?.name || 'Collaborator',
        email: c.user?.email || '',
        avatar: c.user?.avatarUrl || '/avatar.jpg',
        role: c.role === 'OWNER' ? 'Owner' : c.role === 'EDITOR' ? 'Can edit' : 'Can view',
        isOwner: c.isOwner,
      }))
      setCollaborators(mapped)
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null)
      setSuccessMessage(null)
      loadCollaborators()
    }
  }, [isOpen, document?.id])

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTogglePublic = async () => {
    if (!document?.id) return
    const nextPublic = !isPublic
    try {
      await apiClient.patch(`/documents/${document.id}`, { isPublic: nextPublic })
      setIsPublic(nextPublic)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update access settings')
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteEmail.includes('@') || !document?.id) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await apiClient.post(`/documents/${document.id}/permissions`, {
        email: inviteEmail.trim(),
        role: inviteRole === 'editor' ? 'EDITOR' : 'VIEWER',
      })

      setSuccessMessage(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      await loadCollaborators()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to invite collaborator')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${document?.name || 'Design'}"`} maxWidth="max-w-lg">
      <div className="space-y-5 text-xs text-[#B3B3B3]">
        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-2.5 rounded bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-2.5 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs">
            {successMessage}
          </div>
        )}

        {/* Invite by email form */}
        <form onSubmit={handleSendInvite} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              placeholder="Enter collaborator email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-[#383838] focus:border-[#0D99FF] rounded-md px-3 py-2 text-xs text-white placeholder-[#7E7E7E] focus:outline-none"
            />
          </div>

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
            aria-label="Collaborator permission level"
            className="bg-[#1E1E1E] border border-[#383838] text-white text-xs rounded-md px-2.5 py-2 focus:outline-none cursor-pointer"
          >
            <option value="editor">Can edit</option>
            <option value="viewer">Can view</option>
          </select>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || !inviteEmail}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            {isLoading ? 'Inviting...' : 'Invite'}
          </Button>
        </form>

        {/* Collaborators list */}
        <div className="space-y-3 pt-2 border-t border-[#383838]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider">
            <span>Collaborators with access</span>
            <span className="flex items-center gap-1 font-normal text-xs text-[#B3B3B3]">
              <Users className="w-3.5 h-3.5" /> {collaborators.length || 1} people
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#383838]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#444444]"
                    />
                    {c.isOwner && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-[#1E1E1E]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate flex items-center gap-1.5">
                      {c.name}
                      {c.isOwner && <span className="text-[10px] text-[#7E7E7E] font-normal">(owner)</span>}
                    </div>
                    <div className="text-[10px] text-[#7E7E7E] truncate">{c.email}</div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                    c.isOwner
                      ? 'bg-[#2C2C2C] text-[#7E7E7E] border-[#383838]'
                      : 'bg-[#0D99FF]/10 text-[#0D99FF] border-[#0D99FF]/30'
                  }`}
                >
                  {c.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* General Link Access */}
        <div className="pt-2 border-t border-[#383838] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublic ? (
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-[#7E7E7E] shrink-0" />
            )}
            <div>
              <div className="font-medium text-white text-xs">
                {isPublic ? 'Anyone with the link can view' : 'Only invited collaborators can access'}
              </div>
              <div className="text-[10px] text-[#7E7E7E]">
                {isPublic
                  ? 'Public link is active and accessible across teams'
                  : 'Restricted to authenticated collaborators'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePublic}
            className="text-[11px] text-[#0D99FF] hover:underline focus:outline-none"
          >
            {isPublic ? 'Make private' : 'Enable link sharing'}
          </button>
        </div>

        {/* Copy link button */}
        <div className="pt-2 flex justify-end gap-2 border-t border-[#383838]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
