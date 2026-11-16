import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [isOpen])

  // Handle native cancel event (Esc key)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onClose()
  }

  // Handle backdrop clicks
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current
    if (!dialog) return
    const rect = dialog.getBoundingClientRect()
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    if (!isInDialog) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClick}
      aria-labelledby="modal-dialog-title"
      className={`fixed inset-0 z-50 p-0 m-auto bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm w-full ${maxWidth} open:animate-in open:fade-in open:zoom-in-95`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h2 id="modal-dialog-title" className="text-base font-semibold text-zinc-100">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
