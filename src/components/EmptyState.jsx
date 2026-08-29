import { Link } from 'react-router-dom'
import SkullLogo from './SkullLogo.jsx'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="animate-float mb-8 opacity-30">
        <SkullLogo size={120} />
      </div>
      <h2 className="font-display text-2xl tracking-wide sm:text-3xl" style={{ color: 'var(--text-secondary)' }}>
        The wall is bare.
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        No covers pinned yet. Enter The Vault and give this wall something to stare at.
      </p>
      <Link
        to="/vault"
        className="mt-8 rounded-lg bg-theme-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-theme-accent-hover"
      >
        Enter The Vault
      </Link>
    </div>
  )
}
