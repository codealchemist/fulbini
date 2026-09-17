import type { ReactNode } from 'react'
import type { Fixture } from '../../api/types'
import { Snapshottable } from '../common/Snapshottable'
import { EmptyState } from '../common/EmptyState'
import { MatchCard } from './MatchCard'

export function MatchSection({
  title,
  icon,
  fixtures,
  emptyLabel,
  accent,
}: {
  title: string
  icon?: ReactNode
  fixtures: Fixture[]
  emptyLabel: string
  accent?: 'live' | 'default'
}) {
  return (
    <Snapshottable filename={`${title.toLowerCase().replace(/\s+/g, '-')}.png`} className="rounded-2xl">
      <section className="rounded-2xl border border-border-soft bg-surface/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h2 className={accent === 'live' ? 'text-sm font-semibold uppercase tracking-wide text-live' : 'text-sm font-semibold uppercase tracking-wide text-text-muted'}>
            {title}
          </h2>
          <span className="text-xs text-text-faint">({fixtures.length})</span>
        </div>

        {fixtures.length === 0 ? (
          <EmptyState message={emptyLabel} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fixtures.map((fx) => (
              <MatchCard key={fx.fixture.id} fixture={fx} />
            ))}
          </div>
        )}
      </section>
    </Snapshottable>
  )
}
