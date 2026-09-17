import { useRef, useState, type RefObject } from 'react'
import { Check, Copy, X } from 'lucide-react'
import clsx from 'clsx'
import { copyNodeAsImage } from '../../lib/clipboard'

type Status = 'idle' | 'success' | 'error'

export function CopyImageButton({
  targetRef,
  filename,
  className,
  label = 'Copy image',
}: {
  targetRef: RefObject<HTMLElement | null>
  filename?: string
  className?: string
  label?: string
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const node = targetRef.current
    if (!node) return

    const result = await copyNodeAsImage(node, filename)
    setStatus(result.ok ? 'success' : 'error')
    setMessage(result.message)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={clsx(
        'group relative flex items-center justify-center rounded-full border border-border bg-surface/80 p-1.5 text-text-muted backdrop-blur hover:border-accent hover:text-accent transition-colors',
        status === 'success' && 'animate-flash-copied border-accent text-accent',
        status === 'error' && 'border-live text-live',
        className,
      )}
    >
      {status === 'success' ? <Check size={14} /> : status === 'error' ? <X size={14} /> : <Copy size={14} />}
      <span className="pointer-events-none absolute -bottom-8 right-0 whitespace-nowrap rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-20">
        {status === 'idle' ? label : message}
      </span>
    </button>
  )
}
