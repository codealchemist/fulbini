import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import clsx from 'clsx'
import { MONTH_NAMES, WEEKDAY_NAMES, isSameDay, formatDateLabel } from '../../lib/date'

function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

export function DatePicker({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(new Date(value.getFullYear(), value.getMonth(), 1))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setCursor(new Date(value.getFullYear(), value.getMonth(), 1))
  }, [value])

  const grid = buildMonthGrid(cursor.getFullYear(), cursor.getMonth())
  const today = new Date()

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-text hover:border-accent/50 hover:bg-surface-hover transition-colors"
      >
        <CalendarDays size={16} className="text-text-muted" />
        {formatDateLabel(value)}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-border bg-surface-2 p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded-full p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium">
              {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
            </span>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded-full p-1.5 text-text-muted hover:bg-surface-hover hover:text-text"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-faint mb-1">
            {WEEKDAY_NAMES.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grid.map((d) => {
              const inMonth = d.getMonth() === cursor.getMonth()
              const isSelected = isSameDay(d, value)
              const isToday = isSameDay(d, today)
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    onChange(d)
                    setOpen(false)
                  }}
                  className={clsx(
                    'aspect-square rounded-lg text-xs transition-colors',
                    !inMonth && 'text-text-faint/50',
                    inMonth && !isSelected && 'text-text hover:bg-surface-hover',
                    isSelected && 'bg-accent text-[#05130a] font-semibold',
                    isToday && !isSelected && 'ring-1 ring-inset ring-accent/50',
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => {
              onChange(new Date())
              setOpen(false)
            }}
            className="mt-2 w-full rounded-lg py-1.5 text-center text-xs text-accent hover:bg-surface-hover"
          >
            Jump to today
          </button>
        </div>
      )}
    </div>
  )
}
