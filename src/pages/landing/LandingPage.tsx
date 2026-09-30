import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4',
  story: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4',
  metrics: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4',
  technology: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4',
  footer: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4',
}

function BackgroundVideo({ src, scrub = false }: { src: string; scrub?: boolean }) {
  return <video className="landing-video" src={src} muted playsInline loop={!scrub} autoPlay={!scrub} preload="metadata" aria-hidden="true" />
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroVideo, setHeroVideo] = useState<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!heroVideo) return
    const handleMove = (event: MouseEvent) => {
      if (!heroVideo.duration || window.matchMedia('(max-width: 700px)').matches) return
      heroVideo.currentTime = (event.clientX / window.innerWidth) * heroVideo.duration
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [heroVideo])

  return (
    <main className="landing-page">
      <nav className={`landing-nav ${menuOpen ? 'is-open' : ''}`}>
        <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>RESTART<span>°</span></button>
        <button className="landing-menu-toggle" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation">
          <span /><span /><span />
        </button>
        <div className="landing-links">
          <button onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>why restart</button>
          <button onClick={() => document.getElementById('patterns')?.scrollIntoView({ behavior: 'smooth' })}>patterns</button>
        </div>
        <button className="landing-enter" onClick={() => navigate('/auth')}>enter your space <span>↗</span></button>
      </nav>

      <section className="landing-hero">
        <div className="landing-video-layer"><video ref={setHeroVideo} className="landing-video" src={VIDEOS.hero} muted playsInline preload="auto" aria-hidden="true" /></div>
        <div className="landing-grid" />
        <div className="landing-watermark">RESTART</div>
        <div className="landing-hero-copy">
          <div>
            <span className="landing-eyebrow">a gentler interface for attention</span>
            <h1>Brain<br />And Body</h1>
            <p>For the days when you have a hundred plans and only enough energy for one honest beginning.</p>
          </div>
          <h2>One<br />Return</h2>
        </div>
        <button className="landing-scroll-cue" onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}>scroll to begin ↓</button>
      </section>

      <section id="story" className="landing-section landing-story">
        <BackgroundVideo src={VIDEOS.story} />
        <div className="landing-section-shade" />
        <p className="landing-big-copy">Restart is a personal space for loose thoughts, difficult beginnings, and the quiet practice of coming back to yourself.</p>
      </section>

      <section id="patterns" className="landing-section landing-metrics">
        <BackgroundVideo src={VIDEOS.metrics} />
        <div className="landing-section-content">
          <span className="landing-eyebrow">what it holds</span>
          <div className="landing-metric-grid">
            <div><strong>01</strong><span>Brain dumps<br />without judgement</span></div>
            <div><strong>02</strong><span>Minimum versions<br />of hard things</span></div>
            <div><strong>03</strong><span>Patterns you can<br />notice, not optimise</span></div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-technology">
        <BackgroundVideo src={VIDEOS.technology} />
        <div className="landing-section-content">
          <div className="landing-two-column">
            <h2>Attention<br />without force.</h2>
            <p>The system learns what helps you return: smaller steps, honest notes, and enough room to be a person.</p>
          </div>
          <div className="landing-principles">
            {['Capture what is loud', 'Make the first step smaller', 'Notice without scoring', 'Return without starting over'].map((item, index) => (
              <div key={item}><span>0{index + 1}</span><p>{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-architecture">
        <span className="landing-eyebrow">the shape of restart</span>
        <h2>Three layers.<br />Zero pressure.</h2>
        <p>Your inner noise becomes something you can see, sort, and gently act on—without turning your life into a dashboard.</p>
        <div className="landing-layers">
          <div><span>layer 01</span><strong>Capture</strong></div>
          <div><span>layer 02</span><strong>Understand</strong></div>
          <div><span>layer 03</span><strong>Return</strong></div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-video"><BackgroundVideo src={VIDEOS.footer} /></div>
        <div className="landing-footer-copy">
          <div>
            <div className="landing-brand">RESTART<span>°</span></div>
            <p>A softer operating system for the person you are becoming. Move, study, notice, and begin again.</p>
          </div>
          <button className="landing-enter" onClick={() => navigate('/auth')}>make room for your life <span>↗</span></button>
        </div>
      </footer>
    </main>
  )
}
