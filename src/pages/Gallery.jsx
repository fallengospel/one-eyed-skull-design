import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery.js'
import CoverCard from '../components/CoverCard.jsx'
import Lightbox from '../components/Lightbox.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { IconSearch } from '../components/icons.jsx'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A – Z' },
  { id: 'za', label: 'Z – A' },
]

export default function Gallery() {
  const { covers, refresh, remove } = useGallery()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [activeTags, setActiveTags] = useState(new Set())
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => { document.title = 'Collection — OneEyedSkullDesign' }, [])

  const allTags = useMemo(() => {
    if (!covers) return []
    const counts = {}
    covers.forEach((c) => (c.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [covers])

  const filtered = useMemo(() => {
    if (!covers) return null
    let list = [...covers]
    const q = search.toLowerCase().trim()
    if (q) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.artist.toLowerCase().includes(q) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    }
    if (activeTags.size > 0) {
      list = list.filter((c) => [...activeTags].every((t) => (c.tags || []).includes(t)))
    }
    if (sort === 'newest') list.sort((a, b) => b.createdAt - a.createdAt)
    else if (sort === 'oldest') list.sort((a, b) => a.createdAt - b.createdAt)
    else if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'za') list.sort((a, b) => b.title.localeCompare(a.title))
    return list
  }, [covers, search, sort, activeTags])

  const toggleTag = (tag) => {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  if (covers === null) {
    return (
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 2xl:columns-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-5 break-inside-avoid">
            <div className="skeleton h-48 rounded-lg" />
            <div className="mt-2 space-y-1.5 px-1">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (covers.length === 0) return <EmptyState />

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-bone-50 sm:text-4xl">
            COLLECTION
          </h1>
          <p className="mt-1 text-xs text-bone-500">{covers.length} cover{covers.length !== 1 && 's'}</p>
        </div>
        <button
          onClick={() => navigate('/forge')}
          className="rounded-full bg-venom-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-venom-400"
        >
          + New Cover
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
          <input
            type="text"
            placeholder="Search by title or artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-bone-100 placeholder:text-bone-500/50 focus:border-venom-500/60 focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-full border border-white/10 bg-white/5 py-2 pl-4 pr-8 text-sm text-bone-300 focus:border-venom-500/60 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bone-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition-colors ${
                activeTags.has(tag)
                  ? 'border-venom-500 bg-venom-500 text-white'
                  : 'border-white/15 text-bone-500 hover:text-bone-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-lg text-bone-500">No covers match your search.</p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 2xl:columns-4">
          {filtered.map((cover, i) => (
            <CoverCard
              key={cover.id}
              cover={cover}
              index={i}
              onView={setLightbox}
              onEdit={(c) => navigate(`/forge?id=${c.id}`)}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <Lightbox
          cover={lightbox}
          onClose={() => setLightbox(null)}
          onEdit={(c) => { setLightbox(null); navigate(`/forge?id=${c.id}`) }}
          onDelete={remove}
        />
      )}
    </>
  )
}
