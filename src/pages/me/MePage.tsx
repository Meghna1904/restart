import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'

export default function MePage() {
  const { profile, user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    toast('signed out', 'info')
  }

  return (
    <div className="animate-fade-in" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: 'var(--primary)', color: 'var(--primary-foreground)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', fontWeight: 700
        }}>
          {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--foreground)' }}>
            {profile?.display_name ?? user?.email}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--muted-foreground)' }}>
            {user?.email}
          </p>
        </div>
      </header>

      {/* Settings */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 16 }}>Settings</p>
        
        <div className="gap-stack-sm">
          {/* Theme toggle */}
          <div className="toggle-row" style={{ padding: 0 }}>
            <span style={{ fontSize: '0.9375rem', color: 'var(--foreground)', fontWeight: 500 }}>Theme</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['system', 'dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  style={{
                    background: theme === t ? 'var(--primary)' : 'var(--muted)',
                    color: theme === t ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  onClick={() => setTheme(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        className="btn btn-ghost btn-full"
        style={{ color: 'var(--destructive)', border: '1px solid rgba(174, 32, 18, 0.3)' }}
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  )
}
