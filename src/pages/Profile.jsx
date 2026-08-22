import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile, createCollectionItem, updateCollectionItem, deleteCollectionItem, listCollection } from '../lib/storage.js'
import { PRESETS, FRAMES, bakeCover, readFileAsDataURL, loadImage } from '../lib/imageProcessing.js'
import { IconUpload, IconX, IconMinus, IconPlus, IconReset, IconPen, IconTrash } from '../components/icons.jsx'
import SkullLogo from '../components/SkullLogo.jsx'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)

  const [collection, setCollection] = useState(null)
  const [activeTab, setActiveTab] = useState('created')
  const [showUpload, setShowUpload] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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
  const [confirmDelete, setConfirmDelete] = useState(null)

  const previewRef = useRef(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  useEffect(() => { document.title = 'Profile — OneEyedSkullDesign' }, [])

  useEffect(() => {
    getProfile().then((p) => {
      if (p) {
        setProfile(p)
        setName(p.name || '')
        setHandle(p.handle || '')
        setBio(p.bio || '')
        setAvatar(p.avatar || null)
      }
    })
    listCollection().then(setCollection)
  }, [])

  const handleSaveProfile = async () => {
    const updated = await saveProfile({ name, handle, bio, avatar })
    setProfile(updated)
    setEditingProfile(false)
  }

  const handleAvatarUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const dataUrl = await readFileAsDataURL(file)
    setAvatar(dataUrl)
  }

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
    handleFile(e.dataTransfer.files[0])
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

  const handleSaveItem = async () => {
    if (!canSave || saving) return
    setSaving(true)
    setError('')
    try {
      const dataUrl = bakeCover({
        img, zoom, offset,
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
      if (editingItem) {
        await updateCollectionItem(editingItem.id, data)
      } else {
        await createCollectionItem(data)
      }
      setCollection(await listCollection())
      resetUploadForm()
      setShowUpload(false)
      setEditingItem(null)
    } catch (err) {
      setError(err.message?.includes('quota') ? 'Storage is full — try a smaller image.' : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (id) => {
    await deleteCollectionItem(id)
    setCollection(await listCollection())
    setConfirmDelete(null)
  }

  const resetUploadForm = () => {
    setSrc(null)
    setImg(null)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setPreset('raw')
    setFrame('bare')
    setTitle('')
    setArtist('')
    setYear('')
    setTags('')
    setNotes('')
    setError('')
  }

  const startEditItem = (item) => {
    setEditingItem(item)
    setTitle(item.title)
    setArtist(item.artist)
    setYear(item.year || '')
    setTags((item.tags || []).join(', '))
    setNotes(item.notes || '')
    setPreset(item.filterApplied || 'raw')
    setFrame(item.frameStyle || 'bare')
    setSrc(item.imageUrl)
    loadImage(item.imageUrl).then(setImg)
    setShowUpload(true)
  }

  const startNewUpload = () => {
    resetUploadForm()
    setEditingItem(null)
    setShowUpload(true)
  }

  const cssFilter = PRESETS.find((p) => p.id === preset)?.css || 'none'

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="skeleton mt-4 h-6 w-48 rounded" />
        <div className="skeleton mt-2 h-4 w-32 rounded" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative rounded-xl border border-white/5 bg-symbiote-800/40 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="group relative shrink-0">
            <div
              className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-symbiote-700"
              onClick={() => avatarInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <SkullLogo size={48} className="opacity-30" />
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-venom-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Change avatar"
            >
              <IconPen size={12} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files[0])}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            {editingProfile ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Display name"
                  className="field-input text-lg font-bold"
                />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@handle"
                  className="field-input text-sm"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about your taste..."
                  rows={2}
                  className="field-input resize-none text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="rounded-md bg-venom-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-venom-400"
                  >
                    Save Profile
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="rounded-md border border-white/15 px-4 py-2 text-xs text-bone-400 hover:text-bone-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-display text-2xl tracking-wide text-bone-50 sm:text-3xl">
                  {name || 'Your Profile'}
                </h1>
                {handle && <p className="mt-0.5 text-sm text-bone-500">@{handle}</p>}
                {bio && <p className="mt-2 text-sm text-bone-400">{bio}</p>}
                <button
                  onClick={() => setEditingProfile(true)}
                  className="mt-3 rounded-md border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-bone-400 transition-colors hover:bg-symbiote-700 hover:text-bone-200"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between border-b border-white/5">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-5 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'created'
                  ? 'border-b-2 border-venom-500 text-bone-100'
                  : 'text-bone-500 hover:text-bone-300'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-5 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
                activeTab === 'saved'
                  ? 'border-b-2 border-venom-500 text-bone-100'
                  : 'text-bone-500 hover:text-bone-300'
              }`}
            >
              Saved
            </button>
          </div>
          <button
            onClick={startNewUpload}
            className="rounded-full bg-venom-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-venom-400"
          >
            Create
          </button>
        </div>

        {collection === null ? (
          <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton aspect-square rounded-lg" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : collection.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="animate-float mb-6 opacity-20">
              <SkullLogo size={80} />
            </div>
            <p className="font-display text-lg text-bone-500">Nothing here yet.</p>
            <p className="mt-2 text-sm text-bone-600">Upload your first album cover to get started.</p>
            <button
              onClick={startNewUpload}
              className="mt-6 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-venom-400"
            >
              Upload Cover
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
            {collection.map((item, i) => (
              <div
                key={item.id}
                className="animate-rise group relative overflow-hidden rounded-lg border border-white/5 bg-symbiote-800/60 transition-all hover:-translate-y-1 hover:border-venom-500/40 hover:shadow-lg"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <img src={item.imageUrl} alt={item.title} className="block w-full" />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/20 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEditItem(item)}
                    className="rounded-full bg-white/10 p-2 text-bone-100 backdrop-blur-sm transition-colors hover:bg-venom-500"
                    aria-label="Edit"
                  >
                    <IconPen size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className={`rounded-full p-2 backdrop-blur-sm transition-colors ${
                      confirmDelete === item.id
                        ? 'bg-venom-500 text-white'
                        : 'bg-white/10 text-bone-100 hover:bg-venom-500'
                    }`}
                    aria-label="Delete"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium text-bone-100">{item.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-bone-500">{item.artist}</p>
                </div>
                {confirmDelete === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="rounded-md bg-venom-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-md border border-white/15 px-4 py-2 text-xs text-bone-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-xl border border-white/10 bg-symbiote-900 p-6 animate-pop lg:flex-row lg:gap-6">
            <button
              onClick={() => { setShowUpload(false); setEditingItem(null); resetUploadForm() }}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-bone-300 hover:bg-venom-500 hover:text-white"
              aria-label="Close"
            >
              <IconX size={18} />
            </button>

            <div className="flex flex-1 flex-col gap-4 lg:max-w-lg">
              <h2 className="font-display text-xl tracking-wide text-bone-50">
                {editingItem ? 'EDIT COVER' : 'NEW COVER'}
              </h2>

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
                    <p className="mt-1 text-xs text-bone-500">PNG · JPG · WEBP</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <>
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
                      onClick={() => { setSrc(null); setImg(null) }}
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-bone-300 hover:bg-venom-500 hover:text-white"
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

                    <div className="flex items-center gap-3">
                      <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconMinus size={14} /></button>
                      <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
                      <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconPlus size={14} /></button>
                      <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} className="rounded-full border border-white/15 p-1.5 text-bone-400 hover:text-bone-200"><IconReset size={14} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-4 lg:mt-0">
              <Field label="Album Title" required>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter album title" className="field-input" />
              </Field>
              <Field label="Artist Name" required>
                <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Enter artist name" className="field-input" />
              </Field>
              <Field label="Release Year">
                <input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 1986" className="field-input" />
              </Field>
              <Field label="Genre / Tags">
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="doom, analog, night drive" className="field-input" />
              </Field>
              <Field label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Short description or notes..." rows={2} className="field-input resize-none" />
              </Field>

              {error && <p className="text-sm text-venom-400">{error}</p>}

              <button
                onClick={handleSaveItem}
                disabled={!canSave || saving}
                className="flex items-center justify-center gap-2 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-venom-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving && <span className="spinner" />}
                {saving ? 'Saving...' : editingItem ? 'Update Cover' : 'Save to Collection'}
              </button>
            </div>
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
