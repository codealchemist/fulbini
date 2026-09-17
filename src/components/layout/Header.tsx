import { NavLink } from 'react-router-dom'
import { Trophy, Home } from 'lucide-react'
import clsx from 'clsx'
import { SearchBar } from '../search/SearchBar'
import { PhotoToggle } from './PhotoToggle'
import { AccountButton } from './AccountButton'
import { APP_VERSION } from '../../lib/version'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="flex shrink-0 items-center gap-2 text-text">
          <img src="/favicon.svg" alt="" width={32} height={32} className="rounded-lg" />
          <span className="flex items-baseline gap-1.5">
            <span className="hidden text-base font-semibold sm:inline">Fulbini</span>
            <span className="text-[11px] text-text-faint">v{APP_VERSION}</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/" icon={<Home size={15} />} label="Home" end />
          <NavItem to="/leagues" icon={<Trophy size={15} />} label="Leagues" />
        </nav>

        <SearchBar className="relative ml-auto hidden max-w-sm flex-1 md:block" />

        <PhotoToggle className="hidden md:flex" />
        <AccountButton className="hidden md:flex" />
      </div>
    </header>
  )
}

function NavItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
          isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
