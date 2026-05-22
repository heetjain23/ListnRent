import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { seoLandingPages } from '../src/config/seoPages.js'

const DEFAULT_SITE_URL = 'https://listnrent.com'
const DEFAULT_API_URL = 'https://api.listnrent.com'

const resolveEnv = (key, fallback = '') => {
  const value = process.env[key]
  return value && value.trim() ? value.trim() : fallback
}

const normalizeUrl = (value) => (value.endsWith('/') ? value.slice(0, -1) : value)

const siteUrl = normalizeUrl(
  resolveEnv('VITE_SITE_URL', resolveEnv('LISTNRENT_SITE_URL', DEFAULT_SITE_URL))
)
const apiUrl = normalizeUrl(
  resolveEnv('VITE_API_URL', resolveEnv('VITE_SERVER_URL', resolveEnv('LISTNRENT_API_URL', DEFAULT_API_URL)))
)

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/collection', changefreq: 'daily', priority: '0.9' },
  ...seoLandingPages.map((page) => ({
    path: page.path,
    changefreq: 'weekly',
    priority: '0.85',
  })),
]

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toIsoDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => {
  const fields = [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
  ]

  if (lastmod) fields.push(`    <lastmod>${xmlEscape(lastmod)}</lastmod>`)
  if (changefreq) fields.push(`    <changefreq>${xmlEscape(changefreq)}</changefreq>`)
  if (priority) fields.push(`    <priority>${xmlEscape(priority)}</priority>`)

  fields.push('  </url>')
  return fields.join('\n')
}

const fetchDynamicListingUrls = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/listings?limit=5000`)
    if (!response.ok) {
      throw new Error(`Failed to fetch listings. HTTP ${response.status}`)
    }

    const payload = await response.json()
    const listings = payload?.data?.listings || []

    return listings
      .filter((listing) => listing?._id && listing?.isDraft !== true && listing?.isActive !== false)
      .map((listing) => ({
        path: `/listing/${listing._id}`,
        changefreq: 'daily',
        priority: '0.8',
        lastmod: toIsoDate(listing.updatedAt || listing.createdAt),
      }))
  } catch (error) {
    console.warn(`[sitemap] ${error.message}`)
    return []
  }
}

const generate = async () => {
  const dynamicRoutes = await fetchDynamicListingUrls()
  const routeMap = new Map()

  for (const route of [...staticRoutes, ...dynamicRoutes]) {
    if (!route.path) continue
    const loc = `${siteUrl}${route.path}`
    routeMap.set(loc, {
      loc,
      lastmod: route.lastmod,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  }

  const urlEntries = [...routeMap.values()].map(buildUrlEntry).join('\n')
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`

  const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /dashboard\nDisallow: /checkout\nDisallow: /create\nDisallow: /edit/\nDisallow: /order/\nDisallow: /rental/\nDisallow: /complete-magic-link\nSitemap: ${siteUrl}/sitemap.xml\n`

  const outputDir = path.resolve(process.cwd(), 'public')
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'sitemap.xml'), sitemapXml, 'utf8')
  await writeFile(path.join(outputDir, 'robots.txt'), robotsTxt, 'utf8')

  console.log(`[sitemap] Generated ${routeMap.size} URLs using ${dynamicRoutes.length} dynamic listings.`)
}

generate().catch((error) => {
  console.error('[sitemap] Generation failed:', error)
  process.exitCode = 1
})
