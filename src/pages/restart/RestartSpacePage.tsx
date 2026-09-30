import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useAddBrainItem } from '../../hooks/useBrainDump'
import { useAddScrollLog } from '../../hooks/useScrollLogs'
import { todayLocal } from '../../lib/utils'

type Activity = 'study' | 'move' | 'read' | 'podcast' | 'journal'

const ACTIVITIES: Record<Activity, { label: string; icon: string; action: string }> = {
  study: { label: 'Study', icon: 'lucide:book-open', action: 'open the problem and write one example' },
  move: { label: 'Exercise', icon: 'lucide:footprints', action: 'put on workout clothes' },
  read: { label: 'Reading', icon: 'lucide:book-marked', action: 'read one page' },
  podcast: { label: 'Podcast', icon: 'lucide:headphones', action: 'listen for five minutes' },
  journal: { label: 'Journaling', icon: 'lucide:pen-line', action: 'write one honest sentence' },
}

export default function RestartSpacePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const addBrainItem = useAddBrainItem()
  const addScrollLog = useAddScrollLog()
  const key = `restart-space-${user?.id ?? 'guest'}-${todayLocal()}`
  const [activity, setActivity] = useState<Activity>('study')
  const [started, setStarted] = useState(false)
  const [scratchpad, setScratchpad] = useState({ understand: '', tried: '', example: '', stuck: '' })
  const [reflection, setReflection] = useState('')
  const [dump, setDump] = useState('')
  const [scrollApp, setScrollApp] = useState('Instagram')
  const [scrollMinutes, setScrollMinutes] = useState('')
  const [scrollReason, setScrollReason] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (!stored) return
    try {
      const data = JSON.parse(stored) as { activity?: Activity; started?: boolean; scratchpad?: typeof scratchpad; reflection?: string }
      if (data.activity) setActivity(data.activity)
      setStarted(!!data.started)
      setScratchpad(data.scratchpad ?? { understand: '', tried: '', example: '', stuck: '' })
      setReflection(data.reflection ?? '')
    } catch {
      localStorage.removeItem(key)
    }
  }, [key])

  const persist = (next: Partial<{ activity: Activity; started: boolean; scratchpad: typeof scratchpad; reflection: string }>) => {
    const current = { activity, started, scratchpad, reflection, ...next }
    localStorage.setItem(key, JSON.stringify(current))
  }

  const saveScratchpad = () => {
    persist({ scratchpad })
    setSaved(true)
    toast('Your thinking is saved for when you return.', 'success')
    window.setTimeout(() => setSaved(false), 1800)
  }

  const handleDump = async () => {
    if (!dump.trim()) return
    await addBrainItem.mutateAsync({ content: dump, source: 'restart-space' })
    setDump('')
    toast('Captured. You can sort it later in Brain.', 'success')
  }

  return (
    <div className="animate-fade-in restart-space-page">
      <header className="restart-space-header">
        <span className="restart-kicker">your restart space</span>
        <h1>Small doors<br />back in.</h1>
        <p>Use one of these when you want support, not another plan.</p>
      </header>

      <section className="restart-space-feature card">
        <div className="restart-space-section-label"><Icon icon="lucide:sparkles" width={16} /> the minimum version</div>
        <h2>What is the smallest way to return?</h2>
        <div className="restart-space-pills">
          {(Object.keys(ACTIVITIES) as Activity[]).map(item => (
            <button key={item} className={`tag-pill ${activity === item ? 'selected-chip' : ''}`} onClick={() => { setActivity(item); setStarted(false); persist({ activity: item, started: false }) }}>{ACTIVITIES[item].label}</button>
          ))}
        </div>
        <div className="restart-space-action">
          <Icon icon={ACTIVITIES[activity].icon} width={22} />
          <span>{ACTIVITIES[activity].action}</span>
          <button className="btn btn-primary btn-sm" disabled={started} onClick={() => { setStarted(true); persist({ started: true }); toast('That small return counts.', 'success') }}>{started ? 'started ✓' : 'I’ll do this'}</button>
        </div>
      </section>

      <section className="restart-space-grid">
        <div className="card restart-space-panel">
          <div className="restart-space-section-label"><Icon icon="lucide:rotate-ccw" width={16} /> continue</div>
          <h2>Before AI</h2>
          <p>Give your own brain one minute before searching for help.</p>
          <div className="restart-space-fields">
            {([
              ['understand', 'What do I understand so far?'],
              ['tried', 'What have I tried?'],
              ['example', 'What is one example?'],
              ['stuck', 'What exactly is confusing?'],
            ] as const).map(([field, placeholder]) => (
              <textarea key={field} className="input" placeholder={placeholder} value={scratchpad[field]} onChange={event => setScratchpad(current => ({ ...current, [field]: event.target.value }))} />
            ))}
          </div>
          <button className="btn btn-secondary btn-full" onClick={saveScratchpad}>{saved ? 'saved ✓' : 'save my thinking'}</button>
        </div>

        <div className="card restart-space-panel">
          <div className="restart-space-section-label"><Icon icon="lucide:pen-line" width={16} /> reflection</div>
          <h2>One honest sentence</h2>
          <p>No perfect journal entry needed.</p>
          <textarea className="input restart-space-reflection" placeholder="Right now, I..." value={reflection} onChange={event => setReflection(event.target.value)} onBlur={() => persist({ reflection })} />
          <span className="restart-space-hint">saved privately in this browser</span>
        </div>
      </section>

      <section className="restart-space-grid">
        <div className="card restart-space-panel">
          <div className="restart-space-section-label"><Icon icon="lucide:brain" width={16} /> capture</div>
          <h2>Get it out of your head</h2>
          <p>Loose thought, question, idea—it does not need a category yet.</p>
          <textarea className="input" placeholder="Something I keep thinking about..." value={dump} onChange={event => setDump(event.target.value)} />
          <button className="btn btn-primary btn-full" disabled={!dump.trim() || addBrainItem.isPending} onClick={handleDump}>{addBrainItem.isPending ? 'capturing…' : 'capture thought'}</button>
        </div>

        <div className="card restart-space-panel">
          <div className="restart-space-section-label"><Icon icon="lucide:smartphone-off" width={16} /> notice</div>
          <h2>Scrolling, remembered</h2>
          <p>A rough note is enough. No live tracking.</p>
          <div className="restart-space-scroll-fields">
            <select className="input" value={scrollApp} onChange={event => setScrollApp(event.target.value)}><option>Instagram</option><option>YouTube</option><option>Shorts</option><option>Reddit</option><option>Other</option></select>
            <input className="input" type="number" min="1" placeholder="minutes" value={scrollMinutes} onChange={event => setScrollMinutes(event.target.value)} />
          </div>
          <div className="restart-space-pills">
            {['bored', 'avoiding', 'tired', 'habit'].map(reason => <button key={reason} className={`tag-pill ${scrollReason === reason ? 'selected-chip' : ''}`} onClick={() => setScrollReason(scrollReason === reason ? '' : reason)}>{reason}</button>)}
          </div>
          <button className="btn btn-secondary btn-full" disabled={!scrollMinutes || addScrollLog.isPending} onClick={async () => { await addScrollLog.mutateAsync({ app: scrollApp, minutes: Number(scrollMinutes), reason: scrollReason }); setScrollMinutes(''); setScrollReason('') }}>{addScrollLog.isPending ? 'noting…' : 'save rough note'}</button>
        </div>
      </section>
    </div>
  )
}
