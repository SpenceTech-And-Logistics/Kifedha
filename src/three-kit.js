// Shared setup for the small 3D scenes: renderer, lights, resize, pointer,
// pause when off screen, reduced motion, cleanup.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export { THREE }
export const GOLD = 0xd9b25b

export function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export function canvasTexture(draw, w, h) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function gold(extra = {}) {
  return new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.92, roughness: 0.28, ...extra })
}

export function coinFaceTexture() {
  return canvasTexture((ctx, w, h) => {
    const grd = ctx.createRadialGradient(w * .4, h * .35, 10, w / 2, h / 2, w / 2)
    grd.addColorStop(0, '#fff1bf'); grd.addColorStop(.6, '#D9B25B'); grd.addColorStop(1, '#a87e2c')
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(122,85,19,.7)'; ctx.lineWidth = w * .03
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w * .4, 0, 7); ctx.stroke()
    ctx.fillStyle = '#7a5513'; ctx.font = '700 ' + w * .5 + 'px Georgia, serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('K', w / 2, h / 2 + w * .03)
  }, 512, 512)
}

// Mounts a scene into `el`. The renderer is only created when the element first
// comes on screen. `setup` receives { scene, camera, renderer } and returns
// { update(t, pointer, k), resize?(w, h), onClick?(ndc) }. k is 0 when the
// visitor prefers reduced motion. Returns a cleanup function, or null if WebGL is unavailable.
export function mountScene(el, setup, { fov = 35, z = 8, y = 0, exposure = 1.1 } = {}) {
  if (!webglOk()) return null
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let renderer, scene, camera, pm, api, raf = 0, visible = false, started = false, ro
  const pointer = { x: 0, y: 0 }
  const clock = new THREE.Clock()

  function start() {
    started = true
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = exposure
    renderer.domElement.setAttribute('aria-hidden', 'true')
    Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' })
    el.appendChild(renderer.domElement)
    scene = new THREE.Scene()
    pm = new THREE.PMREMGenerator(renderer)
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100)
    camera.position.set(0, y, z)
    const key = new THREE.DirectionalLight(0xfff0cc, 2.2); key.position.set(4, 7, 6); scene.add(key)
    const rim = new THREE.PointLight(0x9b5de5, 25, 20); rim.position.set(-5, 3, 3); scene.add(rim)
    api = setup({ scene, camera, renderer }) || {}
    resize()
    ro = new ResizeObserver(resize); ro.observe(el)
    renderer.domElement.addEventListener('click', click)
    frame()
  }
  function resize() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    api.resize?.(w, h, camera)
    camera.updateProjectionMatrix()
  }
  function click(e) {
    if (!api.onClick) return
    const r = renderer.domElement.getBoundingClientRect()
    api.onClick({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera)
  }
  function frame() {
    raf = requestAnimationFrame(frame)
    if (!visible) return
    api.update?.(clock.getElapsedTime(), pointer, reduce ? 0 : 1)
    renderer.render(scene, camera)
  }
  const onMove = (e) => {
    const r = el.getBoundingClientRect()
    pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2))
    pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2))
  }
  window.addEventListener('pointermove', onMove)
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible && !started) start()
  }, { rootMargin: '200px' })
  io.observe(el)

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); ro?.disconnect()
    window.removeEventListener('pointermove', onMove)
    if (!started) return
    renderer.domElement.removeEventListener('click', click)
    scene.traverse((o) => {
      o.geometry?.dispose?.()
      const m = o.material; (Array.isArray(m) ? m : [m]).forEach((x) => { x?.map?.dispose?.(); x?.dispose?.() })
    })
    pm.dispose(); renderer.dispose(); renderer.domElement.remove()
  }
}
