import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

type AuthMode = 'login' | 'magic' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const { toast } = useToast()

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        if (error) throw error
        toast('check your email to confirm your account', 'success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMagicSent(true)
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      background: 'var(--bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, var(--deep-teal), var(--teal))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(10, 147, 150, 0.35)',
        }}>
          ↺
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--heading)', marginBottom: 6 }}>restart</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          {mode === 'signup' ? 'create your account' : 'welcome back'}
        </p>
      </div>

      {/* Card */}
      <div className="card-elevated" style={{ width: '100%', maxWidth: 400 }}>
        {magicSent ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }} className="animate-fade-in">
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📬</div>
            <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>
              check your email
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              we sent a magic link to <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </p>
            <button
              className="btn btn-ghost btn-full"
              style={{ marginTop: 20 }}
              onClick={() => setMagicSent(false)}
            >
              try a different email
            </button>
          </div>
        ) : mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="gap-stack">
            <div>
              <label className="label" htmlFor="magic-email">email</label>
              <input
                id="magic-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <button
              id="magic-link-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'sending…' : 'send magic link'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-full btn-sm"
              onClick={() => setMode('login')}
            >
              use password instead
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailPassword} className="gap-stack">
            {mode === 'signup' && (
              <div>
                <label className="label" htmlFor="display-name">your name</label>
                <input
                  id="display-name"
                  type="text"
                  className="input"
                  placeholder="how should we greet you?"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label" htmlFor="auth-email">email</label>
              <input
                id="auth-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label" htmlFor="auth-password">password</label>
              <input
                id="auth-password"
                type="password"
                className="input"
                placeholder={mode === 'signup' ? 'at least 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            <button
              id="auth-submit-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? '…' : mode === 'signup' ? 'create account' : 'sign in'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-ghost btn-full btn-sm"
                onClick={() => setMode('magic')}
              >
                sign in with magic link instead
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-full btn-sm"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? "don't have an account? sign up" : 'already have an account? sign in'}
              </button>
            </div>
          </form>
        )}
      </div>

      <p style={{ marginTop: 32, fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
        this is your personal space. no streaks, no pressure. just you.
      </p>
    </div>
  )
}
