import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  BRAND_NAME,
  SITE_LOGO_URL,
  SITE_URL,
  collectionSeo,
  homeSeo,
  seoLandingPages,
} from '../src/config/seoPages.js'

const DEFAULT_API_URL = 'https://api.listnrent.com'

const resolveEnv = (key, fallback = '') => {
  const value = process.env[key]
  return value && value.trim() ? value.trim() : fallback
}

const normalizeUrl = (value) => (value.endsWith('/') ? value.slice(0, -1) : value)
const distDir = path.resolve(process.cwd(), 'dist')
const apiUrl = normalizeUrl(
  resolveEnv('VITE_API_URL', resolveEnv('VITE_SERVER_URL', resolveEnv('LISTNRENT_API_URL', DEFAULT_API_URL)))
)

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const stripManagedSeo = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|keywords|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/\s*<script\s+id=["']seo-structured-data["'][\s\S]*?<\/script>/gi, '')

const buildTitle = (title) =>
  title?.includes(BRAND_NAME) ? title : `${title || BRAND_NAME} | ${BRAND_NAME}`

const buildSeoTags = ({ title, description, keywords, canonicalPath, canonicalUrl, robots = 'index, follow', ogType = 'website', image = SITE_LOGO_URL, structuredData }) => {
  const resolvedTitle = buildTitle(title)
  const url = canonicalUrl || `${SITE_URL}${canonicalPath || '/'}`
  const jsonLd = structuredData
    ? `\n  <script id="seo-structured-data" type="application/ld+json">${JSON.stringify(structuredData)}</script>`
    : ''

  return `  <title>${escapeHtml(resolvedTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta property="og:title" content="${escapeHtml(resolvedTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(resolvedTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />${jsonLd}`
}

const writeRouteHtml = async (template, route) => {
  const clean = stripManagedSeo(template)
  const tags = buildSeoTags(route)
  const html = clean.replace(/<head>/i, `<head>\n${tags}`)
  const outputPath =
    route.canonicalPath === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.canonicalPath.replace(/^\//, ''), 'index.html')

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

const landingStructuredData = (page) => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.metaTitle,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/collection?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  },
]

const fetchListings = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/listings?limit=5000`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    return (payload?.data?.listings || []).filter(
      (listing) => listing?._id && listing?.isDraft !== true && listing?.isActive !== false,
    )
  } catch (error) {
    console.warn(`[static-seo] Could not fetch listings: ${error.message}`)
    return []
  }
}

const listingRoute = (listing) => {
  const pathName = `/listing/${listing._id}`
  const image = Array.isArray(listing.images) ? listing.images.find(Boolean) : null
  return {
    canonicalPath: pathName,
    title: `${listing.title} on Rent in Mumbai`,
    description: `Rent ${listing.title}, a ${listing.category || 'designer outfit'}${listing.occasion ? ` for ${listing.occasion}` : ''}. View price, size, measurements, location, availability, and booking details on ListnRent.`,
    keywords: [listing.title, listing.category, listing.occasion, 'outfit rental Mumbai', 'designer clothes on rent Mumbai', BRAND_NAME].filter(Boolean).join(', '),
    ogType: 'product',
    image: image || SITE_LOGO_URL,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description,
        image: image ? [image] : undefined,
        category: listing.category,
        sku: listing._id,
        brand: { '@type': 'Brand', name: BRAND_NAME },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}${pathName}`,
          priceCurrency: 'INR',
          price: Number(listing.pricePerDay) || 0,
          availability: 'https://schema.org/InStock',
          businessFunction: 'https://purl.org/goodrelations/v1#LeaseOut',
          areaServed: {
            '@type': 'City',
            name: listing.location?.city || 'Mumbai',
          },
        },
      },
    ],
  }
}

const run = async () => {
  const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
  const listings = await fetchListings()
  const routes = [
    {
      canonicalPath: '/',
      title: homeSeo.metaTitle,
      description: homeSeo.description,
      keywords: homeSeo.keywords,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BRAND_NAME,
          url: SITE_URL,
          logo: SITE_LOGO_URL,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: BRAND_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/collection?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    },
    {
      canonicalPath: '/collection',
      title: collectionSeo.metaTitle,
      description: collectionSeo.description,
      keywords: collectionSeo.keywords,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collectionSeo.metaTitle,
        description: collectionSeo.description,
        url: `${SITE_URL}/collection`,
      },
    },
    ...seoLandingPages.map((page) => ({
      canonicalPath: page.path,
      title: page.metaTitle,
      description: page.description,
      keywords: page.keywords,
      structuredData: landingStructuredData(page),
    })),
    ...listings.map(listingRoute),
  ]

  for (const route of routes) {
    await writeRouteHtml(template, route)
  }

  console.log(`[static-seo] Wrote route-specific HTML for ${routes.length} URLs.`)
}

run().catch((error) => {
  console.error('[static-seo] Failed:', error)
  process.exitCode = 1
})
