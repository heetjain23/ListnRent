import React, { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import ListingCard from '../components/collection/ListingCard'
import { useListings } from '../hooks/useListings'
import { useSEO } from '../hooks/useSEO'
import {
  BRAND_NAME,
  SITE_LOGO_URL,
  SITE_URL,
  getRelatedSeoPages,
  getSeoLandingPage,
  seoLandingPages,
} from '../config/seoPages'

const buildStructuredData = (page) => [
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
    provider: {
      '@type': 'Organization',
      name: BRAND_NAME,
      url: SITE_URL,
      logo: SITE_LOGO_URL,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: `${SITE_URL}${page.path}`,
      },
    ],
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

const toCollectionUrl = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value]
    values.filter(Boolean).forEach((item) => params.append(key, item))
  })
  const query = params.toString()
  return `/collection${query ? `?${query}` : ''}`
}

const SeoLandingPage = ({ pageSlug }) => {
  const { slug } = useParams()
  const resolvedSlug = pageSlug || slug
  const page = getSeoLandingPage(resolvedSlug) || seoLandingPages[0]

  const relatedPages = getRelatedSeoPages(page)
  const { listings, loading } = useListings({ ...page.filters, limit: 4 })
  const structuredData = useMemo(() => buildStructuredData(page), [page])
  const collectionUrl = toCollectionUrl(page.filters)

  useSEO({
    title: page.metaTitle,
    description: page.description,
    keywords: page.keywords,
    canonicalPath: page.path,
    structuredData,
  })

  if (!getSeoLandingPage(resolvedSlug)) return <Navigate to="/collection" replace />

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20">
      <section className="px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B7340]">
            <Link to="/" className="hover:text-[#00342B]">Home</Link>
            <span>/</span>
            <Link to="/collection" className="hover:text-[#00342B]">Collection</Link>
            <span>/</span>
            <span className="text-[#00342B]">{page.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] py-1 pl-2 pr-4">
                <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
                  {page.eyebrow}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
                  Mumbai
                </span>
              </div>

              <h1 className="max-w-3xl font-serif text-4xl font-black leading-tight text-[#1A1A1A] md:text-6xl">
                {page.title}
              </h1>
              <div className="mt-4 h-1 max-w-56 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5F5A4E] md:text-lg">
                {page.lead}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={collectionUrl}
                  className="rounded-full bg-[#00342B] px-7 py-3 text-center text-sm font-bold tracking-[0.06em] text-[#FAF7F2] shadow-[0_8px_28px_rgba(0,52,43,0.22)]"
                >
                  Browse Rentals
                </Link>
                <Link
                  to="/create"
                  className="rounded-full border-2 border-[#D4AF37] px-7 py-3 text-center text-sm font-bold tracking-[0.06em] text-[#00342B]"
                >
                  List Your Outfit
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-2xl border border-[rgba(0,52,43,0.12)] bg-white/80 p-6 shadow-[0_18px_50px_rgba(0,52,43,0.08)]"
            >
              <h2 className="font-serif text-2xl font-black text-[#00342B]">
                Why rent with {BRAND_NAME}?
              </h2>
              <ul className="mt-5 space-y-4">
                {page.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm leading-7 text-[#5F5A4E]">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {page.sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-2xl border border-[rgba(232,224,213,0.9)] bg-white/70 p-6"
            >
              <h2 className="font-serif text-2xl font-black text-[#1A1A1A]">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#666]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-black text-[#1A1A1A]">
                Featured Rentals
              </h2>
              <p className="mt-2 text-sm text-[#777]">
                A few currently listed outfits related to this search.
              </p>
            </div>
            <Link to={collectionUrl} className="hidden text-sm font-bold text-[#00342B] md:block">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="aspect-3/4 animate-pulse rounded-2xl bg-[#E8E0D5]" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {listings.slice(0, 4).map((listing) => (
                <ListingCard key={listing._id || listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgba(0,52,43,0.12)] bg-white/70 p-6 text-sm text-[#666]">
              New matching rentals are being added. Browse the full collection for more options.
            </div>
          )}
        </div>
      </section>

      <section className="mt-16 px-4 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-serif text-3xl font-black text-[#1A1A1A]">
              Frequently Asked Questions
            </h2>
            <div className="mt-6 space-y-4">
              {page.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-2xl border border-[rgba(232,224,213,0.9)] bg-white/75 p-5"
                >
                  <summary className="cursor-pointer font-bold text-[#00342B]">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#666]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl bg-[#00342B] p-6 text-[#FAF7F2]">
            <h2 className="font-serif text-2xl font-black">Explore More</h2>
            <div className="mt-5 flex flex-col gap-3">
              {relatedPages.map((related) => (
                <Link
                  key={related.slug}
                  to={related.path}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:border-[#D4AF37]"
                >
                  {related.title}
                </Link>
              ))}
              <Link
                to="/collection"
                className="rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#D4AF37]"
              >
                Full Collection
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-16 px-4 md:px-6">
        <div className="mx-auto max-w-6xl border-t border-[rgba(212,175,55,0.24)] pt-8">
          <h2 className="font-serif text-2xl font-black text-[#1A1A1A]">
            Popular Mumbai Rental Searches
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {seoLandingPages.map((item) => (
              <Link
                key={item.slug}
                to={item.path}
                className="rounded-full border border-[#E8E0D5] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#5F5A4E] hover:border-[#D4AF37] hover:text-[#00342B]"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SeoLandingPage
