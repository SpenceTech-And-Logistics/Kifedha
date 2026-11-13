// The smaller 3D scenes below the hero: crest coin (About), service icons,
// office map (Find us) and coin orbit (Contact). Loaded on demand.
import { useEffect, useRef, useState } from 'react'
import { THREE, GOLD, gold, canvasTexture, coinFaceTexture, mountScene } from './three-kit.js'

function useScene(setup, opts, deps = []) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const stop = mountScene(ref.current, setup, opts)
    if (!stop) setFailed(true)
    return () => stop?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return [ref, failed]
}

function makeCoin(r = 1, depth = .22, seg = 64) {
  const face = new THREE.MeshStandardMaterial({ map: coinFaceTexture(), metalness: .9, roughness: .28 })
  const rim = gold()
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, seg), [rim, face, face])
  return m
}

/* ---------- About: the crest coin ---------- */
export function CrestCoin() {
  const [ref, failed] = useScene(({ scene }) => {
    const coin = makeCoin(1.55, .32, 96)
    coin.rotation.x = Math.PI / 2
    const pivot = new THREE.Group(); pivot.add(coin); scene.add(pivot)
    // reeded edge ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.58, .05, 12, 120), gold({ roughness: .4 }))
    pivot.add(ring)
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.3, .012, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9b5de5, transparent: true, opacity: .6 }))
    halo.rotation.x = 1.25; scene.add(halo)
    const spark = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf3dc9a }))
    scene.add(spark)
    return {
      update(t, p, k) {
        pivot.rotation.y += ((k ? Math.sin(t * .6) * .75 : .35) + p.x * .5 - pivot.rotation.y) * .06
        pivot.rotation.x += (p.y * .25 + Math.sin(t * .7) * .08 * k - pivot.rotation.x) * .06
        pivot.position.y = Math.sin(t * 1.1) * .1 * k
        halo.rotation.z = t * .2 * k
        const a = t * .8 * k + 1
        spark.position.set(Math.cos(a) * 2.3, Math.sin(a) * 2.3 * Math.cos(1.25), Math.sin(a) * 2.3 * Math.sin(1.25) * -1)
      },
    }
  }, { z: 7.5 })
  return <div className="stage3d crest-stage" ref={ref}>{failed && <span className="crest big" aria-hidden="true">K</span>}</div>
}

/* ---------- Services: one object per card ---------- */
function makeCar() {
  const g = new THREE.Group()
  const paint = new THREE.MeshStandardMaterial({ color: 0x6b2fa0, metalness: .6, roughness: .3 })
  const glass = new THREE.MeshStandardMaterial({ color: 0x3a1763, metalness: .5, roughness: .15 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, .55, 1.2), paint); body.position.y = .5; g.add(body)
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(.62, .85, .5, 4, 1), glass); cab.rotation.y = Math.PI / 4; cab.scale.set(1.35, 1, .95); cab.position.set(-.15, 1.02, 0); g.add(cab)
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.62, .06, 1.22), gold()); trim.position.y = .62; g.add(trim)
  const wheelGeo = new THREE.CylinderGeometry(.28, .28, .2, 28); const tyre = new THREE.MeshStandardMaterial({ color: 0x140a1e, roughness: .7 })
  const hub = gold()
  ;[[-.85, .62], [.85, .62], [-.85, -.62], [.85, -.62]].forEach(([x, z]) => {
    const w = new THREE.Mesh(wheelGeo, [tyre, hub, hub]); w.rotation.x = Math.PI / 2; w.position.set(x, .28, z); g.add(w)
  })
  const tex = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#f1e8f8'; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a0f42'; ctx.font = '700 34px Georgia, serif'; ctx.fillText('LOGBOOK', 26, 58)
    ctx.fillStyle = '#D9B25B'; ctx.fillRect(w - 90, 22, 64, 48)
    ctx.fillStyle = 'rgba(74,29,107,.3)'; [100, 136, 172].forEach((y, i) => ctx.fillRect(26, y, (w - 52) * [.8, .6, .7][i], 14))
  }, 384, 240)
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.5, .94, .03), [0, 0, 0, 0, 0, 0].map((_, i) => i === 4 ? new THREE.MeshStandardMaterial({ map: tex, roughness: .5 }) : new THREE.MeshStandardMaterial({ color: 0xcdb8e4 })))
  card.position.set(.5, 2.05, .2); card.rotation.set(-.15, -.3, .12); g.add(card)
  g.userData.float = card
  g.position.y = -.9
  return g
}
function makeContainer() {
  const g = new THREE.Group()
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.15), new THREE.MeshStandardMaterial({ color: GOLD, metalness: .7, roughness: .35 }))
  g.add(box)
  const rib = new THREE.MeshStandardMaterial({ color: 0xa87e2c, metalness: .7, roughness: .4 })
  for (let i = 0; i < 11; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.1, 1.19), rib); r.position.x = -1.2 + i * .24; g.add(r) }
  const frame = new THREE.MeshStandardMaterial({ color: 0x4a1d6b, metalness: .5, roughness: .4 })
  ;[.62, -.62].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(2.66, .08, 1.21), frame); b.position.y = y; g.add(b) })
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, .7, 1), new THREE.MeshStandardMaterial({ color: 0x6b2fa0, metalness: .5, roughness: .35 }))
  crate.position.set(.3, 1.05, 0); crate.rotation.y = .3; g.add(crate)
  g.userData.float = crate
  g.position.y = -.4
  return g
}
function makeShield() {
  const s = new THREE.Shape()
  s.moveTo(0, 1.25); s.lineTo(1, .9); s.lineTo(.95, -.1); s.quadraticCurveTo(.75, -.9, 0, -1.3); s.quadraticCurveTo(-.75, -.9, -.95, -.1); s.lineTo(-1, .9); s.closePath()
  const geo = new THREE.ExtrudeGeometry(s, { depth: .25, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 4, curveSegments: 24 })
  geo.center()
  const g = new THREE.Group()
  g.add(new THREE.Mesh(geo, gold()))
  const path = new THREE.CurvePath()
  path.add(new THREE.LineCurve3(new THREE.Vector3(-.45, 0, 0), new THREE.Vector3(-.1, -.38, 0)))
  path.add(new THREE.LineCurve3(new THREE.Vector3(-.1, -.38, 0), new THREE.Vector3(.5, .4, 0)))
  const tick = new THREE.Mesh(new THREE.TubeGeometry(path, 40, .09, 12), new THREE.MeshStandardMaterial({ color: 0x4a1d6b, metalness: .3, roughness: .4 }))
  tick.position.z = .23; g.add(tick)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .015, 8, 120), new THREE.MeshBasicMaterial({ color: 0xf3dc9a, transparent: true, opacity: .5 }))
  g.add(ring); g.userData.ring = ring
  return g
}

function makeMarket() {
  const g = new THREE.Group()
  const purple = new THREE.MeshStandardMaterial({ color: 0x6b2fa0, metalness: .4, roughness: .4 })
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, .7, 1.1), purple); counter.position.y = .35; g.add(counter)
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, .08, 1.2), gold()); top.position.y = .74; g.add(top)
  const post = new THREE.CylinderGeometry(.04, .04, 1.5, 12)
  ;[[-1.15, -.5], [1.15, -.5]].forEach(([x, z]) => { const p = new THREE.Mesh(post, gold()); p.position.set(x, 1.5, z); g.add(p) })
  // striped awning
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(.32, .05, 1.4), i % 2 ? gold() : new THREE.MeshStandardMaterial({ color: 0xf1e8f8, roughness: .6 }))
    s.position.set(-1.12 + i * .32, 2.22, -.05); s.rotation.x = .32; g.add(s)
  }
  // produce baskets
  const fruit = [0xe0782b, 0x5aa33a, 0xd8352a]
  ;[-.7, 0, .7].forEach((x, j) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.3, .22, .18, 20), new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: .8 })); b.position.set(x, .87, .1); g.add(b)
    for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 14), new THREE.MeshStandardMaterial({ color: fruit[j], roughness: .5 })); f.position.set(x + Math.cos(k * 1.3) * .14, 1.02 + (k > 2 ? .08 : 0), .1 + Math.sin(k * 1.3) * .12); g.add(f) }
  })
  // floating coin stack
  const stack = new THREE.Group()
  for (let i = 0; i < 4; i++) { const c = makeCoin(.3, .08, 40); c.position.y = i * .09; c.rotation.y = i; stack.add(c) }
  stack.position.set(1.5, 1.6, .5); g.add(stack); g.userData.float = stack
  g.position.y = -1.05
  return g
}

const MAKERS = { car: makeCar, container: makeContainer, shield: makeShield, market: makeMarket }

export function ServiceIcon({ kind }) {
  const [ref] = useScene(({ scene }) => {
    const obj = MAKERS[kind](); scene.add(obj)
    const base = obj.position.y, floater = obj.userData.float, fy = floater?.position.y
    return {
      update(t, p, k) {
        obj.rotation.y += ((k ? Math.sin(t * .5) * .6 : 0) - .5 + p.x * .3 - obj.rotation.y) * .05
        obj.rotation.x = .18
        obj.position.y = base + Math.sin(t * 1.2) * .06 * k
        if (floater) floater.position.y = fy + Math.sin(t * 1.6) * .1 * k
        if (obj.userData.ring) obj.userData.ring.rotation.set(1.2, t * .6 * k, 0)
      },
    }
  }, { z: kind === 'car' || kind === 'market' ? 6.5 : 6, fov: 34 }, [kind])
  return <div className={`svc-3d ${kind === 'car' || kind === 'market' ? 'full' : ''}`} ref={ref} />
}

/* ---------- Offices: 3D map ---------- */
const KM = 14 // scene units per degree
const toXZ = ([lat, lng]) => [(lng - 36.92) * KM, (-lat - 1.27) * KM]

function labelSprite(text, strong) {
  const tex = canvasTexture((ctx, w, h) => {
    ctx.font = `600 ${strong ? 46 : 40}px Figtree, system-ui, sans-serif`
    const tw = ctx.measureText(text).width + 44
    ctx.fillStyle = strong ? 'rgba(217,178,91,.95)' : 'rgba(18,6,29,.85)'
    ctx.strokeStyle = 'rgba(217,178,91,.8)'; ctx.lineWidth = 3
    const x = (w - tw) / 2
    ctx.beginPath(); ctx.roundRect(x, 14, tw, h - 28, 34); ctx.fill(); ctx.stroke()
    ctx.fillStyle = strong ? '#2a0f42' : '#F6F0FA'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(text, w / 2, h / 2 + 2)
  }, 512, 96)
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  s.scale.set(2.4, .45, 1); s.renderOrder = 5
  return s
}

export function OfficeMap({ offices, active, onPick }) {
  const activeRef = useRef(active); activeRef.current = active
  const pickRef = useRef(onPick); pickRef.current = onPick
  const [ref, failed] = useScene(({ scene, camera }) => {
    const world = new THREE.Group(); scene.add(world)
    const base = new THREE.Mesh(new THREE.BoxGeometry(9, .3, 8.4), new THREE.MeshStandardMaterial({ color: 0x2a1048, metalness: 0, roughness: .9, envMapIntensity: .15 }))
    base.position.y = -.16; world.add(base)
    const edge = new THREE.Mesh(new THREE.BoxGeometry(9.12, .1, 8.52), gold({ roughness: .4 })); edge.position.y = -.27; world.add(edge)
    const grid = new THREE.GridHelper(8.6, 22, 0x6b2fa0, 0x3a1763); grid.position.y = .02; world.add(grid)
    // a few road-like lines
    const road = new THREE.MeshBasicMaterial({ color: 0x4a1d6b })
    ;[[[-4.2, -2.2], [4.2, -4.0]], [[-4, 2.6], [3.8, 0.4]], [[-1.3, -4], [-1.3, 4]]].forEach(([a, b]) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1])
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, .02, .08), road)
      m.position.set((a[0] + b[0]) / 2, .03, (a[1] + b[1]) / 2); m.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); world.add(m)
    })
    const pins = offices.map((o, i) => {
      const [x, z] = toXZ(o.ll)
      const g = new THREE.Group(); g.position.set(x, 0, z)
      const mat = gold({ emissive: 0x3a2a08 })
      const head = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? .32 : .26, 32, 32), mat); head.position.y = 1.05
      const cone = new THREE.Mesh(new THREE.ConeGeometry(i === 0 ? .32 : .26, .8, 32), mat); cone.rotation.x = Math.PI; cone.position.y = .55
      const ring = new THREE.Mesh(new THREE.RingGeometry(.3, .38, 40), new THREE.MeshBasicMaterial({ color: 0xf3dc9a, transparent: true, side: THREE.DoubleSide }))
      ring.rotation.x = -Math.PI / 2; ring.position.y = .04
      const label = labelSprite(o.short, i === 0); label.position.y = 1.85
      g.add(head, cone, ring, label); g.userData = { i, head, ring, label }
      head.userData.i = cone.userData.i = i
      world.add(g)
      return g
    })
    // arcs from head office
    const hq = pins[0].position
    const dots = pins.slice(1).map((p) => {
      const mid = hq.clone().add(p.position).multiplyScalar(.5); mid.y = 2.2
      const curve = new THREE.QuadraticBezierCurve3(hq.clone().setY(1.05), mid, p.position.clone().setY(1.05))
      world.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, .02, 6), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: .55 })))
      const dot = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff1bf }))
      world.add(dot); dot.userData.curve = curve
      return dot
    })
    const ray = new THREE.Raycaster()
    return {
      resize(w, h, cam) {
        const far = cam.aspect < .9 ? 18.5 : 13
        cam.position.set(0, far * .78, far * .78); cam.lookAt(0, 0, .3)
      },
      update(t, p, k) {
        world.rotation.y += ((p.x * .25 + (k ? Math.sin(t * .15) * .12 : 0)) - world.rotation.y) * .04
        const a = activeRef.current
        pins.forEach((g) => {
          const on = g.userData.i === a
          const s = g.scale.x + ((on ? 1.3 : 1) - g.scale.x) * .12
          g.scale.setScalar(s)
          g.userData.head.position.y = 1.05 + (on ? Math.sin(t * 4) * .08 * k : 0)
          const r = ((t * .8 + g.userData.i * .25) % 1)
          g.userData.ring.scale.setScalar(1 + r * (on ? 3 : 1.8) * (k || 0) + (k ? 0 : .5))
          g.userData.ring.material.opacity = (1 - r) * (on ? .9 : .5)
        })
        dots.forEach((d, i) => d.position.copy(d.userData.curve.getPoint(((t * .35 * (k || 0)) + i * .33 + .5) % 1)))
      },
      onClick(ndc, cam) {
        ray.setFromCamera(ndc, cam)
        const hit = ray.intersectObjects(pins.flatMap((g) => [g.userData.head, ...g.children.filter((c) => c.geometry?.type === 'ConeGeometry')]))[0]
        if (hit) pickRef.current?.(hit.object.userData.i)
      },
    }
  }, { fov: 36 })
  if (failed) return null
  return <div className="stage3d map-stage" ref={ref} />
}

/* ---------- Contact: coins orbiting a 24h ---------- */
export function CoinOrbit() {
  const [ref] = useScene(({ scene }) => {
    const g = new THREE.Group(); g.rotation.x = .38; g.position.y = .35; scene.add(g)
    const tex = canvasTexture((ctx, w, h) => {
      ctx.fillStyle = '#F3DC9A'; ctx.font = '700 150px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(217,178,91,.9)'; ctx.shadowBlur = 40; ctx.fillText('24h', w / 2, h / 2)
    }, 512, 256)
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); label.scale.set(3, 1.5, 1); scene.add(label)
    const track = new THREE.Mesh(new THREE.TorusGeometry(2.8, .012, 8, 160), new THREE.MeshBasicMaterial({ color: 0x9b5de5, transparent: true, opacity: .7 }))
    track.rotation.x = Math.PI / 2; g.add(track)
    const coins = Array.from({ length: 9 }, (_, i) => { const c = makeCoin(.42, .1, 48); g.add(c); c.userData.o = i / 9 * Math.PI * 2; return c })
    return {
      update(t, p, k) {
        coins.forEach((c) => {
          const a = c.userData.o + t * .35 * k
          c.position.set(Math.cos(a) * 2.8, Math.sin(t * 1.5 + c.userData.o * 3) * .15 * k, Math.sin(a) * 2.8)
          c.rotation.set(Math.PI / 2, 0, -a + t * k)
        })
        g.rotation.z += (p.x * .15 - g.rotation.z) * .05
        label.position.y = Math.sin(t) * .08 * k
      },
    }
  }, { z: 9 })
  return <div className="stage3d orbit-stage" ref={ref} />
}
