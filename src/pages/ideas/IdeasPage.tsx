import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useBrainItems, useAddBrainItem } from '../../hooks/useBrainDump'

export default function IdeasPage() {
  const { data: ideas, isLoading, error } = useBrainItems('ideas')
  const addIdea = useAddBrainItem()
  const [newIdea, setNewIdea] = useState('')

  const handleAdd = async () => {
    if (!newIdea.trim()) return
    await addIdea.mutateAsync({ content: newIdea, category: 'ideas', source: 'ideas' })
    setNewIdea('')
  }

  if (isLoading) {
    return <div className="animate-fade-in" style={{ padding: 24 }}>Loading...</div>
  }

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(238, 155, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          💡
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--accent)' }}>
            Ideas
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
            Things you've thought of lately.
          </p>
        </div>
      </header>

      {/* Quick Add */}
      <div className="card" style={{ marginBottom: 24, padding: '16px', background: 'var(--surface-2)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>I just thought of something...</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="input"
            placeholder="A social app where..."
            value={newIdea}
            onChange={e => setNewIdea(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1, minHeight: 44 }}
          />
          <button 
            className="btn btn-cta"
            onClick={handleAdd}
            disabled={!newIdea.trim() || addIdea.isPending}
            style={{ minHeight: 44, padding: '0 16px' }}
          >
            <Icon icon="lucide:arrow-up" width={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && (
          <div className="card" role="alert" style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}>
            Ideas could not load. Run the latest Supabase migrations, then refresh.
          </div>
        )}
        {ideas?.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 40 }}>No ideas yet.</p>
        ) : (
          ideas?.map(idea => (
            <div key={idea.id} className="card" style={{ padding: '20px', borderLeft: '3px solid var(--accent)' }}>
              <p style={{ fontSize: '1.0625rem', color: 'var(--foreground)', lineHeight: 1.5, fontWeight: 500 }}>
                {idea.content}
              </p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  {new Date(idea.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
