import React, { useState } from 'react'
import { Check, Copy, Globe, Lock, Shield, UserPlus, Users } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useEditorStore } from '../../store/editorStore'

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
  const [invites, setInvites] = useState<
    { name: string; email: string; avatar: string; role: string }[]
  >([
    {
      name: 'Sarah Chen',
      email: 'sarah@designteam.io',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      role: 'Can edit',
    },
    {
      name: 'David Kim',
      email: 'david@product.co',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
      role: 'Can view',
    },
  ])

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteEmail.includes('@')) return

    const newInvite = {
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80`,
      role: inviteRole === 'editor' ? 'Can edit' : 'Can view',
    }

    setInvites([newInvite, ...invites])
    setInviteEmail('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${document?.name || 'Design'}"`} maxWidth="max-w-lg">
      <div className="space-y-5 text-xs text-[#B3B3B3]">
        {/* Invite by email form */}
        <form onSubmit={handleSendInvite} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="email"
              placeholder="Email, comma-separated emails, or name"
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

          <Button type="submit" variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>
            Invite
          </Button>
        </form>

        {/* Collaborators list */}
        <div className="space-y-3 pt-2 border-t border-[#383838]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#7E7E7E] uppercase tracking-wider">
            <span>Collaborators with access</span>
            <span className="flex items-center gap-1 font-normal text-xs text-[#B3B3B3]">
              <Users className="w-3.5 h-3.5" /> {invites.length + 1} people
            </span>
          </div>

          {/* Owner (You) */}
          <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#383838]/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <img
                  src={user?.avatar || '/avatar.jpg'}
                  alt={user?.name || 'Owner'}
                  className="w-7 h-7 rounded-full object-cover border border-[#444444]"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-[#1E1E1E]" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-white truncate flex items-center gap-1.5">
                  {user?.name || 'Askari Hasni'}
                  <span className="text-[10px] text-[#7E7E7E] font-normal">(you)</span>
                </div>
                <div className="text-[10px] text-[#7E7E7E] truncate">{user?.email || 'designer@minifigma.io'}</div>
              </div>
            </div>

            <span className="text-[11px] text-[#7E7E7E] font-medium px-2 py-0.5 rounded bg-[#2C2C2C] border border-[#383838]">
              Owner
            </span>
          </div>

          {/* Invited users */}
          {invites.map((inv) => (
            <div
              key={inv.email}
              className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-[#383838]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={inv.avatar}
                  alt={inv.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#444444]"
                />
                <div className="min-w-0">
                  <div className="font-medium text-white truncate">{inv.name}</div>
                  <div className="text-[10px] text-[#7E7E7E] truncate">{inv.email}</div>
                </div>
              </div>

              <span className="text-[11px] text-[#B3B3B3] px-2 py-0.5 rounded bg-[#2C2C2C] border border-[#383838]">
                {inv.role}
              </span>
            </div>
          ))}
        </div>

        {/* Link permissions & Copy link footer */}
        <div className="pt-3 border-t border-[#383838] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <Globe className="w-4 h-4 text-[#0D99FF] shrink-0" />
            <div>
              <span className="text-white font-medium">Anyone with the link</span>
              <span className="text-[#7E7E7E]"> can view and duplicate</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyLink}
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

