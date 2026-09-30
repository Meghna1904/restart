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
  const [realityCheckOpen, setRealityCheckOpen] = useState(false)
  const [realityStep, setRealityStep] = useState<'prompt' | 'answer' | 'reason' | 'done'>('prompt')
  const [intendedTask, setIntendedTask] = useState('')
  const [selectedReason, setSelectedReason] = useState('')

  const handleDump = async () => {
    if (!dumpText.trim()) return
    await addBrainItem.mutateAsync({ content: dumpText, source: 'quick' })
    setDumpText('')
  }

  const { day, date } = todayLabel()
  const counts = countsData?.counts ?? {}

  return (
    <div className="animate-fade-in" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 28 }}>
        <div>
          <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{day} · {date}</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.05em', lineHeight: 1.05 }}>A softer way<br />to get things done.</h1>
        </div>
        <div className="tag-pill" style={{ flexShrink: 0, background: 'rgba(126, 214, 192, 0.12)', borderColor: 'rgba(126, 214, 192, 0.2)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} /> grounded
        </div>
      </header>

      <p style={{ fontSize: '1.05rem', color: 'var(--muted-foreground)', marginBottom: 28 }}>
        {greeting(profile?.display_name)} Take a breath, then choose one small next step.
      </p>

      {/* Brain Dump Input */}
      <div className="card" style={{ marginBottom: 24, padding: 24, background: 'linear-gradient(145deg, var(--card), var(--surface-2))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Quick capture</p>
            <h2 style={{ fontSize: '1.35rem', letterSpacing: '-0.03em' }}>What's on your mind?</h2>
          </div>
          <span style={{ fontSize: '1.6rem' }} aria-hidden="true">✦</span>
        </div>
        <textarea
          className="input"
          placeholder="I should make an app that turns Reddit saves into..."
          value={dumpText}
          onChange={e => setDumpText(e.target.value)}
          style={{ minHeight: 112, background: 'var(--background)', marginBottom: 12, border: '1px solid var(--border)' }}
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

      <div className="section-header" style={{ margin: '32px 0 14px' }}>
        <h2 className="section-title">Your space</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>a little at a time</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
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
        onClick={() => {
          setRealityCheckOpen(true)
          setRealityStep('prompt')
          setIntendedTask('')
          setSelectedReason('')
        }}
      >
        <Icon icon="lucide:crosshair" width={18} height={18} />
        What was I doing?
      </button>

      {realityCheckOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setRealityCheckOpen(false)}>
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="reality-check-title" onClick={event => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16 }}>
              <div>
                <p className="section-title" style={{ color: 'var(--primary)', marginBottom: 8 }}>tiny reality check</p>
                <h2 id="reality-check-title" style={{ fontSize: '1.65rem', letterSpacing: '-0.04em' }}>
                  {realityStep === 'done' ? 'No pressure.' : 'What were you supposed to be doing?'}
                </h2>
              </div>
              <button className="btn btn-ghost btn-sm" aria-label="Close reality check" onClick={() => setRealityCheckOpen(false)}>✕</button>
            </div>

            {realityStep === 'prompt' && (
              <div className="gap-stack" style={{ marginTop: 24 }}>
                <textarea
                  className="input"
                  placeholder="studying HashMap, sending that email..."
                  value={intendedTask}
                  onChange={event => setIntendedTask(event.target.value)}
                  autoFocus
                />
                <button className="btn btn-primary btn-full" disabled={!intendedTask.trim()} onClick={() => setRealityStep('answer')}>okay, next</button>
              </div>
            )}

            {realityStep === 'answer' && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 18 }}>Are you doing that right now?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => setRealityStep('done')}>yes, I am</button>
                  <button className="btn btn-ghost" onClick={() => setRealityStep('reason')}>not really</button>
                </div>
              </div>
            )}

            {realityStep === 'reason' && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 14 }}>What happened?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['tired', 'distracted', 'avoiding it', 'wanted entertainment', 'forgot', 'got carried away'].map(reason => (
                    <button key={reason} className={`btn ${selectedReason === reason ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedReason(reason)}>
                      {reason}
                    </button>
                  ))}
                </div>
                <button className="btn btn-cta btn-full" style={{ marginTop: 16 }} disabled={!selectedReason} onClick={() => setRealityStep('done')}>okay, thanks for noticing</button>
              </div>
            )}

            {realityStep === 'done' && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: 20 }}>
                  {selectedReason ? 'Happens. You noticed, and that counts.' : 'Lovely. Keep going gently.'}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setRealityCheckOpen(false)}>restart gently</button>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setRealityCheckOpen(false)}>not now</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

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
      <div style={{ minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--foreground)' }}>{count}</span>
        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </div>
    </div>
  )
}
