import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { company, pills, about, services, alsoOffer, stats, vision, mission, offices, contact } from './content.js'

const Scene3D = lazy(() => import('./Scene3D.jsx'))
const extra = () => import('./Extra3D.jsx')
const CrestCoin = lazy(() => extra().then((m) => ({ default: m.CrestCoin })))
const ServiceIcon = lazy(() => extra().then((m) => ({ default: m.ServiceIcon })))
const OfficeMap = lazy(() => extra().then((m) => ({ default: m.OfficeMap })))
const CoinOrbit = lazy(() => extra().then((m) => ({ default: m.CoinOrbit })))

const NAV = [['about', 'About'], ['services', 'Services'], ['offices', 'Offices'], ['contact', 'Contact']]
const tel = (s) => 'tel:+254' + s.replace(/\s/g, '').replace(/^0/, '')

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal()
  return <Tag ref={ref} className={`reveal ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>{children}</Tag>
}

function Crest({ size = 38 }) {
  return <span className="crest" style={{ width: size, height: size, fontSize: size * 0.58 }}>K</span>
}

function Header() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const f = () => setSolid(window.scrollY > 20)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <header className={`top ${solid ? 'solid' : ''}`}>
      <div className="wrap top-in">
        <a href="#top" className="brand" onClick={() => setOpen(false)}><Crest /><span>{company.name}</span></a>
        <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}><span /><span /><span /></button>
        <nav className={open ? 'open' : ''}>
          {NAV.map(([id, t]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{t}</a>)}
          <a className="btn small" href={tel(contact.phone)}>Call us</a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      <div className="wrap hero-in">
        <div className="hero-text">
          <p className="eyebrow">{company.tagline} · Since {company.est}</p>
          <h1>{company.headline[0]} <em>{company.headline[1]}</em></h1>
          <p className="lead">{company.lead}</p>
          <div className="hero-cta">
            <a className="btn" href="#contact">Apply today</a>
            <a className="btn ghost" href="#services">Our services</a>
          </div>
          <ul className="pills">{pills.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="hero-scene">
          <Suspense fallback={null}><Scene3D /></Suspense>
          <div className="badge24"><b>24h</b><span>processing</span></div>
        </div>
      </div>
      <a className="scroll" href="#about" aria-label="Scroll down"><i /></a>
    </section>
  )
}

function Count({ to, suffix = '', plain }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now(), dur = 1400
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <b ref={ref}>{plain ? v : v}{suffix}</b>
}

function Stats() {
  return (
    <div className="stats">
      <div className="wrap stats-in">
        {stats.map((s) => (
          <div key={s.label}><Count to={s.value} suffix={s.suffix} plain={s.plain} /><span>{s.label}</span></div>
        ))}
      </div>
    </div>
  )
}

function About() {
  return (
    <section id="about" className="section">
      <div className="wrap about">
        <Reveal>
          <p className="label">About Kifedha</p>
          <h2>A micro lender built to bridge you to what's next</h2>
          <p className="body">{about.intro}</p>
          <div className="arms">
            {about.arms.map((a) => (
              <article className="arm" key={a.label}>
                <p className="label">{a.label}</p>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))}
          </div>
        </Reveal>
        <Reveal className="about-visual" delay={120}>
          <Suspense fallback={<div className="stage3d crest-stage" />}><CrestCoin /></Suspense>
          <div className="logo-card"><img src="/images/kifedha-logo.png" alt="Kifedha Limited, Your Financial Bridge" /></div>
        </Reveal>
      </div>
    </section>
  )
}

function Tilt({ children, className = '' }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5
    el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 12}deg) translateZ(0)`
    el.style.setProperty('--gx', `${(x + .5) * 100}%`); el.style.setProperty('--gy', `${(y + .5) * 100}%`)
  }
  const leave = () => { if (ref.current) ref.current.style.transform = '' }
  return <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>{children}</div>
}

function Services() {
  return (
    <section id="services" className="section tint">
      <div className="wrap">
        <Reveal><p className="label">Our services</p><h2>Three ways we bridge you to what's next</h2></Reveal>
        <div className="svcs">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <Tilt className="svc">
                <div className={`ph ${s.kind === 'card' ? 'cardph' : ''}`} style={s.img ? { backgroundImage: `url(${s.img})` } : undefined} role={s.img ? 'img' : undefined} aria-label={s.alt}>
                  <span className="n">{s.n}</span>
                  <Suspense fallback={null}><ServiceIcon kind={s.icon} /></Suspense>
                </div>
                <div className="body"><h3>{s.title}</h3><p>{s.text}</p></div>
              </Tilt>
            </Reveal>
          ))}
        </div>
        <Reveal className="also">
          <h3>Also from Kifedha</h3>
          <ul>{alsoOffer.map((a) => <li key={a.title}><b>{a.title}</b><span>{a.text}</span></li>)}</ul>
        </Reveal>
      </div>
    </section>
  )
}

function VisionMission() {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal><p className="label">Vision and mission</p><h2>Financial change that lasts</h2></Reveal>
        <div className="vm">
          <Reveal><div className="vm-card"><h3>Vision</h3><p>{vision}</p></div></Reveal>
          <Reveal delay={120}><div className="vm-card"><h3>Mission</h3><p>{mission}</p></div></Reveal>
        </div>
      </div>
    </section>
  )
}

function Offices() {
  const [active, setActive] = useState(0)
  return (
    <section id="offices" className="section tint">
      <div className="wrap">
        <Reveal><p className="label">Find us</p><h2>Four offices, one bridge</h2></Reveal>
        <Reveal className="map-wrap">
          <Suspense fallback={<div className="stage3d map-stage" />}><OfficeMap offices={offices} active={active} onPick={setActive} /></Suspense>
          <p className="map-hint">Tap a pin to see that office</p>
        </Reveal>
        <div className="offices">
          {offices.map((o, i) => (
            <Reveal key={o.name} delay={i * 90}>
              <article className={`office ${active === i ? 'on' : ''}`} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                <span className="pin" aria-hidden="true" />
                <h3>{o.name}</h3>
                <p>{o.where}{o.po && <><br />{o.po}</>}</p>
                <a href={tel(o.phone)}>{o.phone}</a>
                <a href={`mailto:${o.email}`}>{o.email}</a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  async function submit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    try {
      const r = await fetch(`https://formspree.io/f/${contact.formspree}`, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      if (r.ok) setSent(true)
    } catch { /* leave form visible */ }
  }
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <Reveal className="cta">
          <Suspense fallback={null}><CoinOrbit /></Suspense>
          <div className="cta-text">
            <p className="label">Contact us</p>
            <h2>Need funds in 24 hours?</h2>
            <p className="body">Call or email our head office. Mobile {contact.phone.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3')}.</p>
            <div className="hero-cta">
              <a className="btn" href={tel(contact.phone)}>Call head office</a>
              <a className="btn ghost" href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
          </div>
          {contact.formspree && (sent ? <p className="thanks">Thank you. We will be in touch.</p> : (
            <form onSubmit={submit}>
              <input name="name" placeholder="Your name" required />
              <input name="phone" placeholder="Phone number" required />
              <textarea name="message" placeholder="How can we help?" rows="3" required />
              <button className="btn" type="submit">Send message</button>
            </form>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <About />
        <Services />
        <VisionMission />
        <Offices />
        <Contact />
      </main>
      <footer className="foot">
        <div className="wrap">
          <p>© {new Date().getFullYear()} {company.name} · {company.tagline}</p>
          <p>Built by SpenceTec and Logistics Limited</p>
        </div>
      </footer>
      <div className="sticky-cta">
        <a className="btn" href="#contact">Apply today</a>
        <a className="btn ghost" href={tel(contact.phone)}>Call us</a>
      </div>
    </>
  )
}
