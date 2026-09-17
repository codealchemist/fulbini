import { useState } from 'react'
import { Shield } from 'lucide-react'
import clsx from 'clsx'

export function TeamLogo({ src, alt, size = 24, className }: { src: string; alt: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={clsx('flex items-center justify-center rounded-full bg-surface-2 text-text-faint', className)}
        style={{ width: size, height: size }}
      >
        <Shield size={size * 0.6} strokeWidth={1.5} />
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
      className={clsx('object-contain', className)}
      style={{ width: size, height: size }}
    />
  )
}
