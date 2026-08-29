import { useState, useRef } from 'react'
import { IconX, IconUpload, IconReset, IconMinus, IconPlus } from './icons.jsx'
import { readFileAsDataURL } from '../lib/imageProcessing.js'

export default function ProfileSettings({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '')
  const [handle, setHandle] = useState(profile.handle || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [avatarOffset, setAvatarOffset] = useState(profile.avatarOffset || 50)
  const [avatarZoom, setAvatarZoom] = useState(profile.avatarZoom || 1)
  const [coverPhoto, setCoverPhoto] = useState(profile.coverPhoto || null)
  const [coverOffset, setCoverOffset] = useState(profile.coverOffset || 50)
  const [coverZoom, setCoverZoom] = useState(profile.coverZoom || 1)
  const [saving, setSaving] = useState(false)

  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const avatarContainerRef = useRef(null)
  const coverContainerRef = useRef(null)
  const avatarDragging = useRef(false)
  const coverDragging = useRef(false)
  const avatarLastY = useRef(0)
  const coverLastY = useRef(0)

  const handleAvatarUpload = async (file) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) return
    const dataUrl = await readFileAsDataURL(file)
    setAvatar(dataUrl)
    setAvatarOffset(50)
    setAvatarZoom(1)
  }

  const handleCoverUpload = async (file) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) return
    const dataUrl = await readFileAsDataURL(file)
    setCoverPhoto(dataUrl)
    setCoverOffset(50)
    setCoverZoom(1)
  }

  const onAvatarPointerDown = (e) => {
    if (!avatar) return
    avatarDragging.current = true
    avatarLastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onAvatarPointerMove = (e) => {
    if (!avatarDragging.current || !avatarContainerRef.current) return
    const dy = e.clientY - avatarLastY.current
    avatarLastY.current = e.clientY
    const containerHeight = avatarContainerRef.current.clientHeight
    const deltaPercent = (dy / containerHeight) * 100
    setAvatarOffset((prev) => Math.max(0, Math.min(100, prev + deltaPercent)))
  }

  const onAvatarPointerUp = () => {
    avatarDragging.current = false
  }

  const onCoverPointerDown = (e) => {
    if (!coverPhoto) return
    coverDragging.current = true
    coverLastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onCoverPointerMove = (e) => {
    if (!coverDragging.current || !coverContainerRef.current) return
    const dy = e.clientY - coverLastY.current
    coverLastY.current = e.clientY
    const containerHeight = coverContainerRef.current.clientHeight
    const deltaPercent = (dy / containerHeight) * 100
    setCoverOffset((prev) => Math.max(0, Math.min(100, prev + deltaPercent)))
  }

  const onCoverPointerUp = () => {
    coverDragging.current = false
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave({
      name: name.trim(),
      handle: handle.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
      bio: bio.trim(),
      avatar,
      avatarOffset,
      avatarZoom,
      coverPhoto,
      coverOffset,
      coverZoom,
    })
    setSaving(false)
  }

  const isGif = (url) => url && url.startsWith('data:image/gif')

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-sm" 
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div 
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl shadow-2xl animate-pop" 
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="font-display text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>Profile Settings</h2>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 transition-colors hover:bg-theme-bg-alt"
            aria-label="Close"
          >
            <IconX size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Profile Picture</p>
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>600 x 600 px</span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div 
                  ref={avatarContainerRef}
                  onPointerDown={onAvatarPointerDown}
                  onPointerMove={onAvatarPointerMove}
                  onPointerUp={onAvatarPointerUp}
                  className="relative h-36 w-36 cursor-grab overflow-hidden rounded-full active:cursor-grabbing"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '3px solid var(--border-primary)' }}
                >
                  {avatar ? (
                    <>
                      <img 
                        src={avatar} 
                        alt="Avatar preview" 
                        draggable={false}
                        className="absolute left-1/2 w-auto select-none"
                        style={{ 
                          height: `${200 * avatarZoom}%`,
                          top: `calc(-50% + ${avatarOffset}% - 25%)`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          pointerEvents: 'none'
                        }} 
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/20 pointer-events-none" />
                    </>
                  ) : (
                    <div 
                      className="flex h-full w-full cursor-pointer items-center justify-center"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <IconUpload size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <input 
                    ref={avatarInputRef} 
                    type="file" 
                    accept="image/jpeg,image/png,image/gif,image/webp" 
                    className="hidden" 
                    onChange={(e) => handleAvatarUpload(e.target.files[0])} 
                  />
                </div>
                {avatar && (
                  <div className="flex items-center gap-3">
                    {isGif(avatar) && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                        GIF
                      </span>
                    )}
                    <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <button 
                        onClick={() => setAvatarZoom((z) => Math.max(0.5, z - 0.1))} 
                        className="rounded p-1 transition-colors hover:bg-theme-bg-alt"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <IconMinus size={14} />
                      </button>
                      <span className="w-10 text-center text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {Math.round(avatarZoom * 100)}%
                      </span>
                      <button 
                        onClick={() => setAvatarZoom((z) => Math.min(3, z + 0.1))} 
                        className="rounded p-1 transition-colors hover:bg-theme-bg-alt"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <IconPlus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => { setAvatarOffset(50); setAvatarZoom(1) }} 
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors hover:bg-theme-bg-alt"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <IconReset size={12} /> Reset
                    </button>
                    <button 
                      onClick={() => { setAvatar(null); setAvatarOffset(50); setAvatarZoom(1) }} 
                      className="rounded-md px-2 py-1 text-[10px] text-venom-400 transition-colors hover:bg-venom-500/10"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cover Photo</p>
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>1000 x 600 px</span>
              </div>
              <div 
                ref={coverContainerRef}
                onPointerDown={onCoverPointerDown}
                onPointerMove={onCoverPointerMove}
                onPointerUp={onCoverPointerUp}
                className="relative w-full cursor-grab overflow-hidden rounded-xl active:cursor-grabbing"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-primary)',
                  aspectRatio: '5 / 3'
                }}
              >
                {coverPhoto ? (
                  <>
                    <img 
                      src={coverPhoto} 
                      alt="Cover preview" 
                      draggable={false}
                      className="absolute left-1/2 w-auto select-none"
                      style={{ 
                        height: `${200 * coverZoom}%`,
                        top: `calc(-50% + ${coverOffset}% - 25%)`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none'
                      }} 
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white/80 pointer-events-none">
                      Drag to reposition
                    </div>
                  </>
                ) : (
                  <div 
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <IconUpload size={24} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to upload cover photo</p>
                  </div>
                )}
                <input 
                  ref={coverInputRef} 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  className="hidden" 
                  onChange={(e) => handleCoverUpload(e.target.files[0])} 
                />
              </div>
              {coverPhoto && (
                <div className="mt-2 flex items-center gap-3">
                  {isGif(coverPhoto) && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent)' }}>
                      GIF
                    </span>
                  )}
                  <div className="flex items-center gap-1 rounded-lg px-2 py-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <button 
                      onClick={() => setCoverZoom((z) => Math.max(0.5, z - 0.1))} 
                      className="rounded p-1 transition-colors hover:bg-theme-bg-alt"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <IconMinus size={14} />
                    </button>
                    <span className="w-10 text-center text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(coverZoom * 100)}%
                    </span>
                    <button 
                      onClick={() => setCoverZoom((z) => Math.min(3, z + 0.1))} 
                      className="rounded p-1 transition-colors hover:bg-theme-bg-alt"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <IconPlus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => { setCoverOffset(50); setCoverZoom(1) }} 
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors hover:bg-theme-bg-alt"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <IconReset size={12} /> Reset
                  </button>
                  <button 
                    onClick={() => { setCoverPhoto(null); setCoverOffset(50); setCoverZoom(1) }} 
                    className="rounded-md px-2 py-1 text-[10px] text-venom-400 transition-colors hover:bg-venom-500/10"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t pt-6" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Basic Info</p>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Display Name <span className="text-venom-400">*</span>
              </span>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Handle</span>
              <input 
                type="text" 
                value={handle} 
                onChange={(e) => setHandle(e.target.value)} 
                placeholder="@handle (auto-generated if empty)" 
                className="field-input" 
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Bio</span>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell the world about your taste..." 
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
            disabled={!name.trim() || saving}
            className="rounded-lg bg-theme-accent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
