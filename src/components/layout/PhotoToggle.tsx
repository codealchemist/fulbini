import { Image, ImageOff } from 'lucide-react'
import clsx from 'clsx'
import { useSettings } from '../../context/SettingsContext'

export function PhotoToggle({ className }: { className?: string }) {
  const { showPlayerPhotos, toggleShowPlayerPhotos } = useSettings()

  return (
    <button
      onClick={toggleShowPlayerPhotos}
      title={showPlayerPhotos ? 'Hide player photos' : 'Show player photos'}
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors',
        showPlayerPhotos ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-text-muted hover:bg-surface-hover',
        className,
      )}
    >
      {showPlayerPhotos ? <Image size={15} /> : <ImageOff size={15} />}
      <span className="hidden sm:inline">Player photos</span>
    </button>
  )
}
