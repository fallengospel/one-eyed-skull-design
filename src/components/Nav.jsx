import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import SkullLogo from './SkullLogo.jsx'

export default function Nav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3 group">
          <SkullLogo size={28} className="transition-transform duration-200 group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-xs tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
              ONE-EYED SKULL
            </span>
            <span className="mt-0.5 text-[9px] font-medium tracking-[0.5em]" style={{ color: 'var(--text-muted)' }}>
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
                isActive ? 'text-theme-text' : 'text-theme-text-muted hover:text-theme-text-alt'
              }`
            }
          >
            {({ isActive }) => (
              <>
                Home
                {isActive && (
                  <span className="absolute -bottom-[22px] left-2 right-2 h-0.5 rounded-full bg-theme-accent" />
                )}
              </>
            )}
          </NavLink>
          <NavLink
            to="/vault"
            className={({ isActive }) =>
              `relative px-3 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors ${
                isActive ? 'text-theme-text' : 'text-theme-text-muted hover:text-theme-text-alt'
              }`
            }
          >
            {({ isActive }) => (
              <>
                The Vault
                {isActive && (
                  <span className="absolute -bottom-[22px] left-2 right-2 h-0.5 rounded-full bg-theme-accent" />
                )}
              </>
            )}
          </NavLink>
          <button
            onClick={toggleTheme}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-theme-bg-alt"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="h-4 w-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
