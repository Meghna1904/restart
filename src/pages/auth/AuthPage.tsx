import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

export default function AuthPage() {
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleEnter = async (event: React.FormEvent) => {
    event.preventDefault()
    const name = displayName.trim()
    if (!name) return

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: { display_name: name } },
      })
      if (error) throw error
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: data.user.id, display_name: name }, { onConflict: 'id' })
        if (profileError) throw profileError
      }
    } catch (error) {
      toast((error as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cinematic-auth" style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 15% 15%, rgba(126,214,192,.14), transparent 34%), radial-gradient(circle at 85% 85%, rgba(245,199,122,.12), transparent 30%), var(--background)',
    }}>
      <div className="cinematic-auth-brand" style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'grid',
          placeItems: 'center',
          fontSize: '2rem',
          color: 'var(--primary-foreground)',
          margin: '0 auto 16px',
          boxShadow: '0 14px 32px rgba(126, 214, 192, 0.24)',
        }}>
          ✦
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--foreground)', letterSpacing: '-0.06em', marginBottom: 6 }}>restart°</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem' }}>
          a fresh start for your attention
        </p>
      </div>

      <div className="card-elevated cinematic-auth-card" style={{ width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)', background: 'color-mix(in srgb, var(--card) 90%, transparent)' }}>
        <form onSubmit={handleEnter} className="gap-stack">
          <div>
            <label className="label" htmlFor="display-name">What should we call you?</label>
            <input
              id="display-name"
              type="text"
              className="input"
              placeholder="Your name"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              required
              maxLength={80}
              autoComplete="name"
              autoFocus
            />
          </div>
          <button
            id="enter-app-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !displayName.trim()}
          >
            {loading ? 'setting up your space…' : 'enter restart'}
          </button>
        </form>
        <p style={{ marginTop: 18, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.8rem', lineHeight: 1.5 }}>
          No email, password, or account recovery. Your space stays on this browser.
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: '0.8125rem', color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: 320 }}>
        A personal space for loose thoughts, deep focus, and gentle progress.
      </p>
    </div>
  )
}
