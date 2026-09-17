import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Trophy, Search, Image, X } from 'lucide-react'
import clsx from 'clsx'
import { SearchBar } from '../search/SearchBar'
import { useSettings } from '../../context/SettingsContext'

export function MobileNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { showPlayerPhotos, toggleShowPlayerPhotos } = useSettings()

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border-soft bg-surface/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          <TabItem to="/" icon={<Home size={19} />} label="Home" end />
          <TabItem to="/leagues" icon={<Trophy size={19} />} label="Leagues" />
          <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center gap-0.5 py-2.5 text-text-muted">
            <Search size={19} />
            <span className="text-[10px]">Search</span>
          </button>
          <button
            onClick={toggleShowPlayerPhotos}
            className={clsx('flex flex-col items-center gap-0.5 py-2.5', showPlayerPhotos ? 'text-accent' : 'text-text-muted')}
          >
            <Image size={19} />
            <span className="text-[10px]">Photos</span>
          </button>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-bg/98 backdrop-blur p-4 md:hidden">
          <div className="mb-3 flex items-center gap-2">
            <SearchBar className="relative flex-1" autoFocus onNavigate={() => setSearchOpen(false)} />
            <button onClick={() => setSearchOpen(false)} className="rounded-full border border-border p-2.5 text-text-muted">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function TabItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 py-2.5', isActive ? 'text-accent' : 'text-text-muted')}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </NavLink>
  )
}
