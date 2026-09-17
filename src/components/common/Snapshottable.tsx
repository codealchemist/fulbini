import { useRef, type ReactNode } from 'react'
import clsx from 'clsx'
import { CopyImageButton } from './CopyImageButton'

/**
 * Wraps any block of UI with a hover-visible "copy as image" button in the
 * corner, so every card/section can be copied to the clipboard as a PNG.
 */
export function Snapshottable({
  children,
  filename,
  className,
  label,
  buttonClassName,
}: {
  children: ReactNode
  filename?: string
  className?: string
  label?: string
  buttonClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className={clsx('group/snapshot relative', className)}>
      <div className="absolute top-2 right-2 z-20 opacity-0 transition-opacity group-hover/snapshot:opacity-100 focus-within:opacity-100">
        <CopyImageButton targetRef={ref} filename={filename} label={label} className={buttonClassName} />
      </div>
      {children}
    </div>
  )
}
