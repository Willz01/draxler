// Pulls your VSCO photos using a real browser (VSCO returns 403 to plain HTTP requests).
//   npm run sync:photos            # headless
//   npm run sync:photos -- --headed  # visible browser window (use this if headless is blocked)
// Output: public/photos/<id>.jpg + public/photos.json. Commit those, then deploy.
import fs from 'node:fs'
import path from 'node:path'

const USER = 'draxler606'
const OUT = 'public/photos'
const HEADED = process.argv.includes('--headed')
const abs = u => (u.startsWith('http') ? u : 'https://' + u.replace(/^\/\//, ''))

let chromium
try { ({ chromium } = await import('playwright')) } catch {
  console.error('Playwright missing. Run:  npm install  &&  npx playwright install chromium'); process.exit(1)
}

const found = new Map()
const add = (id, src, link, alt = '') => {
  if (!id || !src || found.has(String(id))) return
  found.set(String(id), { id: String(id), src: abs(src), link: link || `https://vsco.co/${USER}/media/${id}`, alt })
}
const walk = o => {
  if (!o || typeof o !== 'object') return
  if (o.responsiveUrl && (o._id || o.id)) {
    const id = o._id || o.id
    add(id, o.responsiveUrl, `https://vsco.co/${USER}/media/${id}`, o.description || o.caption || '')
  }
  Object.values(o).forEach(walk)
}

const browser = await chromium.launch({ headless: !HEADED, args: ['--disable-blink-features=AutomationControlled'] })
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  viewport: { width: 1280, height: 900 },
})
const page = await ctx.newPage()

// capture JSON the page loads (VSCO paginates via XHR) and the image bytes the browser itself downloads
const imgBodies = new Map()
page.on('response', async r => {
  try {
    const type = r.headers()['content-type'] || ''
    if (type.includes('json')) walk(await r.json())
    else if (type.startsWith('image/') && r.status() === 200) {
      const body = await r.body()
      if (body.length > 15000) imgBodies.set(r.url(), body)
    }
  } catch {}
})

try {
  const resp = await page.goto(`https://vsco.co/${USER}/gallery`, { waitUntil: 'networkidle', timeout: 60000 })
  console.log('[vsco] page status', resp?.status())
  // embedded state
  walk(await page.evaluate(() => window.__PRELOADED_STATE__ || null).catch(() => null))
  // scroll to trigger lazy loading
  let last = -1
  for (let i = 0; i < 40 && found.size !== last; i++) {
    last = found.size
    await page.mouse.wheel(0, 4000); await page.waitForTimeout(1200)
  }
  // DOM fallback: image tiles + their media links
  if (!found.size) {
    const tiles = await page.$$eval('a[href*="/media/"]', as => as.map(a => ({ href: a.href, src: a.querySelector('img')?.src })))
    tiles.forEach(t => t.src && add(t.href.split('/').pop().split('?')[0], t.src.split('?')[0], t.href))
  }
} catch (e) { console.warn('[vsco] profile scrape failed:', e.message) }
console.log(`[vsco] profile: ${found.size} photo(s)`)

// individual links from vsco-links.txt
if (fs.existsSync('vsco-links.txt')) {
  const links = fs.readFileSync('vsco-links.txt', 'utf8').split('\n').map(l => l.trim()).filter(l => l.startsWith('http'))
  for (const link of links) {
    try {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 45000 })
      const og = await page.$eval('meta[property="og:image"]', m => m.content).catch(() => null)
      add(link.split('/').filter(Boolean).pop().split('?')[0], og?.split('?')[0], link)
    } catch (e) { console.warn('[vsco] link failed:', link, e.message) }
  }
}

if (!found.size) {
  console.warn('[vsco] nothing found. Try:  npm run sync:photos -- --headed   or paste links into vsco-links.txt')
  await browser.close(); process.exit(0)
}

fs.mkdirSync(OUT, { recursive: true })
const photos = []

// Opens one photo's own VSCO page like a visitor and grabs the full-size image the browser loads.
async function grab(p) {
  const ip = await ctx.newPage()
  const imgs = []
  ip.on('response', async r => {
    try {
      const type = r.headers()['content-type'] || ''
      if (type.startsWith('image/') && r.status() === 200) {
        const body = await r.body()
        if (body.length > 20000) imgs.push({ body, type })
      }
    } catch {}
  })
  await ip.goto(p.link, { waitUntil: 'networkidle', timeout: 60000 })
  await ip.waitForTimeout(1500)
  let best = imgs.sort((x, y) => y.body.length - x.body.length)[0]
  if (!best) {
    // last resort: screenshot the biggest <img> on the page
    const handles = await ip.$$('img')
    let big = null, area = 0
    for (const h of handles) { const b = await h.boundingBox(); if (b && b.width * b.height > area) { area = b.width * b.height; big = h } }
    if (big && area > 40000) best = { body: await big.screenshot({ type: 'jpeg', quality: 92 }), type: 'image/jpeg' }
  }
  await ip.close()
  return best
}

for (const p of found.values()) {
  try {
    const existing = fs.readdirSync(OUT).find(f => f.startsWith(p.id + '.'))
    let name = existing
    if (!name) {
      const img = await grab(p)
      if (!img) throw new Error('no image found on page')
      const ext = img.type.includes('png') ? 'png' : img.type.includes('webp') ? 'webp' : 'jpg'
      name = `${p.id}.${ext}`
      fs.writeFileSync(path.join(OUT, name), img.body)
    }
    photos.push({ id: p.id, src: `/photos/${name}`, link: p.link, alt: p.alt })
    console.log('[vsco] ok', p.id)
  } catch (e) { console.warn('[vsco] download failed:', p.id, e.message) }
}
if (!photos.length) console.warn('[vsco] no images could be downloaded; photos.json left unchanged. Try --headed.')
else { fs.writeFileSync('public/photos.json', JSON.stringify(photos, null, 2)); console.log(`[vsco] saved ${photos.length} photo(s) -> public/photos.json`) }
await browser.close()