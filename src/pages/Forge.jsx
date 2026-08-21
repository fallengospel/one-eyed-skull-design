import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery.js'
import { createCover, updateCover, getCover, deleteCover } from '../lib/storage.js'
import { PRESETS, FRAMES, bakeCover, readFileAsDataURL, loadImage } from '../lib/imageProcessing.js'
import { IconUpload, IconX, IconMinus, IconPlus, IconReset } from '../components/icons.jsx'

export default function Forge() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editingId = searchParams.get('id')
  const { covers, refresh } = useGallery()

  const [src, setSrc] = useState(null)
  const [img, setImg] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [preset, setPreset] = useState('raw')
  const [frame, setFrame] = useState('bare')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [year, setYear] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const previewRef = useRef(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef(null)

  useEffect(() => { document.title = editingId ? 'Reforge Cover — OneEyedSkullDesign' : 'The Forge — OneEyedSkullDesign' }, [editingId])

  useEffect(() => {
    if (!editingId || !covers) return
    const cover = covers.find((c) => c.id === editingId)
    if (!cover) return
    setTitle(cover.title)
    setArtist(cover.artist)
    setYear(cover.year || '')
    setTags((cover.tags || []).join(', '))
    setNotes(cover.notes || '')
    setPreset(cover.filterApplied || 'raw')
    setFrame(cover.frameStyle || 'bare')
    setSrc(cover.imageUrl)
    loadImage(cover.imageUrl).then(setImg)
  }, [editingId, covers])

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    const dataUrl = await readFileAsDataURL(file)
    setSrc(dataUrl)
    const loaded = await loadImage(dataUrl)
    setImg(loaded)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setPreset('raw')
    setFrame('bare')
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onPointerDown = (e) => {
    if (!img) return
    panning.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!panning.current || !previewRef.current || !img) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset((prev) => {
      const P = previewRef.current.clientWidth
      const fit = Math.min(P / img.naturalWidth, P / img.naturalHeight)
      const s = zoom * fit
      const maxX = Math.max(0, (img.naturalWidth * s - P) / 2)
      const maxY = Math.max(0, (img.naturalHeight * s - P) / 2)
      return {
        x: Math.max(-maxX, Math.min(maxX, prev.x + dx)),
        y: Math.max(-maxY, Math.min(maxY, prev.y + dy)),
      }
    })
  }

  const onPointerUp = () => { panning.current = false }

  const canSave = src && title.trim() && artist.trim()

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    setError('')
    try {
      const dataUrl = bakeCover({
        img,
        zoom,
        offset,
        presetId: preset,
        frameId: frame,
        previewSize: previewRef.current?.clientWidth || 500,
      })
      const data = {
        imageUrl: dataUrl,
        title: title.trim(),
        artist: artist.trim(),
        year: year ? Number(year) : null,
        tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        notes: notes.trim(),
        filterApplied: preset,
        frameStyle: frame,
      }
      if (editingId) {
        await updateCover(editingId, data)
      } else {
        await createCover(data)
      }
      await refresh()
      navigate('/')
    } catch (err) {
      setError(err.message?.includes('quota') ? 'Storage is full — try a smaller image.' : 'Something went wrong. Try a smaller image.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingId) return
    await deleteCover(editingId)
    await refresh()
    navigate('/')
  }

  const clearImage = () => { setSrc(null); setImg(null); setZoom(1); setOffset({ x: 0, y: 0 }); setPreset('raw'); setFrame('bare') }

  const cssFilter = PRESETS.find((p) => p.id === preset)?.css || 'none'

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-5">
        {!src ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors ${
              dragOver ? 'border-venom-500 bg-venom-500/5' : 'border-white/15 hover:border-venom-500/60'
            }`}
          >
            <IconUpload size={48} className="text-bone-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-bone-300">Drop artwork here</p>
              <p className="mt-1 text-xs text-bone-500">PNG · JPG · WEBP — stays on your machine</p>
            </div>
            <button
              type="button"
              className="mt-2 rounded-md border border-white/15 bg-symbiote-800 px-4 py-2 text-xs font-medium uppercase tracking-wider text-bone-300 transition-colors hover:bg-symbiote-700"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div
              ref={previewRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className="relative aspect-square w-full cursor-grab overflow-hidden rounded-xl border border-white/10 bg-symbiote-900 active:cursor-grabbing"
            >
              <img
                src={src}
                alt="Preview"
                draggable={false}
                className="absolute left-1/2 top-1/2 h-full w-full select-none object-contain"
                style={{
                  filter: cssFilter,
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                }}
              />
              <button
                onClick={clearImage}
                className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-bone-300 backdrop-blur-sm transition-colors hover:bg-venom-500 hover:text-white"
                aria-label="Remove image"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-symbiote-800/60 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-bone-500">Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      preset === p.id
                        ? 'border-venom-500 bg-venom-500 text-white'
                        : 'border-white/15 text-bone-400 hover:text-bone-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-bone-500">Frames</p>
              <div className="flex flex-wrap gap-2">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrame(f.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      frame === f.id
                        ? 'border-venom-500 bg-venom-500 text-white'
                        : 'border-white/15 text-bone-400 hover:text-bone-200'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-bone-500">Zoom</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconMinus size={14} /></button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1"
                />
                <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconPlus size={14} /></button>
                <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconReset size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-3xl tracking-wide text-bone-50">
            {editingId ? 'REFORGE' : 'THE FORGE'}
          </h1>

          <Field label="Album Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter album title"
              className="field-input"
            />
          </Field>

          <Field label="Artist Name" required>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
              className="field-input"
            />
          </Field>

          <Field label="Release Year">
            <input
              type="number"
              min="1900"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 1986"
              className="field-input"
            />
          </Field>

          <Field label="Genre / Tags">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="doom, analog, night drive"
              className="field-input"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Short description or notes..."
              rows={3}
              className="field-input resize-none"
            />
          </Field>
        </div>

        {error && <p className="text-sm text-venom-400">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-venom-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving && <span className="spinner" />}
            {saving ? 'Pressing...' : editingId ? 'Update Cover' : 'Save to Gallery'}
          </button>
          {editingId && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-white/15 px-4 py-3 text-xs font-medium uppercase tracking-wider text-bone-400 transition-colors hover:border-venom-500 hover:text-venom-400"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {covers && covers.length > 0 && (
        <div className="col-span-full mt-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-bone-500">Recent Presses</h3>
          <div className="scroll-thin flex gap-3 overflow-x-auto pb-2">
            {covers.slice(0, 12).map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/forge?id=${c.id}`)}
                className={`group relative w-20 shrink-0 overflow-hidden rounded-md border transition-colors ${
                  editingId === c.id ? 'border-venom-500' : 'border-white/10 hover:border-white/30'
                }`}
                title={c.title}
              >
                <img src={c.imageUrl} alt={c.title} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">
        {label} {required && <span className="text-venom-400">*</span>}
      </span>
      {children}
    </label>
  )
}
