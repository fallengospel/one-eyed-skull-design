import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGallery } from '../hooks/useGallery.js'
import SkullLogo from '../components/SkullLogo.jsx'
import CoverCard from '../components/CoverCard.jsx'
import Lightbox from '../components/Lightbox.jsx'

export default function Home() {
  const { covers } = useGallery()
  const [lightbox, setLightbox] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.title = 'OneEyedSkullDesign — Album Cover Art Gallery'
    setMounted(true)
  }, [])

  const recent = covers ? covers.slice(0, 6) : []

  return (
    <div className="min-h-screen">
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-venom-500/[0.04] blur-[120px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className={`relative z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-8 flex justify-center">
            <SkullLogo size={80} className="opacity-80" />
          </div>

          <h1 className="font-display text-5xl tracking-wide text-bone-50 sm:text-7xl md:text-8xl">
            ONE-EYED
            <br />
            SKULL
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-bone-500 sm:text-base">
            A curated collection of album cover artwork. Design, customize, and showcase your visual identity through music.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/gallery"
              className="group flex items-center gap-2 rounded-full bg-venom-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-venom-400 hover:shadow-[0_0_40px_-8px_rgba(193,18,31,0.5)]"
            >
              View Collection
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link
              to="/forge"
              className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-bone-300 transition-all hover:border-white/30 hover:text-bone-100"
            >
              Create Cover
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-5 w-5 text-bone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">What I Do</p>
          <h2 className="font-display text-3xl tracking-wide text-bone-50 sm:text-4xl">THE CRAFT</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>}
            title="Curate"
            description="Build your personal gallery of album covers. Search, filter, and organize your collection your way."
          />
          <FeatureCard
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>}
            title="Create"
            description="Upload artwork, apply signature filters like Skull Noir and Bloodmoon, add frames, and make it yours."
          />
          <FeatureCard
            icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            title="Showcase"
            description="Your profile, your collection. A personal space to present your work to the world."
          />
        </div>
      </section>

      {recent.length > 0 && (
        <section className="relative py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">Recent Work</p>
              <h2 className="font-display text-3xl tracking-wide text-bone-50 sm:text-4xl">THE WALL</h2>
            </div>
            <Link to="/gallery" className="text-xs font-medium uppercase tracking-wider text-bone-500 transition-colors hover:text-bone-300">
              View All
            </Link>
          </div>

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {recent.map((cover, i) => (
              <CoverCard
                key={cover.id}
                cover={cover}
                index={i}
                onView={setLightbox}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>

          {lightbox && (
            <Lightbox
              cover={lightbox}
              onClose={() => setLightbox(null)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </section>
      )}

      <section className="relative py-24">
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-symbiote-800/30 p-12 text-center sm:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-venom-500/10 blur-[80px]" />
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-venom-400">Ready?</p>
          <h2 className="font-display text-3xl tracking-wide text-bone-50 sm:text-4xl">START FORGING</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-bone-500">
            Upload your first album cover and build your collection.
          </p>
          <Link
            to="/forge"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-venom-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-venom-400"
          >
            Open The Forge
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center">
        <div className="flex items-center justify-center gap-3">
          <SkullLogo size={24} className="opacity-40" />
          <span className="text-xs tracking-[0.2em] text-bone-600">ONE-EYED SKULL DESIGN</span>
        </div>
        <p className="mt-3 text-xs text-bone-600">Album cover art gallery & customization tool</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-xl border border-white/5 bg-symbiote-800/30 p-8 transition-all hover:border-venom-500/30 hover:bg-symbiote-800/50">
      <div className="mb-4 text-venom-400 transition-colors group-hover:text-venom-500">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-lg tracking-wide text-bone-100">{title}</h3>
      <p className="text-sm leading-relaxed text-bone-500">{description}</p>
    </div>
  )
}
