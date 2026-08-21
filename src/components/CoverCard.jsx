import { useState } from 'react'
import { IconEye, IconPen, IconTrash } from './icons.jsx'

export default function CoverCard({ cover, index, onView, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(cover.id)
  }

  return (
    <article
      className="animate-rise group mb-5 break-inside-avoid cursor-pointer overflow-hidden rounded-lg border border-white/5 bg-symbiote-800/60 transition-all duration-200 hover:-translate-y-1 hover:rotate-[0.4deg] hover:border-venom-500/40 hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]"
      style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
      onClick={() => onView(cover)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onView(cover) }}
    >
      <div className="relative overflow-hidden">
        <img
          src={cover.imageUrl}
          alt={cover.title}
          loading="lazy"
          className="block w-full"
        />

        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/20 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onView(cover) }}
              className="rounded-full bg-white/10 p-2 text-bone-100 backdrop-blur-sm transition-colors hover:bg-venom-500"
              aria-label="View"
            >
              <IconEye size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(cover) }}
              className="rounded-full bg-white/10 p-2 text-bone-100 backdrop-blur-sm transition-colors hover:bg-venom-500"
              aria-label="Edit"
            >
              <IconPen size={16} />
            </button>
          </div>
          <button
            onClick={handleDelete}
            className={`rounded-full p-2 backdrop-blur-sm transition-colors ${
              confirmDelete
                ? 'bg-venom-500 text-white'
                : 'bg-white/10 text-bone-100 hover:bg-venom-500'
            }`}
            aria-label={confirmDelete ? 'Confirm delete' : 'Delete'}
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-bone-100">{cover.title}</h3>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="truncate text-xs text-bone-500">{cover.artist}</span>
          {cover.year && (
            <span className="ml-2 shrink-0 text-xs tabular-nums text-bone-500">{cover.year}</span>
          )}
        </div>
      </div>
    </article>
  )
}
