import { useState } from 'react'
import { UserRound } from 'lucide-react'
import clsx from 'clsx'
import { useSettings } from '../../context/SettingsContext'

export function PlayerAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string | null
  alt: string
  size?: number
  className?: string
}) {
  const { showPlayerPhotos } = useSettings()
  const [failed, setFailed] = useState(false)

  if (!showPlayerPhotos || !src || failed) {
    return (
      <div
        className={clsx('flex items-center justify-center rounded-full bg-surface-2 text-text-faint shrink-0', className)}
        style={{ width: size, height: size }}
        title={alt}
      >
        <UserRound size={size * 0.55} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx('rounded-full object-cover shrink-0 bg-surface-2', className)}
      style={{ width: size, height: size }}
    />
  )
}
