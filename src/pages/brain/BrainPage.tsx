import { useState } from 'react'
import { useBrainItems, useUpdateBrainCategory, CATEGORY_META } from '../../hooks/useBrainDump'
import type { BrainCategory } from '../../lib/database.types'

export default function BrainPage() {
  const { data: items, isLoading } = useBrainItems()
  const updateCategory = useUpdateBrainCategory()
  const [filter, setFilter] = useState<BrainCategory | 'all'>('all')

  if (isLoading) {
    return <div className="animate-fade-in" style={{ padding: 24 }}>Loading...</div>
  }

  const filtered = items?.filter(item => filter === 'all' || item.category === filter) ?? []

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 24, paddingTop: 40 }}>
        <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Your unfiltered corner</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.05em' }}>
          Brain
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginTop: 4 }}>
          Everything you've dumped.
        </p>
      </header>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12, scrollbarWidth: 'none' }}>
        <button
          className="tag-pill"
          style={{ background: filter === 'all' ? 'var(--primary)' : 'var(--surface-2)', color: filter === 'all' ? '#fff' : 'inherit' }}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {(Object.keys(CATEGORY_META) as BrainCategory[]).filter(c => c !== 'ideas').map(cat => (
          <button
            key={cat}
            className="tag-pill"
            style={{ 
              background: filter === cat ? CATEGORY_META[cat].color : 'var(--surface-2)',
              color: filter === cat ? '#fff' : 'inherit',
              border: 'none'
            }}
            onClick={() => setFilter(cat)}
          >
            {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 40 }}>Nothing here yet.</p>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="card" style={{ padding: '16px' }}>
              <p style={{ fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5, marginBottom: 12 }}>
                {item.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                
                <select 
                  className="input"
                  style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '0.75rem', borderRadius: 6 }}
                  value={item.category}
                  onChange={e => updateCategory.mutate({ id: item.id, category: e.target.value as BrainCategory })}
                >
                  {(Object.keys(CATEGORY_META) as BrainCategory[]).map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
