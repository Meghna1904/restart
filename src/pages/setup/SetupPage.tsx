export default function SetupPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      <section className="card-elevated" style={{ width: 'min(100%, 480px)', padding: 28 }}>
        <p className="section-title" style={{ marginBottom: 12 }}>setup required</p>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--heading)', marginBottom: 12 }}>Connect Restart to Supabase</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Replace the placeholder values in <code>.env.local</code> with your Supabase project URL and publishable or anon key, then restart the dev server.
        </p>
      </section>
    </main>
  )
}
