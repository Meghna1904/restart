import { useMemo } from 'react'
import { Icon } from '@iconify/react'
import { useBrainItems } from '../../hooks/useBrainDump'
import { useScrollLogs } from '../../hooks/useScrollLogs'

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr 36px', alignItems: 'center', gap: 10, marginTop: 12 }}>
      <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ height: 9, borderRadius: 99, background: 'var(--muted)', overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(6, (value / max) * 100)}%`, height: '100%', borderRadius: 99, background: color, transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ color: 'var(--foreground)', fontSize: '0.8rem', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function InsightsPage() {
  const { data: items = [], isLoading: itemsLoading } = useBrainItems()
  const { data: scrollLogs = [], isLoading: scrollLoading } = useScrollLogs()

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach(item => counts.set(item.category, (counts.get(item.category) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [items])

  const appTotals = useMemo(() => {
    const totals = new Map<string, number>()
    scrollLogs.forEach(log => totals.set(log.app, (totals.get(log.app) ?? 0) + log.minutes))
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [scrollLogs])

  const reasonCounts = useMemo(() => {
    const counts = new Map<string, number>()
    scrollLogs.forEach(log => {
      if (log.reason) counts.set(log.reason, (counts.get(log.reason) ?? 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [scrollLogs])

  const totalMinutes = scrollLogs.reduce((sum, log) => sum + log.minutes, 0)
  const topCategory = categoryCounts[0]?.[0]
  const topApp = appTotals[0]?.[0]
  const topReason = reasonCounts[0]?.[0]
  const loading = itemsLoading || scrollLoading

  return (
    <div className="animate-fade-in" style={{ paddingTop: 40, paddingBottom: 72 }}>
      <header style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>A mirror, not a scoreboard</p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.05em' }}>Patterns</h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: 8, maxWidth: 580 }}>
          A few soft clues from what you have captured. Nothing here is a grade.
        </p>
      </header>

      <section className="insight-hero" style={{ marginBottom: 16 }}>
        <span className="insight-spark" aria-hidden="true">✦</span>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>right now</p>
        <h2 style={{ marginTop: 8, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>
          {loading ? 'collecting a few clues…' : topCategory ? `Your thoughts keep circling ${topCategory}.` : 'Your patterns will appear here.'}
        </h2>
        <p style={{ color: 'var(--muted-foreground)', marginTop: 8, lineHeight: 1.55 }}>
          {topApp ? `You have noted ${totalMinutes} minutes around ${topApp}. That is information, not a verdict.` : 'Capture a few thoughts or rough scroll notes and this space will gently reflect them back.'}
        </p>
      </section>

      <div className="insight-grid">
        <section className="card">
          <div className="insight-heading">
            <div><span className="insight-icon">☼</span><h2>What your mind returns to</h2></div>
            <span className="section-title">captures</span>
          </div>
          {categoryCounts.length ? categoryCounts.map(([label, value]) => (
            <Bar key={label} label={label} value={value} max={categoryCounts[0][1]} color="var(--primary)" />
          )) : <p className="empty-insight">A few brain dumps will make this more interesting.</p>}
        </section>

        <section className="card">
          <div className="insight-heading">
            <div><span className="insight-icon">◌</span><h2>Scrolling, remembered</h2></div>
            <span className="section-title">rough notes</span>
          </div>
          {appTotals.length ? appTotals.map(([label, value]) => (
            <Bar key={label} label={label} value={value} max={appTotals[0][1]} color="var(--accent)" />
          )) : <p className="empty-insight">No tracking required. Add a rough note when it feels useful.</p>}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="insight-heading">
          <div><Icon icon="lucide:message-circle-heart" width={20} /><h2>Something to notice</h2></div>
        </div>
        <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          {topReason ? `“${topReason}” shows up in your scroll notes most often. You do not need to fix it. Just knowing is enough for now.` : 'Patterns are not problems to solve. Keep collecting only what helps you understand yourself.'}
        </p>
      </section>
    </div>
  )
}
