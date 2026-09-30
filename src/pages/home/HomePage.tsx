import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../contexts/AuthContext'
import { useBrainCounts, useAddBrainItem, useUpdateBrainCategory } from '../../hooks/useBrainDump'
import { useShouldShowNudge, getCurrentNudgeType, getNudgeMessage, useLogNudgeResponse, NUDGES } from '../../hooks/useNudges'
import { greeting } from '../../lib/utils'
import { useToast } from '../../contexts/ToastContext'
import { useAddScrollLog } from '../../hooks/useScrollLogs'
import { useLogRealityCheck } from '../../hooks/useRealityCheck'
import { todayLocal } from '../../lib/utils'
import type { BrainCategory, DistractionReason } from '../../lib/database.types'

function todayLabel() {
  const d = new Date()
  return {
    day: d.toLocaleDateString('en', { weekday: 'long' }),
    date: d.toLocaleDateString('en', { month: 'long', day: 'numeric' })
  }
}

type PriorityId = 'move' | 'study'
type Priority = { id: PriorityId; label: string; icon: string; color: string; steps: string[] }
type Energy = 'low' | 'middle' | 'ready'
type MinimumActivity = 'study' | 'move' | 'read' | 'podcast' | 'journal'

const MINIMUM_VERSIONS: Record<MinimumActivity, { label: string; icon: string; action: string; color: string }> = {
  study: { label: 'Study', icon: 'lucide:book-open', action: 'open the problem and write one example', color: '#f5c77a' },
  move: { label: 'Exercise', icon: 'lucide:footprints', action: 'put on workout clothes', color: '#7ed6c0' },
  read: { label: 'Reading', icon: 'lucide:book-marked', action: 'read one page', color: '#c9a7eb' },
  podcast: { label: 'Podcast', icon: 'lucide:headphones', action: 'listen for five minutes', color: '#f49f8c' },
  journal: { label: 'Journaling', icon: 'lucide:pen-line', action: 'write one honest sentence', color: '#94d2bd' },
}

const ENERGY_COPY: Record<Energy, { label: string; description: string }> = {
  low: { label: 'barely here', description: 'Choose something kind and almost too easy.' },
  middle: { label: 'somewhat available', description: 'There is a little room for one honest step.' },
  ready: { label: 'ready enough', description: 'You can sit with a little more friction today.' },
}

const GOAT_BACKGROUND_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4'

const PRIORITIES: Priority[] = [
  {
    id: 'move',
    label: 'Move',
    icon: 'lucide:footprints',
    color: '#7ed6c0',
    steps: ['put on workout clothes', 'step outside for 5 minutes', 'do one gentle set'],
  },
  {
    id: 'study',
    label: 'Study',
    icon: 'lucide:book-open',
    color: '#f5c77a',
    steps: ['open one Java/DSA problem', 'write what you already know', 'try for 10 minutes before help'],
  },
]

export default function HomePage() {
  const { profile, user } = useAuth()
  const { data: countsData, error: countsError } = useBrainCounts()
  const addBrainItem = useAddBrainItem()
  const updateBrainCategory = useUpdateBrainCategory()
  
  const showNudge = useShouldShowNudge()
  const nudgeType = getCurrentNudgeType()
  const logNudge = useLogNudgeResponse()
  const { toast } = useToast()
  const addScrollLog = useAddScrollLog()
  const logRealityCheck = useLogRealityCheck()
  
  const [dumpText, setDumpText] = useState('')
  const [realityCheckOpen, setRealityCheckOpen] = useState(false)
  const [realityStep, setRealityStep] = useState<'prompt' | 'answer' | 'reason' | 'done'>('prompt')
  const [intendedTask, setIntendedTask] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [priorityState, setPriorityState] = useState<Record<PriorityId, { step: number; done: boolean }>>({
    move: { step: 0, done: false },
    study: { step: 0, done: false },
  })
  const [reflection, setReflection] = useState('')
  const [scrollApp, setScrollApp] = useState('Instagram')
  const [scrollMinutes, setScrollMinutes] = useState('')
  const [scrollReason, setScrollReason] = useState('')
  const [energy, setEnergy] = useState<Energy | null>(null)
  const [minimumActivity, setMinimumActivity] = useState<MinimumActivity>('study')
  const [minimumDone, setMinimumDone] = useState(false)
  const [frictionOpen, setFrictionOpen] = useState(false)
  const [friction, setFriction] = useState('')
  const [dumpSortOpen, setDumpSortOpen] = useState(false)
  const [beforeAiOpen, setBeforeAiOpen] = useState(false)
  const [beforeAi, setBeforeAi] = useState({ understand: '', tried: '', example: '', stuck: '' })

  const [capturedItemId, setCapturedItemId] = useState<string | null>(null)
  const todayKey = `restart-today-${user?.id ?? 'guest'}-${todayLocal()}`
  const noteKey = `${todayKey}-note`
  const scratchpadKey = `${todayKey}-before-ai`

  useEffect(() => {
    const saved = localStorage.getItem(todayKey)
    if (saved) {
      try {
        setPriorityState(JSON.parse(saved) as Record<PriorityId, { step: number; done: boolean }>)
      } catch {
        localStorage.removeItem(todayKey)
      }
    }
    setReflection(localStorage.getItem(noteKey) ?? '')
    setFriction(localStorage.getItem(`${todayKey}-friction`) ?? '')
    setMinimumDone(!!localStorage.getItem(`${todayKey}-minimum`))
    const savedEnergy = localStorage.getItem(`${todayKey}-energy`) as Energy | null
    if (savedEnergy && savedEnergy in ENERGY_COPY) setEnergy(savedEnergy)
    const savedScratchpad = localStorage.getItem(scratchpadKey)
    if (savedScratchpad) {
      try {
        setBeforeAi(JSON.parse(savedScratchpad) as typeof beforeAi)
      } catch {
        localStorage.removeItem(scratchpadKey)
      }
    }
  }, [noteKey, scratchpadKey, todayKey])

  const updatePriority = (id: PriorityId) => {
    setPriorityState(current => {
      const next = {
        ...current,
        [id]: { ...current[id], done: true },
      }
      localStorage.setItem(todayKey, JSON.stringify(next))
      toast(`${id === 'move' ? 'movement' : 'study'} started — that is enough for a beginning`, 'success')
      return next
    })
  }

  const markMinimumDone = () => {
    setMinimumDone(true)
    toast('That small return counts.', 'success')
    localStorage.setItem(`${todayKey}-minimum`, minimumActivity)
  }

  const saveFriction = (value: string) => {
    setFriction(value)
    localStorage.setItem(`${todayKey}-friction`, value)
    setFrictionOpen(false)
    toast('Noted without turning it into a verdict.', 'success')
  }

  const saveBeforeAi = () => {
    localStorage.setItem(scratchpadKey, JSON.stringify(beforeAi))
    setBeforeAiOpen(false)
    toast('Your thinking is saved for this visit.', 'success')
  }

  const chooseAnotherStep = (id: PriorityId) => {
    setPriorityState(current => {
      const priority = PRIORITIES.find(item => item.id === id)!
      const next = {
        ...current,
        [id]: { ...current[id], step: (current[id].step + 1) % priority.steps.length, done: false },
      }
      localStorage.setItem(todayKey, JSON.stringify(next))
      return next
    })
  }

  const handleDump = async () => {
    if (!dumpText.trim()) return
    const item = await addBrainItem.mutateAsync({ content: dumpText, source: 'quick' })
    setDumpText('')
    setCapturedItemId(item.id)
    setDumpSortOpen(true)
  }

  const chooseEnergy = (value: Energy) => {
    setEnergy(value)
    localStorage.setItem(`${todayKey}-energy`, value)
  }

  const updateCapturedCategory = async (id: string, category: BrainCategory) => {
    await updateBrainCategory.mutateAsync({ id, category })
  }

  const finishRealityCheck = (wasOnTask: boolean, distractionReason?: DistractionReason, restarted = false) => {
    logRealityCheck.mutate({
      intendedTask,
      wasOnTask,
      distractionReason,
      restarted,
    })
    setRealityStep('done')
  }

  const { day, date } = todayLabel()
  const counts = countsData?.counts ?? {}

  return (
    <div className="animate-fade-in restart-home" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="home-goat-background" aria-hidden="true">
        <video src={GOAT_BACKGROUND_VIDEO} autoPlay muted loop playsInline preload="metadata" />
      </div>
      <header className="restart-home-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 20 }}>
        <div>
          <span className="restart-kicker">{day} · {date}</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-0.05em', lineHeight: 1.05 }}>Make room<br />for your life.</h1>
        </div>
        <div className="restart-orbit" aria-hidden="true">
          <span />
        </div>
      </header>

      <p style={{ fontSize: '1.05rem', color: 'var(--muted-foreground)', marginBottom: 22 }}>
        {greeting(profile?.display_name ?? user?.user_metadata?.display_name)} You do not have to fix everything today.
      </p>

      <section className="card" style={{ marginBottom: 20, padding: 20, background: 'linear-gradient(145deg, rgba(201,167,235,.11), var(--card))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
          <div>
            <p style={{ color: '#c9a7eb', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Check in, don’t optimise</p>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>How available are you?</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: 5 }}>
              {energy ? ENERGY_COPY[energy].description : 'This changes the size of the suggestion, not your worth.'}
            </p>
          </div>
          <span style={{ fontSize: '1.35rem' }} aria-hidden="true">◌</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 15 }}>
          {(['low', 'middle', 'ready'] as Energy[]).map(level => (
            <button key={level} type="button" className={`btn ${energy === level ? 'btn-primary' : 'btn-ghost'}`} style={{ minHeight: 42, padding: '8px 6px', fontSize: '0.78rem' }} onClick={() => chooseEnergy(level)}>
              {ENERGY_COPY[level].label}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 24, padding: 20, borderColor: 'rgba(126,214,192,.25)', background: 'linear-gradient(145deg, rgba(126,214,192,.1), var(--card))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Icon icon="lucide:rotate-ccw" width={18} style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Return, don’t restart</p>
        </div>
        <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Continue where you left off</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', margin: '6px 0 14px' }}>
          {beforeAi.understand ? 'Your DSA scratchpad is waiting for one more thought.' : 'Nothing needs to be perfectly set up before you begin.'}
        </p>
        <button className="btn btn-secondary" onClick={() => setBeforeAiOpen(true)}>
          {beforeAi.understand ? 'open my scratchpad' : 'choose a place to return'}
        </button>
        {friction && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.76rem', marginTop: 10 }}>Last time, starting felt: {friction}.</p>}
      </section>

      <section className="card" style={{ marginBottom: 24, padding: 20, background: 'linear-gradient(145deg, rgba(245,199,122,.08), var(--card))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'start' }}>
          <div>
            <p style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>The Restart button</p>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.03em' }}>Choose the minimum version</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: 5 }}>Small enough to begin. Real enough to count.</p>
          </div>
          <span style={{ fontSize: '1.35rem' }} aria-hidden="true">✦</span>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 15 }}>
          {(Object.keys(MINIMUM_VERSIONS) as MinimumActivity[]).map(activity => (
            <button key={activity} type="button" className={`tag-pill ${minimumActivity === activity ? 'selected-chip' : ''}`} onClick={() => { setMinimumActivity(activity); setMinimumDone(false) }}>
              {MINIMUM_VERSIONS[activity].label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: 12, borderRadius: 14, background: 'color-mix(in srgb, var(--background) 65%, transparent)' }}>
          <Icon icon={MINIMUM_VERSIONS[minimumActivity].icon} width={21} style={{ color: MINIMUM_VERSIONS[minimumActivity].color, flexShrink: 0 }} />
          <p style={{ flex: 1, fontSize: '0.9rem' }}>{MINIMUM_VERSIONS[minimumActivity].action}</p>
          <button className="btn btn-primary btn-sm" onClick={markMinimumDone} disabled={minimumDone}>{minimumDone ? 'started ✓' : 'I’ll do this'}</button>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 24, padding: 24, background: 'linear-gradient(145deg, rgba(126,214,192,.12), var(--card))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, marginBottom: 18 }}>
          <div>
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>The anti-plan</p>
            <h2 style={{ fontSize: '1.45rem', letterSpacing: '-0.04em' }}>Just two things.</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: 6, maxWidth: 540 }}>
              Move your body. Sit with one hard thing. Everything else can orbit these.
            </p>
          </div>
          <span style={{ fontSize: '1.5rem' }} aria-hidden="true">↗</span>
        </div>
        <div className="priority-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {PRIORITIES.map(priority => {
            const current = priorityState[priority.id]
            return (
              <div key={priority.id} style={{ padding: 16, borderRadius: 16, background: 'color-mix(in srgb, var(--background) 70%, transparent)', border: `1px solid color-mix(in srgb, ${priority.color} 28%, transparent)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                  <Icon icon={priority.icon} width={20} style={{ color: priority.color }} />
                  <strong>{priority.label}</strong>
                  {current.done && <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: '0.8rem' }}>done gently ✓</span>}
                </div>
                <p style={{ minHeight: 42, color: 'var(--muted-foreground)', fontSize: '0.88rem', lineHeight: 1.45 }}>
                  {current.done ? 'That was enough for today.' : priority.steps[current.step]}
                </p>
                {!current.done && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => updatePriority(priority.id)}>minimum version</button>
                    <button className="btn btn-ghost btn-sm" aria-label={`Choose another ${priority.label.toLowerCase()} step`} onClick={() => chooseAnotherStep(priority.id)}>↻</button>
                  </div>
                )}
                {!current.done && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => setFrictionOpen(true)}>not today — why is starting hard?</button>}
              </div>
            )
          })}
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        <div className="section-header" style={{ marginBottom: 10 }}>
          <h2 className="section-title">A note for the version of you who over-plans</h2>
        </div>
        <textarea
          className="input"
          placeholder="Today can be smaller than the life you imagined..."
          value={reflection}
          onChange={event => setReflection(event.target.value)}
          onBlur={() => localStorage.setItem(noteKey, reflection)}
          aria-label="A small note for today"
          style={{ minHeight: 72, background: 'transparent', borderStyle: reflection ? 'solid' : 'dashed', resize: 'vertical' }}
        />
        {reflection && <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', marginTop: 6 }}>kept in this browser · no score attached</p>}
      </section>

      <section className="card scroll-card" style={{ marginBottom: 24, padding: 22, background: 'linear-gradient(145deg, rgba(245,199,122,.1), var(--card))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
          <div>
            <p style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Notice, don’t punish</p>
            <h2 style={{ fontSize: '1.3rem', letterSpacing: '-0.03em' }}>How did scrolling fit today?</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: 5 }}>A rough memory is useful. You never need to track it live.</p>
          </div>
          <span className="scroll-orbit" aria-hidden="true">◌</span>
        </div>
        <div className="scroll-form" style={{ display: 'grid', gridTemplateColumns: '1fr 0.75fr', gap: 8, marginTop: 16 }}>
          <select className="input" value={scrollApp} onChange={event => setScrollApp(event.target.value)} aria-label="App">
            <option>Instagram</option>
            <option>YouTube</option>
            <option>Shorts</option>
            <option>Reddit</option>
            <option>Other</option>
          </select>
          <div style={{ position: 'relative' }}>
            <input className="input" type="number" min="1" max="1440" placeholder="minutes" value={scrollMinutes} onChange={event => setScrollMinutes(event.target.value)} aria-label="Minutes scrolled" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {['bored', 'avoiding', 'tired', 'habit'].map(reason => (
            <button key={reason} type="button" className={`tag-pill ${scrollReason === reason ? 'selected-chip' : ''}`} onClick={() => setScrollReason(scrollReason === reason ? '' : reason)}>{reason}</button>
          ))}
        </div>
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 14 }}
          disabled={!scrollMinutes || addScrollLog.isPending}
          onClick={async () => {
            await addScrollLog.mutateAsync({ app: scrollApp, minutes: Number(scrollMinutes), reason: scrollReason })
            setScrollMinutes('')
            setScrollReason('')
          }}
        >
          {addScrollLog.isPending ? 'noting it…' : 'save a rough note'}
        </button>
      </section>

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
        {dumpSortOpen && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: 'color-mix(in srgb, var(--primary) 9%, transparent)' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 9 }}>Captured. What should this become?</p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {[
                ['keep as a thought', 'random'],
                ['tiny action', 'remember'],
                ['question to revisit', 'learn'],
                ['let it rest', 'random'],
              ].map(([choice, category]) => (
                <button key={choice} type="button" className="btn btn-ghost btn-sm" onClick={async () => {
                  if (capturedItemId) {
                    await updateCapturedCategory(capturedItemId, category as BrainCategory)
                  }
                  setDumpSortOpen(false)
                  toast(choice === 'let it rest' ? 'It can rest here.' : `Saved as ${choice}.`, 'success')
                }}>{choice}</button>
              ))}
            </div>
          </div>
        )}
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

      {frictionOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setFrictionOpen(false)}>
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="friction-title" onClick={event => event.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="section-title" style={{ color: 'var(--primary)', marginBottom: 8 }}>No blame, just information</p>
            <h2 id="friction-title" style={{ fontSize: '1.55rem', letterSpacing: '-0.04em' }}>What made starting hard?</h2>
            <p style={{ color: 'var(--muted-foreground)', margin: '8px 0 20px', fontSize: '0.9rem' }}>This is a clue for next time, not a reason to judge today.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['too tired', 'too unclear', 'too large', 'distracted', 'avoiding discomfort', 'not interested today'].map(option => (
                <button key={option} className={`btn ${friction === option ? 'btn-primary' : 'btn-ghost'}`} onClick={() => saveFriction(option)}>{option}</button>
              ))}
            </div>
          </section>
        </div>
      )}

      {beforeAiOpen && (
        <div className="modal-overlay" role="presentation" onClick={() => setBeforeAiOpen(false)}>
          <section className="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="scratchpad-title" onClick={event => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16 }}>
              <div>
                <p className="section-title" style={{ color: 'var(--accent)', marginBottom: 8 }}>Before AI</p>
                <h2 id="scratchpad-title" style={{ fontSize: '1.55rem', letterSpacing: '-0.04em' }}>Give your own brain a minute.</h2>
              </div>
              <button className="btn btn-ghost btn-sm" aria-label="Close scratchpad" onClick={() => setBeforeAiOpen(false)}>✕</button>
            </div>
            <p style={{ color: 'var(--muted-foreground)', margin: '8px 0 18px', fontSize: '0.9rem' }}>Write anything you know before looking for an explanation. Rough is the point.</p>
            <div className="gap-stack">
              {([
                ['understand', 'What do I understand so far?'],
                ['tried', 'What have I tried?'],
                ['example', 'What is one example?'],
                ['stuck', 'What exactly is confusing?'],
              ] as const).map(([key, placeholder]) => (
                <textarea key={key} className="input" placeholder={placeholder} value={beforeAi[key]} onChange={event => setBeforeAi(current => ({ ...current, [key]: event.target.value }))} style={{ minHeight: 58, resize: 'vertical' }} />
              ))}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={saveBeforeAi}>save my thinking</button>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', textAlign: 'center', marginTop: 9 }}>When you’re ready, open help without losing your own attempt.</p>
          </section>
        </div>
      )}

      {countsError && (
        <div className="card" role="alert" style={{ marginBottom: 14, borderColor: 'var(--destructive)', color: 'var(--destructive)', fontSize: '0.85rem' }}>
          Your space is connected, but the brain table is not ready yet. Run the latest Supabase migrations, then refresh.
        </div>
      )}

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
                  <button className="btn btn-primary" onClick={() => finishRealityCheck(true)}>yes, I am</button>
                  <button className="btn btn-ghost" onClick={() => setRealityStep('reason')}>not really</button>
                </div>
              </div>
            )}

            {realityStep === 'reason' && (
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: 14 }}>What happened?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['tired', 'tired'],
                    ['distracted', 'distracted'],
                    ['avoiding it', 'avoiding'],
                    ['wanted entertainment', 'entertainment'],
                    ['forgot', 'unknown'],
                    ['got carried away', 'distracted'],
                  ].map(([label]) => (
                    <button key={label} className={`btn ${selectedReason === label ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelectedReason(label)}>
                      {label}
                    </button>
                  ))}
                </div>
                <button className="btn btn-cta btn-full" style={{ marginTop: 16 }} disabled={!selectedReason || logRealityCheck.isPending} onClick={() => {
                  const reasonMap: Record<string, DistractionReason> = {
                    tired: 'tired',
                    distracted: 'distracted',
                    'avoiding it': 'avoiding',
                    'wanted entertainment': 'entertainment',
                    forgot: 'unknown',
                    'got carried away': 'distracted',
                  }
                  finishRealityCheck(false, reasonMap[selectedReason], true)
                }}>okay, thanks for noticing</button>
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
