import { Link } from 'react-router-dom'
import SkullLogo from './SkullLogo.jsx'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="animate-float mb-8 opacity-30">
        <SkullLogo size={120} />
      </div>
      <h2 className="font-display text-2xl tracking-wide text-bone-300 sm:text-3xl">
        The wall is bare.
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone-500">
        No covers pinned yet. Fire up The Forge and give this wall something to stare at.
      </p>
      <Link
        to="/forge"
        className="mt-8 rounded-md bg-venom-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-venom-400"
      >
        Open The Forge
      </Link>
    </div>
  )
}
