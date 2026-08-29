import { NavLink } from 'react-router-dom'
import SkullLogo from './SkullLogo.jsx'

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-symbiote-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3 group">
          <SkullLogo size={28} className="transition-transform duration-200 group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-xs tracking-[0.2em] text-bone-100">
              ONE-EYED SKULL
            </span>
            <span className="mt-0.5 text-[9px] font-medium tracking-[0.5em] text-bone-500">
              DESIGN
            </span>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `relative px-3 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors ${
                isActive ? 'text-bone-100' : 'text-bone-500 hover:text-bone-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                Home
                {isActive && (
                  <span className="absolute -bottom-[22px] left-2 right-2 h-0.5 rounded-full bg-venom-500" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/vault"
            className={({ isActive }) =>
              `relative px-3 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors ${
                isActive ? 'text-bone-100' : 'text-bone-500 hover:text-bone-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                The Vault
                {isActive && (
                  <span className="absolute -bottom-[22px] left-2 right-2 h-0.5 rounded-full bg-venom-500" />
                )}
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
