import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useToast } from '../../contexts/ToastContext'

type FocusOption = { id: string; label: string; icon: string; defaultMin: number }

const OPTIONS: FocusOption[] = [
  { id: 'code', label: 'Code / Study', icon: 'lucide:code', defaultMin: 45 },
  { id: 'move', label: 'Move / Walk', icon: 'lucide:footprints', defaultMin: 20 },
  { id: 'read', label: 'Read', icon: 'lucide:book-open', defaultMin: 30 },
  { id: 'admin', label: 'Life Admin', icon: 'lucide:clipboard-list', defaultMin: 15 },
]

export default function FocusPage() {
  const [activeFocus, setActiveFocus] = useState<{ option: FocusOption, startTime: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (!activeFocus) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeFocus.startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeFocus])

  const handleStart = (opt: FocusOption) => {
    setActiveFocus({ option: opt, startTime: Date.now() })
    setElapsed(0)
    toast(`Started ${opt.label}`, 'success')
  }

  const handleStop = () => {
    if (!activeFocus) return
    const minutes = Math.round(elapsed / 60)
    toast(`Logged ${minutes}m of ${activeFocus.option.label}`, 'success')
    setActiveFocus(null)
  }

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>
          Focus
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginTop: 4 }}>
          Pick one thing. Just do that.
        </p>
      </header>

      {!activeFocus ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              className="card"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '24px 12px', minHeight: 140, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card)'
              }}
              onClick={() => handleStart(opt)}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon icon={opt.icon} width={24} height={24} style={{ color: 'var(--primary)' }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{opt.label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 4 }}>
                Suggests {opt.defaultMin}m
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '32px 20px', textAlign: 'center', border: '1px solid var(--primary)', background: 'rgba(10, 147, 150, 0.05)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon icon={activeFocus.option.icon} width={32} height={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            Focusing on {activeFocus.option.label}
          </h2>
          <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--foreground)', marginBottom: 24, fontVariantNumeric: 'tabular-nums' }}>
            {Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}
          </div>
          
          <button className="btn btn-ghost btn-full" onClick={handleStop} style={{ border: '1px solid var(--border)' }}>
            Stop & Log
          </button>
          
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: 20 }}>
            You can leave this page. The timer will keep running.
          </p>
        </div>
      )}
    </div>
  )
}
