import { useState, useEffect, useRef } from 'react'
import {
  listProfiles, setActiveProfile,
  createProfile, updateProfile, deleteProfile,
  listCollection, createCollectionItem, updateCollectionItem, deleteCollectionItem,
} from '../lib/storage.js'
import { PRESETS, FRAMES, bakeCover, readFileAsDataURL, loadImage } from '../lib/imageProcessing.js'
import { IconUpload, IconX, IconMinus, IconPlus, IconReset, IconPen, IconTrash, IconPlus as IconAdd } from '../components/icons.jsx'
import SkullLogo from '../components/SkullLogo.jsx'

export default function Profile() {
  const [profiles, setProfiles] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showNewProfile, setShowNewProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [newName, setNewName] = useState('')
  const [newHandle, setNewHandle] = useState('')
  const [newBio, setNewBio] = useState('')
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [collection, setCollection] = useState(null)
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
  const [confirmDelProfile, setConfirmDelProfile] = useState(null)
  const previewRef = useRef(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef(null)
  const avatarInputRef = useRef(null)

  useEffect(() => { document.title = 'Profile — OneEyedSkullDesign' }, [])

  const loadProfiles = async () => {
    const p = await listProfiles()
    setProfiles(p)
    return p
  }

  const loadCollection = async (pid) => {
    setCollection(await listCollection(pid))
  }

  useEffect(() => {
    loadProfiles().then((p) => {
      const active = p[0]
      if (active) {
        setActiveId(active.id)
        fillProfile(active)
        loadCollection(active.id)
      }
    })
  }, [])

  const fillProfile = (p) => {
    setName(p.name || '')
    setHandle(p.handle || '')
    setBio(p.bio || '')
    setAvatar(p.avatar || null)
  }

  const switchProfile = async (id) => {
    setActiveId(id)
    await setActiveProfile(id)
    const p = profiles.find((x) => x.id === id)
    if (p) fillProfile(p)
    setEditingProfile(false)
    setCollection(null)
    await loadCollection(id)
  }

  const handleCreateProfile = async () => {
    if (!newName.trim()) return
    const created = await createProfile({
      name: newName.trim(),
      handle: newHandle.trim() || newName.trim().toLowerCase().replace(/\s+/g, '-'),
      bio: newBio.trim(),
      avatar: null,
    })
    await loadProfiles()
    setNewName(''); setNewHandle(''); setNewBio('')
    setShowNewProfile(false)
    switchProfile(created.id)
  }

  const handleSaveProfile = async () => {
    await updateProfile(activeId, { name, handle, bio, avatar })
    await loadProfiles()
    setEditingProfile(false)
  }

  const handleDeleteProfile = async (id) => {
    if (id === 'default') return
    await deleteProfile(id)
    const p = await loadProfiles()
    switchProfile(p[0].id)
    setConfirmDelProfile(null)
  }

  const handleAvatarUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setAvatar(await readFileAsDataURL(file))
  }

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    const dataUrl = await readFileAsDataURL(file)
    setSrc(dataUrl)
    const loaded = await loadImage(dataUrl)
    setImg(loaded)
    setZoom(1); setOffset({ x: 0, y: 0 }); setPreset('raw'); setFrame('bare')
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

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
    setSaving(true); setError('')
    try {
      const dataUrl = bakeCover({ img, zoom, offset, presetId: preset, frameId: frame, previewSize: previewRef.current?.clientWidth || 500 })
      const data = {
        imageUrl: dataUrl, title: title.trim(), artist: artist.trim(),
        year: year ? Number(year) : null,
        tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        notes: notes.trim(), filterApplied: preset, frameStyle: frame,
      }
      if (editingItem) await updateCollectionItem(activeId, editingItem.id, data)
      else await createCollectionItem(activeId, data)
      await loadCollection(activeId)
      resetUploadForm(); setShowUpload(false); setEditingItem(null)
    } catch (err) {
      setError(err.message?.includes('quota') ? 'Storage full.' : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  const handleDeleteItem = async (id) => {
    await deleteCollectionItem(activeId, id)
    await loadCollection(activeId)
    setConfirmDelete(null)
  }

  const resetUploadForm = () => {
    setSrc(null); setImg(null); setZoom(1); setOffset({ x: 0, y: 0 })
    setPreset('raw'); setFrame('bare'); setTitle(''); setArtist('')
    setYear(''); setTags(''); setNotes(''); setError('')
  }

  const startEditItem = (item) => {
    setEditingItem(item); setTitle(item.title); setArtist(item.artist)
    setYear(item.year || ''); setTags((item.tags || []).join(', '))
    setNotes(item.notes || ''); setPreset(item.filterApplied || 'raw')
    setFrame(item.frameStyle || 'bare'); setSrc(item.imageUrl)
    loadImage(item.imageUrl).then(setImg); setShowUpload(true)
  }

  const startNewUpload = () => { resetUploadForm(); setEditingItem(null); setShowUpload(true) }
  const cssFilter = PRESETS.find((p) => p.id === preset)?.css || 'none'

  if (!profiles || !activeId) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="skeleton mt-4 h-6 w-48 rounded" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide text-bone-50 sm:text-3xl">PROFILES</h1>
        <button onClick={() => setShowNewProfile(true)} className="flex items-center gap-2 rounded-full bg-venom-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-venom-400">
          <IconAdd size={14} /> New Profile
        </button>
      </div>

      <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scroll-thin">
        {profiles.map((p) => (
          <button key={p.id} onClick={() => switchProfile(p.id)} className={`relative flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 transition-all ${activeId === p.id ? 'border-venom-500 bg-symbiote-800 shadow-lg' : 'border-white/10 bg-symbiote-800/40 hover:border-white/25'}`}>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-symbiote-700">
              {p.avatar ? <img src={p.avatar} alt="" className="h-full w-full object-cover" /> : <SkullLogo size={24} className="opacity-40" />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-bone-100">{p.name}</p>
              <p className="text-xs text-bone-500">{p.isDefault ? 'Default' : 'Custom'}</p>
            </div>
            {activeId === p.id && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-venom-500" />}
          </button>
        ))}
      </div>

      <div className="relative rounded-xl border border-white/5 bg-symbiote-800/40 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="group relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-symbiote-700 cursor-pointer" onClick={() => avatarInputRef.current?.click()} role="button" tabIndex={0}>
              {avatar ? <img src={avatar} alt="Avatar" className="h-full w-full object-cover" /> : <SkullLogo size={48} className="opacity-30" />}
            </div>
            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 rounded-full bg-venom-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Change avatar">
              <IconPen size={12} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files[0])} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            {editingProfile ? (
              <div className="flex flex-col gap-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="field-input text-lg font-bold" />
                <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" className="field-input text-sm" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the world about your taste..." rows={2} className="field-input resize-none text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="rounded-md bg-venom-500 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-venom-400">Save Profile</button>
                  <button onClick={() => setEditingProfile(false)} className="rounded-md border border-white/15 px-4 py-2 text-xs text-bone-400 hover:text-bone-200">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl tracking-wide text-bone-50">{name || 'Your Profile'}</h2>
                {handle && <p className="mt-0.5 text-sm text-bone-500">@{handle}</p>}
                {bio && <p className="mt-2 text-sm text-bone-400">{bio}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setEditingProfile(true)} className="rounded-md border border-white/15 px-4 py-2 text-xs font-medium uppercase tracking-wider text-bone-400 hover:bg-symbiote-700 hover:text-bone-200">Edit Profile</button>
                  {!profiles.find((p) => p.id === activeId)?.isDefault && (
                    confirmDelProfile === activeId ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteProfile(activeId)} className="rounded-md bg-venom-500 px-4 py-2 text-xs font-semibold text-white">Confirm Delete</button>
                        <button onClick={() => setConfirmDelProfile(null)} className="rounded-md border border-white/15 px-4 py-2 text-xs text-bone-400">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelProfile(activeId)} className="rounded-md border border-venom-500/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-venom-400 hover:bg-venom-500/10">Delete Profile</button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between border-b border-white/5">
          <p className="pb-3 text-xs font-medium uppercase tracking-wider text-bone-500">Collection</p>
          <button onClick={startNewUpload} className="rounded-full bg-venom-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-venom-400">Create</button>
        </div>
        {collection === null ? (
          <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i}><div className="skeleton aspect-square rounded-lg" /><div className="skeleton mt-2 h-4 w-3/4 rounded" /></div>)}
          </div>
        ) : collection.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="animate-float mb-6 opacity-20"><SkullLogo size={80} /></div>
            <p className="font-display text-lg text-bone-500">Nothing here yet.</p>
            <p className="mt-2 text-sm text-bone-600">Upload your first cover for this profile.</p>
            <button onClick={startNewUpload} className="mt-6 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-venom-400">Upload Cover</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
            {collection.map((item, i) => (
              <div key={item.id} className="animate-rise group relative overflow-hidden rounded-lg border border-white/5 bg-symbiote-800/60 transition-all hover:-translate-y-1 hover:border-venom-500/40 hover:shadow-lg" style={{ animationDelay: `${i * 60}ms` }}>
                <img src={item.imageUrl} alt={item.title} className="block w-full" />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/85 via-black/20 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => startEditItem(item)} className="rounded-full bg-white/10 p-2 text-bone-100 backdrop-blur-sm hover:bg-venom-500"><IconPen size={16} /></button>
                  <button onClick={() => setConfirmDelete(item.id)} className={`rounded-full p-2 backdrop-blur-sm transition-colors ${confirmDelete === item.id ? 'bg-venom-500 text-white' : 'bg-white/10 text-bone-100 hover:bg-venom-500'}`}><IconTrash size={16} /></button>
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium text-bone-100">{item.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-bone-500">{item.artist}</p>
                </div>
                {confirmDelete === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteItem(item.id)} className="rounded-md bg-venom-500 px-4 py-2 text-xs font-semibold text-white">Delete</button>
                      <button onClick={() => setConfirmDelete(null)} className="rounded-md border border-white/15 px-4 py-2 text-xs text-bone-300">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewProfile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowNewProfile(false)}>
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-symbiote-900 p-6 animate-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl tracking-wide text-bone-50">NEW PROFILE</h3>
            <div className="mt-4 flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Name <span className="text-venom-400">*</span></span>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Profile name" className="field-input" autoFocus />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Handle</span>
                <input type="text" value={newHandle} onChange={(e) => setNewHandle(e.target.value)} placeholder="@handle (auto if empty)" className="field-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Bio</span>
                <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} placeholder="Short bio..." rows={2} className="field-input resize-none" />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={handleCreateProfile} disabled={!newName.trim()} className="flex-1 rounded-md bg-venom-500 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-venom-400 disabled:opacity-40">Create Profile</button>
              <button onClick={() => setShowNewProfile(false)} className="rounded-md border border-white/15 px-4 py-2.5 text-xs text-bone-400 hover:text-bone-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-xl border border-white/10 bg-symbiote-900 p-6 animate-pop lg:flex-row lg:gap-6">
            <button onClick={() => { setShowUpload(false); setEditingItem(null); resetUploadForm() }} className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-bone-300 hover:bg-venom-500 hover:text-white" aria-label="Close">
              <IconX size={18} />
            </button>

            <div className="flex flex-1 flex-col gap-4 lg:max-w-lg">
              <h2 className="font-display text-xl tracking-wide text-bone-50">{editingItem ? 'EDIT COVER' : 'NEW COVER'}</h2>
              {!src ? (
                <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileInputRef.current?.click()} className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors ${dragOver ? 'border-venom-500 bg-venom-500/5' : 'border-white/15 hover:border-venom-500/60'}`}>
                  <IconUpload size={48} className="text-bone-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-bone-300">Drop artwork here</p>
                    <p className="mt-1 text-xs text-bone-500">PNG / JPG / WEBP</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <>
                  <div ref={previewRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className="relative aspect-square w-full cursor-grab overflow-hidden rounded-xl border border-white/10 bg-symbiote-900 active:cursor-grabbing">
                    <img src={src} alt="Preview" draggable={false} className="absolute left-1/2 top-1/2 h-full w-full select-none object-contain" style={{ filter: cssFilter, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})` }} />
                    <button onClick={() => { setSrc(null); setImg(null) }} className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-bone-300 hover:bg-venom-500 hover:text-white"><IconX size={16} /></button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-symbiote-800/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-bone-500">Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p) => (
                        <button key={p.id} onClick={() => setPreset(p.id)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${preset === p.id ? 'border-venom-500 bg-venom-500 text-white' : 'border-white/15 text-bone-400 hover:text-bone-200'}`}>{p.name}</button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-bone-500">Frames</p>
                    <div className="flex flex-wrap gap-2">
                      {FRAMES.map((f) => (
                        <button key={f.id} onClick={() => setFrame(f.id)} className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${frame === f.id ? 'border-venom-500 bg-venom-500 text-white' : 'border-white/15 text-bone-400 hover:text-bone-200'}`}>{f.name}</button>
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
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Album Title <span className="text-venom-400">*</span></span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter album title" className="field-input" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Artist Name <span className="text-venom-400">*</span></span><input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Enter artist name" className="field-input" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Release Year</span><input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 1986" className="field-input" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Genre / Tags</span><input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="doom, analog, night drive" className="field-input" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-bone-500">Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Short description or notes..." rows={2} className="field-input resize-none" /></label>
              {error && <p className="text-sm text-venom-400">{error}</p>}
              <button onClick={handleSaveItem} disabled={!canSave || saving} className="flex items-center justify-center gap-2 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-venom-400 disabled:cursor-not-allowed disabled:opacity-40">
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

