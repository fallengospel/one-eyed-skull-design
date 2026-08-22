export const PRESETS = [
  { id: 'raw', name: 'Raw', css: 'none', overlay: null },
  { id: 'skull-noir', name: 'Skull Noir', css: 'grayscale(1) contrast(1.3) brightness(0.92)', overlay: { color: '#0b0b10', alpha: 0.12 } },
  { id: 'bloodmoon', name: 'Bloodmoon', css: 'sepia(1) hue-rotate(-42deg) saturate(2.4) contrast(1.12) brightness(0.85)', overlay: { color: '#7a0e14', alpha: 0.18 } },
  { id: 'xray', name: 'X-Ray', css: 'grayscale(1) invert(1) contrast(1.25) brightness(1.02)', overlay: { color: '#1b2a4a', alpha: 0.22 } },
  { id: 'toxic', name: 'Toxic Shock', css: 'sepia(0.5) hue-rotate(62deg) saturate(1.9) contrast(1.15)', overlay: { color: '#173b12', alpha: 0.16 } },
  { id: 'symbiote', name: 'Symbiote', css: 'grayscale(1) contrast(1.6) brightness(0.88)', overlay: { color: '#0a0a18', alpha: 0.2 } },
]

export const FRAMES = [
  { id: 'bare', name: 'Bare', pad: 0 },
  { id: 'hairline', name: 'Hairline', pad: 24 },
  { id: 'vinyl', name: 'Vinyl', pad: 36 },
  { id: 'stamp', name: 'Stamp', pad: 28 },
]

function drawFrame(ctx, frameId, size, pad) {
  if (frameId === 'bare') return
  ctx.strokeStyle = '#cfcfc6'
  ctx.lineWidth = 2

  if (frameId === 'hairline') {
    const inset = pad * 0.5
    ctx.strokeRect(inset, inset, size + pad * 2 - inset * 2, size + pad * 2 - inset * 2)
  }

  if (frameId === 'vinyl') {
    const cx = (size + pad * 2) / 2
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cx, size * 0.56, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cx, size * 0.52, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (frameId === 'stamp') {
    const m = pad * 0.5
    const w = size + pad * 2 - m * 2
    ctx.lineWidth = 6
    ctx.globalAlpha = 0.15
    ctx.strokeRect(m, m, w, w)
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.4
    ctx.strokeRect(m + 6, m + 6, w - 12, w - 12)
    ctx.globalAlpha = 1
  }
}

export function bakeCover({ img, zoom, offset, presetId, frameId, outputSize = 900 }) {
  console.log('[Image] bakeCover:', presetId, frameId)
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0]
  const frame = FRAMES.find((f) => f.id === frameId) || FRAMES[0]
  const pad = frame.pad
  const total = outputSize + pad * 2

  const canvas = document.createElement('canvas')
  canvas.width = total
  canvas.height = total
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0e0e13'
  ctx.fillRect(0, 0, total, total)

  const fit = Math.min(outputSize / img.naturalWidth, outputSize / img.naturalHeight)
  const s = zoom * fit
  const halfVis = outputSize / 2 / s
  let sx = img.naturalWidth / 2 - halfVis - offset.x / s
  let sy = img.naturalHeight / 2 - halfVis - offset.y / s
  const sw = outputSize / s

  sx = Math.max(0, Math.min(sx, img.naturalWidth - sw))
  sy = Math.max(0, Math.min(sy, img.naturalHeight - sw))

  ctx.filter = preset.css
  ctx.drawImage(img, sx, sy, sw, sw, pad, pad, outputSize, outputSize)
  ctx.filter = 'none'

  if (preset.overlay) {
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = preset.overlay.alpha
    ctx.fillStyle = preset.overlay.color
    ctx.fillRect(pad, pad, outputSize, outputSize)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  drawFrame(ctx, frameId, outputSize, pad)

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  console.log('[Image] bakeCover done, size:', dataUrl.length)
  return dataUrl
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => { console.error('[Image] FileReader error:', e); reject(e) }
    reader.readAsDataURL(file)
  })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = (e) => { console.error('[Image] load error:', e); reject(e) }
    img.src = src
  })
}
