const VALID_SITE_MODES = ['production', 'preview', 'development', 'comingsoon']

const normalizeMode = (value) => (value || '').trim().toLowerCase()

const resolveModeFromHostname = () => {
  if (typeof window === 'undefined') return 'development'

  const hostname = window.location.hostname.toLowerCase()

  if (hostname.endsWith('.vercel.app')) {
    return 'preview'
  }

  return 'development'
}

const explicitMode = normalizeMode(import.meta.env.VITE_SITE_MODE)
const hasValidExplicitMode = VALID_SITE_MODES.includes(explicitMode)

if (import.meta.env.DEV && explicitMode && !hasValidExplicitMode) {
  console.warn(
    `[site-mode] Invalid VITE_SITE_MODE="${explicitMode}". Falling back to hostname-based mode detection.`
  )
}

export const SITE_MODE = hasValidExplicitMode ? explicitMode : resolveModeFromHostname()

export const SITE_RENDER_TARGET =
  SITE_MODE === 'production' || SITE_MODE === 'comingsoon' ? 'comingsoon' : 'app'

export const isComingSoonMode = SITE_RENDER_TARGET === 'comingsoon'
