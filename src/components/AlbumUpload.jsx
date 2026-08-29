import { useState, useRef } from 'react'
import { IconX, IconUpload, IconTrash, IconPlus } from './icons.jsx'
import { readFileAsDataURL } from '../lib/imageProcessing.js'

const MAX_IMAGES = 15

export default function AlbumUpload({ onSave, onClose, existingAlbum = null }) {
  const [title, setTitle] = useState(existingAlbum?.title || '')
  const [artist, setArtist] = useState(existingAlbum?.artist || '')
  const [year, setYear] = useState(existingAlbum?.year || '')
  const [tags, setTags] = useState(existingAlbum?.tags?.join(', ') || '')
  const [notes, setNotes] = useState(existingAlbum?.notes || '')
  const [images, setImages] = useState(existingAlbum?.images || [])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const canSave = title.trim() && artist.trim() && images.length > 0

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) return

    setUploading(true)
    const filesToProcess = Array.from(files).slice(0, remaining)
    const newImages = []

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await readFileAsDataURL(file)
      newImages.push({
        id: crypto.randomUUID(),
        src: dataUrl,
        name: file.name,
      })
    }

    setImages((prev) => [...prev, ...newImages])
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      title: title.trim(),
      artist: artist.trim(),
      year: year ? Number(year) : null,
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      notes: notes.trim(),
      images,
    })
  }

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" 
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div 
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl shadow-2xl animate-pop" 
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
          <div>
            <h2 className="font-display text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>
              {existingAlbum ? 'Edit Album' : 'Create Album'}
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {images.length} / {MAX_IMAGES} images
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
            aria-label="Close"
          >
            <IconX size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          <div className="flex-1">
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => images.length < MAX_IMAGES && fileInputRef.current?.click()}
              className={`flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors ${
                images.length >= MAX_IMAGES ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              style={{ 
                borderColor: dragOver ? 'var(--accent)' : 'var(--border-primary)',
                backgroundColor: dragOver ? 'var(--accent-muted)' : 'var(--bg-secondary)'
              }}
            >
              {uploading ? (
                <div className="spinner" />
              ) : (
                <>
                  <IconUpload size={32} style={{ color: 'var(--text-muted)' }} />
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {images.length >= MAX_IMAGES ? 'Maximum images reached' : 'Drop images here or click to upload'}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      JPEG, PNG, GIF, WebP — Max {MAX_IMAGES} images
                    </p>
                  </div>
                </>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp" 
                multiple 
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)} 
              />
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-primary)' }}>
                    <img src={img.src} alt={img.name} className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-venom-500"
                      aria-label="Remove image"
                    >
                      <IconTrash size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-center text-[9px] text-white/80 truncate">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:w-72">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Album Title <span className="text-venom-400">*</span>
              </span>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Album title" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Artist <span className="text-venom-400">*</span>
              </span>
              <input 
                type="text" 
                value={artist} 
                onChange={(e) => setArtist(e.target.value)} 
                placeholder="Artist name" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Year</span>
              <input 
                type="number" 
                min="1900" 
                max="2100" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                placeholder="e.g. 1986" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Tags</span>
              <input 
                type="text" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)} 
                placeholder="doom, analog, night drive" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Notes</span>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Album description or notes..." 
                rows={3} 
                className="field-input resize-none" 
              />
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t px-6 py-4" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
          <button 
            onClick={onClose} 
            className="rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-80" 
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={!canSave}
            className="rounded-lg bg-theme-accent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {existingAlbum ? 'Update Album' : 'Create Album'}
          </button>
        </div>
      </div>
    </div>
  )
}
