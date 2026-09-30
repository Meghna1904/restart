export default function SetupPage() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'radial-gradient(circle at 20% 10%, rgba(126,214,192,.16), transparent 32%), var(--background)',
      color: 'var(--foreground)',
    }}>
      <section className="card-elevated" style={{ width: 'min(100%, 560px)', padding: 32, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, display: 'grid', placeItems: 'center', background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: 24, marginBottom: 24 }}>✦</div>
        <p className="section-title" style={{ marginBottom: 12, color: 'var(--primary)' }}>one last step</p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', letterSpacing: '-0.05em', marginBottom: 12 }}>Connect your space</h1>
        <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
          Replace the placeholder values in <code>.env.local</code> with your Supabase project URL and publishable or anon key, then restart the dev server.
        </p>
        <div className="card" style={{ marginTop: 24, background: 'var(--surface-2)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
          VITE_SUPABASE_URL<br />VITE_SUPABASE_ANON_KEY
        </div>
      </section>
    </main>
  )
}
