import { useState, useEffect, useRef } from 'react'
import {
  listProfiles, setActiveProfile,
  updateProfile,
  listCollection, createCollectionItem, updateCollectionItem, deleteCollectionItem,
  listAlbums, createAlbum, updateAlbum, deleteAlbum,
} from '../lib/storage.js'
import { PRESETS, FRAMES, bakeCover, readFileAsDataURL, loadImage } from '../lib/imageProcessing.js'
import { IconUpload, IconX, IconMinus, IconPlus, IconReset, IconPen, IconTrash, IconEye } from '../components/icons.jsx'
import SkullLogo from '../components/SkullLogo.jsx'
import ProfileSettings from '../components/ProfileSettings.jsx'
import AlbumUpload from '../components/AlbumUpload.jsx'

export default function Profile() {
  const [profiles, setProfiles] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarOffset, setAvatarOffset] = useState(50)
  const [avatarZoom, setAvatarZoom] = useState(1)
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [coverOffset, setCoverOffset] = useState(50)
  const [coverZoom, setCoverZoom] = useState(1)
  const [collection, setCollection] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
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
  const [viewItem, setViewItem] = useState(null)
  const [albums, setAlbums] = useState(null)
  const [showAlbumUpload, setShowAlbumUpload] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [viewAlbum, setViewAlbum] = useState(null)
  const [confirmDeleteAlbum, setConfirmDeleteAlbum] = useState(null)
  const previewRef = useRef(null)
  const panning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const fileInputRef = useRef(null)

  useEffect(() => { document.title = 'The Vault — OneEyedSkullDesign' }, [])

  const loadProfiles = async () => {
    const p = await listProfiles()
    setProfiles(p)
    return p
  }

  const loadCollection = async (pid) => {
    setCollection(await listCollection(pid))
  }

  const loadAlbums = async (pid) => {
    setAlbums(await listAlbums(pid))
  }

  useEffect(() => {
    loadProfiles().then((p) => {
      const active = p[0]
      if (active) {
        setActiveId(active.id)
        fillProfile(active)
        loadCollection(active.id)
        loadAlbums(active.id)
      }
    })
  }, [])

  const fillProfile = (p) => {
    setName(p.name || '')
    setHandle(p.handle || '')
    setBio(p.bio || '')
    setAvatar(p.avatar || null)
    setAvatarOffset(p.avatarOffset || 50)
    setAvatarZoom(p.avatarZoom || 1)
    setCoverPhoto(p.coverPhoto || null)
    setCoverOffset(p.coverOffset || 50)
    setCoverZoom(p.coverZoom || 1)
  }

  const switchProfile = async (id) => {
    setActiveId(id)
    await setActiveProfile(id)
    const p = profiles.find((x) => x.id === id)
    if (p) fillProfile(p)
    setEditingProfile(false)
    setCollection(null)
    setAlbums(null)
    await loadCollection(id)
    await loadAlbums(id)
  }

  const handleSaveProfile = async () => {
    await updateProfile(activeId, { name, handle, bio, avatar, avatarOffset, coverPhoto, coverOffset })
    await loadProfiles()
  }

  const handleSaveSettings = async (data) => {
    setName(data.name)
    setHandle(data.handle)
    setBio(data.bio)
    setAvatar(data.avatar)
    setAvatarOffset(data.avatarOffset)
    setAvatarZoom(data.avatarZoom)
    setCoverPhoto(data.coverPhoto)
    setCoverOffset(data.coverOffset)
    setCoverZoom(data.coverZoom)
    await updateProfile(activeId, data)
    await loadProfiles()
    setShowSettings(false)
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

  const handleSaveAlbum = async (data) => {
    if (editingAlbum) {
      await updateAlbum(editingAlbum.id, data)
    } else {
      await createAlbum(activeId, data)
    }
    await loadAlbums(activeId)
    setShowAlbumUpload(false)
    setEditingAlbum(null)
  }

  const handleDeleteAlbum = async (id) => {
    await deleteAlbum(id)
    await loadAlbums(activeId)
    setConfirmDeleteAlbum(null)
  }

  if (!profiles || !activeId) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="skeleton mt-4 h-6 w-48 rounded" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 rounded-2xl border p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:p-8" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
        <div className="group relative shrink-0">
          <div 
            className="relative h-36 w-36 overflow-hidden rounded-full" 
            style={{ backgroundColor: 'var(--bg-secondary)', border: '4px solid var(--bg-card)' }}
          >
            {avatar ? (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="absolute left-1/2 w-auto"
                style={{ 
                  height: `${200 * avatarZoom}%`,
                  top: `calc(-50% + ${avatarOffset}% - 25%)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <SkullLogo size={48} style={{ opacity: 0.3 }} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowSettings(true)} 
            className="absolute bottom-0 right-0 rounded-full bg-theme-accent p-2 text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110" 
            aria-label="Edit profile"
          >
            <IconPen size={14} />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-2xl tracking-wide sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            {name || 'Your Profile'}
          </h1>
          {handle && (
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>@{handle}</p>
          )}
          {bio && (
            <p className="mt-3 text-sm leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              {bio}
            </p>
          )}
          <button 
            onClick={() => setShowSettings(true)} 
            className="mt-4 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors hover:opacity-80" 
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
          >
            Edit Profile
          </button>
        </div>

        <div className="group relative shrink-0 sm:ml-auto">
          <div 
            className="relative w-full overflow-hidden rounded-xl sm:w-80" 
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', aspectRatio: '5 / 3' }}
          >
            {coverPhoto ? (
              <img 
                src={coverPhoto} 
                alt="Cover" 
                className="absolute left-1/2 w-auto"
                style={{ 
                  height: `${200 * coverZoom}%`,
                  top: `calc(-50% + ${coverOffset}% - 25%)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <div 
                className="flex h-full w-full cursor-pointer items-center justify-center"
                onClick={() => setShowSettings(true)}
              >
                <div className="text-center">
                  <IconUpload size={20} style={{ color: 'var(--text-muted)' }} className="mx-auto" />
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>Add cover photo</p>
                </div>
              </div>
            )}
            <button 
              onClick={() => setShowSettings(true)} 
              className="absolute right-2 top-2 rounded-full p-1.5 opacity-0 transition-all duration-200 hover:scale-110 group-hover:opacity-100" 
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
              aria-label="Edit cover"
            >
              <IconPen size={12} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <p className="pb-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Collection
            {collection && collection.length > 0 && (
              <span className="ml-2" style={{ color: 'var(--text-faint)' }}>({collection.length})</span>
            )}
          </p>
          <button 
            onClick={startNewUpload} 
            className="flex items-center gap-2 rounded-lg bg-theme-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
          >
            <IconUpload size={14} />
            Create
          </button>
        </div>

        {collection === null ? (
          <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton mt-2 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : collection.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="animate-float mb-6 opacity-20">
              <SkullLogo size={80} />
            </div>
            <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>Nothing here yet.</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-faint)' }}>
              Upload your first cover to get started.
            </p>
            <button 
              onClick={startNewUpload} 
              className="mt-6 rounded-lg bg-theme-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
            >
              Upload Cover
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 lg:grid-cols-4">
            {collection.map((item, i) => (
              <div 
                key={item.id} 
                className="animate-rise group relative overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-theme-lg" 
                style={{ 
                  animationDelay: `${i * 60}ms`,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="block w-full transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                    <button 
                      onClick={() => setViewItem(item)} 
                      className="rounded-full bg-white/90 p-2.5 text-symbiote-900 transition-transform hover:scale-110"
                    >
                      <IconEye size={16} />
                    </button>
                    <button 
                      onClick={() => startEditItem(item)} 
                      className="rounded-full bg-white/90 p-2.5 text-symbiote-900 transition-transform hover:scale-110"
                    >
                      <IconPen size={16} />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(item.id)} 
                      className={`rounded-full p-2.5 transition-all ${confirmDelete === item.id ? 'bg-venom-500 text-white' : 'bg-white/90 text-symbiote-900 hover:bg-venom-500 hover:text-white'}`}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>{item.artist}</p>
                </div>
                {confirmDelete === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteItem(item.id)} 
                        className="rounded-lg bg-venom-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(null)} 
                        className="rounded-lg border px-4 py-2 text-xs" 
                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
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

      <div className="mt-10">
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <p className="pb-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Albums
            {albums && albums.length > 0 && (
              <span className="ml-2" style={{ color: 'var(--text-faint)' }}>({albums.length})</span>
            )}
          </p>
          <button 
            onClick={() => { setEditingAlbum(null); setShowAlbumUpload(true) }}
            className="flex items-center gap-2 rounded-lg bg-theme-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
          >
            <IconUpload size={14} />
            Create Album
          </button>
        </div>

        {albums === null ? (
          <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton mt-2 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="animate-float mb-6 opacity-20">
              <SkullLogo size={80} />
            </div>
            <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>No albums yet.</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-faint)' }}>
              Create your first album to organize multiple covers.
            </p>
            <button 
              onClick={() => { setEditingAlbum(null); setShowAlbumUpload(true) }}
              className="mt-6 rounded-lg bg-theme-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
            >
              Create Album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, i) => (
              <div 
                key={album.id} 
                className="animate-rise group overflow-hidden rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-theme-lg" 
                style={{ 
                  animationDelay: `${i * 60}ms`,
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="relative grid grid-cols-2 gap-0.5 p-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {album.images.slice(0, 4).map((img, j) => (
                    <div key={img.id} className="aspect-square overflow-hidden">
                      <img src={img.src} alt={img.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                  {album.images.length < 4 && Array.from({ length: 4 - album.images.length }).map((_, j) => (
                    <div key={`empty-${j}`} className="aspect-square flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)' }}>
                      <IconUpload size={16} style={{ color: 'var(--text-faint)' }} />
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                    <button 
                      onClick={() => setViewAlbum(album)} 
                      className="rounded-full bg-white/90 p-2.5 text-symbiote-900 transition-transform hover:scale-110"
                    >
                      <IconEye size={16} />
                    </button>
                    <button 
                      onClick={() => { setEditingAlbum(album); setShowAlbumUpload(true) }}
                      className="rounded-full bg-white/90 p-2.5 text-symbiote-900 transition-transform hover:scale-110"
                    >
                      <IconPen size={16} />
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteAlbum(album.id)} 
                      className={`rounded-full p-2.5 transition-all ${confirmDeleteAlbum === album.id ? 'bg-venom-500 text-white' : 'bg-white/90 text-symbiote-900 hover:bg-venom-500 hover:text-white'}`}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{album.title}</h3>
                  <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-muted)' }}>{album.artist}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {album.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {tag}
                      </span>
                    ))}
                    {album.images.length > 0 && (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                        {album.images.length} images
                      </span>
                    )}
                  </div>
                </div>
                {confirmDeleteAlbum === album.id && (
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteAlbum(album.id)} 
                        className="rounded-lg bg-venom-500 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteAlbum(null)} 
                        className="rounded-lg border px-4 py-2 text-xs" 
                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
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

      {viewItem && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" 
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setViewItem(null)}
        >
          <div 
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl animate-pop lg:flex-row" 
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewItem(null)} 
              className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
              aria-label="Close"
            >
              <IconX size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>

            <div className="flex-shrink-0 bg-black sm:w-1/2">
              <img src={viewItem.imageUrl} alt={viewItem.title} className="h-full w-full object-contain" />
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
              <div>
                <h2 className="font-display text-xl tracking-wide sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {viewItem.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{viewItem.artist}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {viewItem.year && (
                  <span className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {viewItem.year}
                  </span>
                )}
                {viewItem.filterApplied && viewItem.filterApplied !== 'raw' && (
                  <span className="rounded-full px-2.5 py-0.5 text-venom-400" style={{ backgroundColor: 'var(--accent-muted)' }}>
                    {viewItem.filterApplied}
                  </span>
                )}
                {viewItem.frameStyle && viewItem.frameStyle !== 'bare' && (
                  <span className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    {viewItem.frameStyle}
                  </span>
                )}
              </div>

              {viewItem.tags && viewItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {viewItem.tags.map((tag) => (
                    <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {viewItem.notes && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{viewItem.notes}</p>
              )}

              <div className="mt-auto flex items-center gap-2 pt-4 text-xs" style={{ color: 'var(--text-faint)' }}>
                <span>Added {new Date(viewItem.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { startEditItem(viewItem); setViewItem(null) }}
                  className="flex-1 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => { setConfirmDelete(viewItem.id); setViewItem(null) }}
                  className="flex-1 rounded-lg border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-venom-500 hover:text-white hover:border-venom-500"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl shadow-2xl animate-pop lg:flex-row lg:gap-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <button 
              onClick={() => { setShowUpload(false); setEditingItem(null); resetUploadForm() }} 
              className="absolute right-4 top-4 z-10 rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
              aria-label="Close"
            >
              <IconX size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>

            <div className="flex flex-1 flex-col gap-4 p-6 lg:max-w-lg">
              <h2 className="font-display text-xl tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {editingItem ? 'EDIT COVER' : 'NEW COVER'}
              </h2>
              {!src ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} 
                  onDragLeave={() => setDragOver(false)} 
                  onDrop={onDrop} 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors"
                  style={{ 
                    borderColor: dragOver ? 'var(--accent)' : 'var(--border-primary)',
                    backgroundColor: dragOver ? 'var(--accent-muted)' : 'var(--bg-secondary)'
                  }}
                >
                  <IconUpload size={48} style={{ color: 'var(--text-muted)' }} />
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Drop artwork here</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>PNG / JPG / WEBP</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              ) : (
                <>
                  <div 
                    ref={previewRef} 
                    onPointerDown={onPointerDown} 
                    onPointerMove={onPointerMove} 
                    onPointerUp={onPointerUp} 
                    className="relative aspect-square w-full cursor-grab overflow-hidden rounded-xl active:cursor-grabbing"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                  >
                    <img 
                      src={src} 
                      alt="Preview" 
                      draggable={false} 
                      className="absolute left-1/2 top-1/2 h-full w-full select-none object-contain" 
                      style={{ filter: cssFilter, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})` }} 
                    />
                    <button 
                      onClick={() => { setSrc(null); setImg(null) }} 
                      className="absolute right-3 top-3 rounded-full p-1.5 transition-colors hover:bg-venom-500 hover:text-white"
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p) => (
                        <button 
                          key={p.id} 
                          onClick={() => setPreset(p.id)} 
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${preset === p.id ? 'bg-theme-accent border-theme-accent text-white' : 'hover:text-theme-text'}`}
                          style={preset !== p.id ? { borderColor: 'var(--border-primary)', color: 'var(--text-muted)' } : {}}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Frames</p>
                    <div className="flex flex-wrap gap-2">
                      {FRAMES.map((f) => (
                        <button 
                          key={f.id} 
                          onClick={() => setFrame(f.id)} 
                          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${frame === f.id ? 'bg-theme-accent border-theme-accent text-white' : 'hover:text-theme-text'}`}
                          style={frame !== f.id ? { borderColor: 'var(--border-primary)', color: 'var(--text-muted)' } : {}}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="rounded-full border p-1.5 transition-colors hover:text-theme-text" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                        <IconMinus size={14} />
                      </button>
                      <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
                      <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="rounded-full border p-1.5 transition-colors hover:text-theme-text" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                        <IconPlus size={14} />
                      </button>
                      <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }} className="rounded-full border p-1.5 transition-colors hover:text-theme-text" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                        <IconReset size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-1 flex-col gap-4 p-6 lg:mt-0">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Album Title <span className="text-venom-400">*</span>
                </span>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter album title" className="field-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Artist Name <span className="text-venom-400">*</span>
                </span>
                <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Enter artist name" className="field-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Release Year</span>
                <input type="number" min="1900" max="2100" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 1986" className="field-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Genre / Tags</span>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="doom, analog, night drive" className="field-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Notes</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Short description or notes..." rows={2} className="field-input resize-none" />
              </label>
              {error && <p className="text-sm text-venom-400">{error}</p>}
              <button 
                onClick={handleSaveItem} 
                disabled={!canSave || saving} 
                className="flex items-center justify-center gap-2 rounded-lg bg-theme-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving && <span className="spinner" />}
                {saving ? 'Saving...' : editingItem ? 'Update Cover' : 'Save to Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <ProfileSettings
          profile={{ name, handle, bio, avatar, avatarOffset, avatarZoom, coverPhoto, coverOffset, coverZoom }}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showAlbumUpload && (
        <AlbumUpload
          existingAlbum={editingAlbum}
          onSave={handleSaveAlbum}
          onClose={() => { setShowAlbumUpload(false); setEditingAlbum(null) }}
        />
      )}

      {viewAlbum && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" 
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setViewAlbum(null)}
        >
          <div 
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl shadow-2xl animate-pop" 
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
              <div>
                <h2 className="font-display text-xl tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {viewAlbum.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {viewAlbum.artist} {viewAlbum.year && `• ${viewAlbum.year}`}
                </p>
              </div>
              <button 
                onClick={() => setViewAlbum(null)} 
                className="rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
                aria-label="Close"
              >
                <IconX size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <div className="p-6">
              {viewAlbum.tags && viewAlbum.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {viewAlbum.tags.map((tag) => (
                    <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {viewAlbum.notes && (
                <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{viewAlbum.notes}</p>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {viewAlbum.images.map((img) => (
                  <div key={img.id} className="aspect-square overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-primary)' }}>
                    <img src={img.src} alt={img.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 pt-4 text-xs" style={{ color: 'var(--text-faint)' }}>
                <span>Created {new Date(viewAlbum.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{viewAlbum.images.length} images</span>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => { setEditingAlbum(viewAlbum); setShowAlbumUpload(true); setViewAlbum(null) }}
                  className="flex-1 rounded-lg px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  Edit Album
                </button>
                <button
                  onClick={() => { setConfirmDeleteAlbum(viewAlbum.id); setViewAlbum(null) }}
                  className="flex-1 rounded-lg border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors hover:bg-venom-500 hover:text-white hover:border-venom-500"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  Delete Album
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
