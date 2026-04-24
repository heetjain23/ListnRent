import { useEffect } from 'react'

const BRAND_NAME = 'ListnRent'
const DEFAULT_BASE_URL = 'https://listnrent.com'
const JSON_LD_SCRIPT_ID = 'seo-structured-data'

const normalizeBaseUrl = (value) => {
  if (!value) return DEFAULT_BASE_URL
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const upsertMeta = (name, content, attr = 'name') => {
  if (!content) return
  const selector = `meta[${attr}="${name}"]`
  let tag = document.querySelector(selector)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, name)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

const upsertCanonical = (href) => {
  if (!href) return
  let link = document.querySelector('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}

const upsertJsonLd = (data) => {
  let script = document.getElementById(JSON_LD_SCRIPT_ID)

  if (!data) {
    if (script) {
      script.remove()
    }
    return
  }

  if (!script) {
    script = document.createElement('script')
    script.setAttribute('id', JSON_LD_SCRIPT_ID)
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(data)
}

export const useSEO = ({
  title,
  description,
  keywords,
  canonicalPath,
  canonicalUrl,
  noIndex = false,
  ogType = 'website',
  structuredData = null,
}) => {
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return

    const baseUrl = normalizeBaseUrl(import.meta.env.VITE_SITE_URL || window.location.origin)
    const resolvedCanonical =
      canonicalUrl || `${baseUrl}${canonicalPath || window.location.pathname}`

    document.title = title ? `${title} | ${BRAND_NAME}` : BRAND_NAME

    upsertMeta('description', description)
    upsertMeta('keywords', keywords)
    upsertMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('og:title', document.title, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:url', resolvedCanonical, 'property')
    upsertMeta('og:type', ogType, 'property')

    upsertMeta('twitter:card', 'summary_large_image', 'name')
    upsertMeta('twitter:title', document.title, 'name')
    upsertMeta('twitter:description', description, 'name')

    upsertCanonical(resolvedCanonical)
    upsertJsonLd(structuredData)
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    canonicalUrl,
    noIndex,
    ogType,
    structuredData,
  ])
}
