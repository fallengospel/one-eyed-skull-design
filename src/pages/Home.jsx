import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getActiveProfile, listCollection, listAlbums } from '../lib/storage.js'
import { SITE } from '../lib/siteConfig.js'
import { Reveal, useScrollReveal } from '../hooks/useScrollReveal.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'
import { IconArrowRight, IconMail, IconGitHub, IconUpload } from '../components/icons.jsx'
import SkullLogo from '../components/SkullLogo.jsx'
import CoverCard from '../components/CoverCard.jsx'
import Lightbox from '../components/Lightbox.jsx'

const MARQUEE_ITEMS = [
  'ALBUM ART',
  'COVER DESIGN',
  'VISUAL IDENTITY',
  'ONE-EYED SKULL DESIGN',
  'CUSTOM FRAMES & FILTERS',
]

export default function Home() {
  const [profile, setProfile] = useState(null)
  const [covers, setCovers] = useState(null)
  const [albumCount, setAlbumCount] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef(null)
  const { editMode } = useEditMode()

  useEffect(() => {
    document.title = 'OneEyedSkullDesign — Album Cover Art Gallery'
    setMounted(true)
  }, [])

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const p = await getActiveProfile()
        if (!live) return
        setProfile(p)
        const pid = p?.id || 'default'
        const [items, albums] = await Promise.all([listCollection(pid), listAlbums(pid)])
        if (!live) return
        setCovers(items)
        setAlbumCount(albums.length)
      } catch (e) {
        console.error('[Home] load error:', e)
        if (live) { setProfile(null); setCovers([]) }
      }
    })()
    return () => { live = false }
  }, [])

  // Parallax: hero drifts up and fades as you scroll away
  useEffect(() => {
    if (!heroRef.current) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const y = Math.min(window.scrollY, 900)
        const el = heroRef.current
        if (!el) return
        el.style.transform = `translateY(${y * 0.18}px)`
        el.style.opacity = String(Math.max(0, 1 - y / 620))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const recent = covers ? covers.slice(0, 8) : []
  const name = profile?.name || SITE.fallbackName
  const handle = profile?.handle || SITE.fallbackName
  const bio = profile?.bio || SITE.fallbackBio

  const scrollToWorks = () => document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen">
      {/* ——— Identity hero ——— */}
      <section ref={heroRef} className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden text-center will-change-transform">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'var(--accent-muted)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-theme-border to-transparent" />
        </div>

        <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-8 flex justify-center">
            <SkullLogo size={72} className="opacity-80" />
          </div>

          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.45em] text-venom-400">
            Album Cover Art
          </p>

          <h1 className="font-display text-5xl uppercase tracking-wide sm:text-7xl md:text-8xl" style={{ color: 'var(--text-primary)' }}>
            {name}
          </h1>

          <p className="mt-3 text-xs font-medium tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted)' }}>
            @{handle}
          </p>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            {bio}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={scrollToWorks}
              className="group flex items-center gap-2 rounded-full bg-theme-accent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-theme-accent-hover hover:shadow-[0_0_40px_-8px_rgba(193,18,31,0.5)]"
            >
              Selected Works
              <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              to="/vault"
              className="flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              Enter The Vault
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-5 w-5" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </section>

      {/* ——— Marquee ticker ——— */}
      <div className="relative overflow-hidden border-y py-5" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-marquee flex w-max">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={item} className="flex items-center">
                  <span className="font-display text-sm uppercase tracking-[0.2em] sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
                    {item}
                  </span>
                  <span className="mx-6 text-venom-500 sm:mx-8">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ——— Selected works ——— */}
      <section id="works" className="relative scroll-mt-24 py-20 sm:py-24">
        <Reveal className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">Portfolio</p>
            <h2 className="font-display text-3xl tracking-wide sm:text-4xl" style={{ color: 'var(--text-primary)' }}>SELECTED WORKS</h2>
          </div>
          <Link to="/vault" className="group flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider transition-colors hover:text-theme-text" style={{ color: 'var(--text-muted)' }}>
            Full collection
            <IconArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {covers === null ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-5">
                <div className="skeleton aspect-square rounded-xl" />
                <div className="skeleton mt-2 h-4 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <Reveal className="flex flex-col items-center py-20 text-center">
            <div className="animate-float mb-6 opacity-20">
              <SkullLogo size={72} />
            </div>
            <p className="font-display text-lg" style={{ color: 'var(--text-muted)' }}>The wall is bare.</p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-faint)' }}>
              {editMode ? 'Upload your first cover in the Vault.' : 'New work will appear here.'}
            </p>
            {editMode && (
              <Link
                to="/vault"
                className="mt-6 flex items-center gap-2 rounded-lg bg-theme-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
              >
                <IconUpload size={16} /> Upload Cover
              </Link>
            )}
          </Reveal>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {recent.map((cover, i) => (
              <Reveal key={cover.id} delay={Math.min(i * 70, 420)} className="break-inside-avoid">
                <CoverCard
                  cover={cover}
                  index={i}
                  onView={setLightbox}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </Reveal>
            ))}
          </div>
        )}

        {lightbox && (
          <Lightbox
            cover={lightbox}
            items={recent}
            onNavigate={setLightbox}
            onClose={() => setLightbox(null)}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
      </section>

      {/* ——— About ——— */}
      <section className="relative py-20 sm:py-24">
        <Reveal
          className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full blur-[80px]" style={{ backgroundColor: 'var(--accent-muted)' }} />
          <div className="relative grid gap-8 sm:grid-cols-[auto,1fr] sm:gap-12">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div
                className="relative h-32 w-32 overflow-hidden rounded-full sm:h-40 sm:w-40"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '3px solid var(--border-primary)' }}
              >
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={name}
                    className="absolute w-auto"
                    style={{
                      height: `${200 * (profile.avatarZoom || 1)}%`,
                      top: `calc(-50% + ${profile.avatarOffset || 50}% - 25%)`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <SkullLogo size={48} style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">About</p>
              <h2 className="font-display text-3xl tracking-wide sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                {name.toUpperCase()}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {bio}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <PracticeItem
                  title="Album Covers"
                  description="Sleeve art built from scratch — mood, type, and texture working as one."
                />
                <PracticeItem
                  title="Visual Identity"
                  description="A signature look across a discography: consistent, recognizable, yours."
                />
                <PracticeItem
                  title="Custom Treatment"
                  description="Signature filters like Skull Noir and Bloodmoon, plus custom frames."
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ——— Signal / music ——— */}
      <section className="relative py-20 sm:py-24">
        <Reveal className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">Signal</p>
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl" style={{ color: 'var(--text-primary)' }}>ON ROTATION</h2>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            The soundtrack behind the artwork.
          </p>
        </Reveal>

        <Reveal delay={120} className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl p-3 sm:p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
            <iframe
              title="Now playing"
              src={SITE.spotifyEmbed}
              width="100%"
              height="352"
              frameBorder="0"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ display: 'block', borderRadius: '12px', border: 'none' }}
            />
          </div>
        </Reveal>
      </section>

      {/* ——— Contact ——— */}
      <section className="relative py-20 sm:py-24">
        <Reveal className="relative overflow-hidden rounded-2xl p-10 text-center sm:p-16" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-[80px]" style={{ backgroundColor: 'var(--accent-muted)' }} />
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">Get in touch</p>
          <h2 className="font-display text-3xl tracking-wide sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
            LET'S MAKE ART
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
            Commission a cover, trade ideas, or just talk music and design.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2 rounded-full bg-theme-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-theme-accent-hover hover:shadow-[0_0_40px_-8px_rgba(193,18,31,0.5)]"
            >
              <IconMail size={16} />
              {SITE.email}
            </a>
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
            >
              <IconGitHub size={16} />
              GitHub
            </a>
          </div>
        </Reveal>
      </section>

      {/* ——— Footer ——— */}
      <footer className="py-12 text-center" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex items-center justify-center gap-3">
          <SkullLogo size={24} className="opacity-40" />
          <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--text-faint)' }}>ONE-EYED SKULL DESIGN</span>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs tabular-nums" style={{ color: 'var(--text-faint)' }}>
          <span><CountUp value={covers?.length || 0} /> covers</span>
          <span aria-hidden="true">✦</span>
          <span><CountUp value={albumCount} /> albums</span>
          <span aria-hidden="true">✦</span>
          <span>handmade for {name}</span>
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>
          © {new Date().getFullYear()} OneEyedSkullDesign — album cover art gallery
        </p>
      </footer>
    </div>
  )
}

function PracticeItem({ title, description }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
      <h3 className="font-display text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  )
}

/** Eased count-up that fires when scrolled into view. */
function CountUp({ value }) {
  const [ref, visible] = useScrollReveal({ threshold: 0.5 })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!visible) return
    if (typeof requestAnimationFrame === 'undefined') { setN(value); return }
    let raf
    let start = null
    const step = (t) => {
      if (start === null) start = t
      const p = Math.min((t - start) / 900, 1)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [visible, value])

  return <span ref={ref}>{n}</span>
}
