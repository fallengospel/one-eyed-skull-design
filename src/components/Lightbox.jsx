import { useState, useEffect, useRef } from 'react'
import { IconX } from './icons.jsx'

export default function Lightbox({ cover, onClose, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(cover.id)
    onClose()
  }

  const created = new Date(cover.createdAt)

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={cover.title}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/10 bg-symbiote-900 shadow-2xl sm:flex-row animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-1.5 text-bone-300 transition-colors hover:bg-venom-500 hover:text-white"
          aria-label="Close"
        >
          <IconX size={18} />
        </button>

        <div className="flex-shrink-0 bg-black sm:w-1/2">
          <img
            src={cover.imageUrl}
            alt={cover.title}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl tracking-wide text-bone-50 sm:text-2xl">
              {cover.title}
            </h2>
            <p className="mt-1 text-sm text-bone-300">{cover.artist}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-bone-500">
            {cover.year && <span className="rounded-full border border-white/10 px-2.5 py-0.5">{cover.year}</span>}
            {cover.filterApplied && cover.filterApplied !== 'raw' && (
              <span className="rounded-full border border-venom-500/30 px-2.5 py-0.5 text-venom-400">
                {cover.filterApplied}
              </span>
            )}
            {cover.frameStyle && cover.frameStyle !== 'bare' && (
              <span className="rounded-full border border-white/10 px-2.5 py-0.5">{cover.frameStyle}</span>
            )}
          </div>

          {cover.tags && cover.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cover.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-symbiote-700 px-2.5 py-0.5 text-xs text-bone-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {cover.notes && (
            <p className="text-sm leading-relaxed text-bone-500">{cover.notes}</p>
          )}

          <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-bone-600">
            <span>Pinned {created.toLocaleDateString()}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onEdit(cover); onClose() }}
              className="flex-1 rounded-md border border-white/10 bg-symbiote-800 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-bone-300 transition-colors hover:bg-symbiote-700 hover:text-bone-100"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className={`flex-1 rounded-md px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                confirmDelete
                  ? 'bg-venom-500 text-white'
                  : 'border border-white/10 bg-symbiote-800 text-bone-300 hover:bg-symbiote-700 hover:text-bone-100'
              }`}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
