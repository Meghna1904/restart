import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../contexts/AuthContext'
import { useBrainCounts, useAddBrainItem } from '../../hooks/useBrainDump'
import { useShouldShowNudge, getCurrentNudgeType, getNudgeMessage, useLogNudgeResponse, NUDGES } from '../../hooks/useNudges'
import { greeting } from '../../lib/utils'

function todayLabel() {
  const d = new Date()
  return {
    day: d.toLocaleDateString('en', { weekday: 'long' }),
    date: d.toLocaleDateString('en', { month: 'long', day: 'numeric' })
  }
}

export default function HomePage() {
  const { profile } = useAuth()
  const { data: countsData } = useBrainCounts()
  const addBrainItem = useAddBrainItem()
  
  const showNudge = useShouldShowNudge()
  const nudgeType = getCurrentNudgeType()
  const logNudge = useLogNudgeResponse()
  
  const [dumpText, setDumpText] = useState('')

  const handleDump = async () => {
    if (!dumpText.trim()) return
    await addBrainItem.mutateAsync({ content: dumpText, source: 'quick' })
    setDumpText('')
  }

  const { day, date } = todayLabel()
  const counts = countsData?.counts ?? {}

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Date Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>{day}</p>
        <p style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--foreground)', fontWeight: 700 }}>{date}</p>
      </div>

      <p style={{ fontSize: '1.125rem', marginBottom: 24, textAlign: 'center', fontWeight: 500 }}>
        {greeting(profile?.display_name)}
      </p>

      {/* Brain Dump Input */}
      <div className="card" style={{ marginBottom: 32, padding: '24px 20px', background: 'var(--surface-2)' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: 16, textAlign: 'center' }}>
          what's on your mind?
        </p>
        <textarea
          className="input"
          placeholder="I should make an app that turns Reddit saves into..."
          value={dumpText}
          onChange={e => setDumpText(e.target.value)}
          style={{ minHeight: 120, background: 'var(--background)', marginBottom: 12, border: 'none' }}
        />
        <button 
          className="btn btn-cta btn-full"
          onClick={handleDump}
          disabled={!dumpText.trim() || addBrainItem.isPending}
        >
          {addBrainItem.isPending ? 'Saving...' : '+ brain dump'}
        </button>
      </div>

      {/* Gentle Nudge */}
      {showNudge && (
        <div className="card" style={{ marginBottom: 32, background: 'rgba(10, 147, 150, 0.08)', border: '1px solid rgba(10, 147, 150, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: '1.25rem' }}>{NUDGES[nudgeType].emoji}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tiny Nudge
            </span>
          </div>
          
          <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 20, lineHeight: 1.5 }}>
            {getNudgeMessage(nudgeType)}
          </p>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-primary" style={{ flex: 1 }}
              onClick={() => logNudge.mutate({ nudge_type: nudgeType, nudge_message: '', response: 'yeah' })}
            >
              yeah
            </button>
            <button 
              className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}
              onClick={() => logNudge.mutate({ nudge_type: nudgeType, nudge_message: '', response: 'not_today' })}
            >
              not now
            </button>
          </div>
        </div>
      )}

      <div className="divider" style={{ margin: '32px 0' }} />

      {/* Simplified Stats / Buckets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BucketRow icon="💡" count={counts.ideas ?? 0} label="ideas" color="#ee9b00" />
        <BucketRow icon="🧠" count={countsData?.total ?? 0} label="things on my mind" color="#94d2bd" />
        <BucketRow icon="↩" count={0} label="comebacks" color="#0a9396" />
      </div>

      {/* Reality Check FAB (Floating Action Button) */}
      <button
        style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: 'var(--shadow-md)',
          color: 'var(--muted-foreground)',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          zIndex: 40
        }}
        onClick={() => { /* Open Reality Check Modal */ }}
      >
        <Icon icon="lucide:crosshair" width={18} height={18} />
        What was I doing?
      </button>

    </div>
  )
}

function BucketRow({ icon, count, label, color }: { icon: string, count: number, label: string, color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 4px' }}>
      <div style={{ 
        width: 40, height: 40, borderRadius: 12, 
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem'
      }}>
        {icon}
      </div>
      <div>
        <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--foreground)' }}>{count}</span>
        <span style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)', marginLeft: 8 }}>{label}</span>
      </div>
    </div>
  )
}
