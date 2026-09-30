import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useBrainItems, useUpdateBrainCategory, useAddBrainItem, useArchiveBrainItem, CATEGORY_META } from '../../hooks/useBrainDump'
import type { BrainCategory } from '../../lib/database.types'

export default function VaultPage() {
  const { data: items, isLoading } = useBrainItems()
  const updateCategory = useUpdateBrainCategory()
  const archiveItem = useArchiveBrainItem()
  const addItem = useAddBrainItem()
  
  const [filter, setFilter] = useState<BrainCategory | 'all'>('all')
  const [newItemText, setNewItemText] = useState('')

  if (isLoading) {
    return <div className="animate-fade-in" style={{ padding: 24 }}>Loading...</div>
  }

  const filtered = items?.filter(item => filter === 'all' || item.category === filter) ?? []

  const handleAdd = async () => {
    if (!newItemText.trim()) return
    await addItem.mutateAsync({ 
      content: newItemText, 
      category: filter === 'all' ? undefined : filter, 
      source: 'vault' 
    })
    setNewItemText('')
  }

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 24, paddingTop: 40 }}>
        <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Your external brain</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.05em' }}>
          Vault
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginTop: 4 }}>
          Thoughts, ideas, and reminders you've dropped here.
        </p>
      </header>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 12, scrollbarWidth: 'none' }}>
        <button
          className="tag-pill"
          style={{ 
            background: filter === 'all' ? 'var(--primary)' : 'var(--surface-2)', 
            color: filter === 'all' ? '#fff' : 'inherit',
            border: 'none', padding: '6px 14px'
          }}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {(Object.keys(CATEGORY_META) as BrainCategory[]).map(cat => (
          <button
            key={cat}
            className="tag-pill"
            style={{ 
              background: filter === cat ? CATEGORY_META[cat].color : 'var(--surface-2)',
              color: filter === cat ? '#fff' : 'inherit',
              border: 'none', padding: '6px 14px'
            }}
            onClick={() => setFilter(cat)}
          >
            {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Quick Add */}
      <div className="card" style={{ marginBottom: 24, padding: '16px', background: 'var(--surface-2)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: 8 }}>
          Drop something {filter !== 'all' ? `into ${CATEGORY_META[filter].label}` : 'in the vault'}...
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="input"
            placeholder={filter === 'ideas' ? "A social app where..." : "Type here..."}
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1, minHeight: 44 }}
          />
          <button 
            className="btn btn-cta"
            onClick={handleAdd}
            disabled={!newItemText.trim() || addItem.isPending}
            style={{ minHeight: 44, padding: '0 16px' }}
          >
            <Icon icon="lucide:arrow-up" width={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Icon icon="lucide:archive" width={32} height={32} style={{ color: 'var(--muted-foreground)', marginBottom: 12 }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Nothing in here yet.</p>
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
              {/* Subtle category color indicator */}
              <div style={{ 
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, 
                background: CATEGORY_META[item.category]?.color ?? 'var(--border)' 
              }} />
              
              <p style={{ fontSize: '1rem', color: 'var(--foreground)', lineHeight: 1.5, marginBottom: 12, paddingLeft: 8 }}>
                {item.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select 
                    className="input"
                    style={{ width: 'auto', padding: '4px 8px', minHeight: 'auto', fontSize: '0.75rem', borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--muted-foreground)' }}
                    value={item.category}
                    aria-label={`Change category for ${item.content}`}
                    onChange={e => updateCategory.mutate({ id: item.id, category: e.target.value as BrainCategory })}
                  >
                    {(Object.keys(CATEGORY_META) as BrainCategory[]).map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-ghost btn-sm"
                    aria-label="Archive item"
                    title="Archive item"
                    onClick={() => archiveItem.mutate(item.id)}
                    disabled={archiveItem.isPending}
                    style={{ minHeight: 32, padding: '4px 8px', color: 'var(--muted-foreground)' }}
                  >
                    <Icon icon="lucide:archive-x" width={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
