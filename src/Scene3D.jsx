import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const GOLD = 0xd9b25b

function labelTexture(draw, w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function makeCoinStack(count, x, z) {
  const g = new THREE.Group()
  const side = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.95, roughness: 0.28 })
  const topTex = labelTexture((ctx, w, h) => {
    const grd = ctx.createRadialGradient(w * .4, h * .35, 10, w / 2, h / 2, w / 2)
    grd.addColorStop(0, '#fff1bf'); grd.addColorStop(.6, '#D9B25B'); grd.addColorStop(1, '#a87e2c')
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(122,85,19,.7)'; ctx.lineWidth = 8
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w * .4, 0, 7); ctx.stroke()
    ctx.fillStyle = '#7a5513'; ctx.font = '700 ' + w * .5 + 'px Georgia, serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('K', w / 2, h / 2 + 8)
  }, 256, 256)
  const top = new THREE.MeshStandardMaterial({ map: topTex, metalness: 0.9, roughness: 0.3 })
  const geo = new THREE.CylinderGeometry(0.55, 0.55, 0.14, 48)
  for (let i = 0; i < count; i++) {
    const m = new THREE.Mesh(geo, [side, top, side])
    m.position.set((Math.random() - .5) * .03, i * 0.16, (Math.random() - .5) * .03)
    m.rotation.y = Math.random() * 6
    g.add(m)
  }
  g.position.set(x, 0, z)
  return g
}

function makeLogbook() {
  const tex = labelTexture((ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#f6f0fa'); g.addColorStop(1, '#cdb8e4')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a0f42'; ctx.font = '700 44px Georgia, serif'; ctx.fillText('VEHICLE LOGBOOK', 44, 90)
    ctx.fillStyle = '#D9B25B'; ctx.fillRect(w - 150, 40, 100, 76)
    ctx.fillStyle = 'rgba(74,29,107,.28)'
    ;[[180, .7], [230, .55], [280, .8], [330, .45]].forEach(([y, f]) => ctx.fillRect(44, y, (w - 88) * f, 18))
    ctx.strokeStyle = '#4A1D6B'; ctx.lineWidth = 6; ctx.strokeRect(w - 190, h - 100, 150, 62)
    ctx.fillStyle = '#4A1D6B'; ctx.font = '700 34px Figtree, sans-serif'; ctx.fillText('24H', w - 160, h - 55)
  }, 768, 480)
  const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.05 })
  const edge = new THREE.MeshStandardMaterial({ color: 0xcdb8e4, roughness: 0.5 })
  const m = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.375, 0.06), [edge, edge, edge, edge, front, edge])
  return m
}

function makeBridge() {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.9, roughness: 0.3, emissive: 0x3a2a08 })
  const arch = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-4.4, 0, 0), new THREE.Vector3(0, 4.4, 0), new THREE.Vector3(4.4, 0, 0))
  g.add(new THREE.Mesh(new THREE.TubeGeometry(arch, 80, 0.04, 8), mat))
  const deck = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.05, 0.4), mat)
  deck.position.y = -0.05
  g.add(deck)
  const cable = new THREE.MeshStandardMaterial({ color: GOLD, metalness: .8, roughness: .4, transparent: true, opacity: .55 })
  for (let i = 1; i < 20; i++) {
    const t = i / 20, p = arch.getPoint(t)
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, p.y, 6), cable)
    l.position.set(p.x, p.y / 2, 0)
    g.add(l)
  }
  return g
}

function makeSparks(n) {
  const pos = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 10; pos[i * 3 + 1] = Math.random() * 5.5 - .5; pos[i * 3 + 2] = (Math.random() - .5) * 5 }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xf3dc9a, size: 0.05, transparent: true, opacity: .8 }))
}

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export default function Scene3D() {
  const mount = useRef(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const el = mount.current
    if (!el) return
    if (!webglOk()) { setFallback(true); return }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    el.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')

    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer)
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
    camera.position.set(0, 2.2, 14)
    camera.lookAt(0, 1.9, 0)
    const key = new THREE.DirectionalLight(0xfff0cc, 2.2); key.position.set(4, 7, 6); scene.add(key)
    const rim = new THREE.PointLight(0x9b5de5, 30, 20); rim.position.set(-5, 3, 3); scene.add(rim)

    const world = new THREE.Group()
    scene.add(world)
    world.add(makeBridge())
    const book = makeLogbook(); book.position.set(-1.6, 3.9, 0.8); book.rotation.set(0.18, 0.45, -0.1); world.add(book)
    world.add(makeCoinStack(5, 1.9, 1.2), makeCoinStack(7, 2.7, 0.6), makeCoinStack(4, 3.4, 1.3))
    const sparks = makeSparks(120); world.add(sparks)

    function resize() {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = Math.min(Math.max(9.6 / (0.611 * camera.aspect), 12), 30)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(el)

    const target = { x: 0, y: 0 }
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - .5) * 2
      target.y = ((e.clientY - r.top) / r.height - .5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let raf = 0, visible = true, glide = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(el)
    const clock = new THREE.Clock()
    function frame() {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const t = clock.getElapsedTime()
      const k = reduce ? 0 : 1
      // glide across the bridge as the hero scrolls away
      const p = k ? Math.min(Math.max(-el.getBoundingClientRect().top / el.clientHeight, 0), 1.2) : 0
      glide += (p - glide) * 0.08
      camera.position.x = glide * 3.2
      camera.position.y = 2.2 + glide * 2.4
      camera.lookAt(glide * 1.2, 1.9 - glide * .4, 0)
      world.rotation.y += ((target.x * .35 - .12 - glide * .5) - world.rotation.y) * 0.05
      world.rotation.x += ((target.y * .12) - world.rotation.x) * 0.05
      book.position.y = 3.9 + Math.sin(t * 1.1) * .12 * k
      book.rotation.z = -0.1 + Math.sin(t * .8) * .03 * k
      sparks.rotation.y = t * .03 * k
      renderer.render(scene, camera)
    }
    frame()

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : [m]).forEach((x) => { x?.map?.dispose?.(); x?.dispose?.() }) })
      pm.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="scene3d" ref={mount}>
      {fallback && <div className="scene-fallback" aria-hidden="true"><span>24h</span></div>}
    </div>
  )
}
