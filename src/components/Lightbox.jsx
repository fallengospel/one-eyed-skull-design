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
      className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm sm:p-8"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={cover.title}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl animate-pop sm:flex-row"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
          aria-label="Close"
        >
          <IconX size={18} style={{ color: 'var(--text-secondary)' }} />
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
            <h2 className="font-display text-xl tracking-wide sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {cover.title}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{cover.artist}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {cover.year && (
              <span className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {cover.year}
              </span>
            )}
            {cover.filterApplied && cover.filterApplied !== 'raw' && (
              <span className="rounded-full px-2.5 py-0.5 text-venom-400" style={{ backgroundColor: 'var(--accent-muted)' }}>
                {cover.filterApplied}
              </span>
            )}
            {cover.frameStyle && cover.frameStyle !== 'bare' && (
              <span className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {cover.frameStyle}
              </span>
            )}
          </div>

          {cover.tags && cover.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {cover.tags.map((tag) => (
                <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {cover.notes && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{cover.notes}</p>
          )}

          <div className="mt-auto flex items-center gap-2 pt-4 text-xs" style={{ color: 'var(--text-faint)' }}>
            <span>Pinned {created.toLocaleDateString()}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onEdit(cover); onClose() }}
              className="flex-1 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                confirmDelete
                  ? 'bg-venom-500 text-white'
                  : 'border hover:bg-venom-500 hover:text-white hover:border-venom-500'
              }`}
              style={!confirmDelete ? { borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' } : {}}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
