import React from "react";
import HeroSection from "../components/home/HeroSection";
import CuratedOccasionsSection from "../components/home/CuratedOccasionsSection";
import SeamlessJourneySection from "../components/home/SeamlessJourneySection";
import TrendingNowSection from "../components/home/TrendingNowSection";
import NewsletterSection from "../components/home/NewsletterSection";
import { useListings } from "../hooks/useListings";
import { useSEO } from "../hooks/useSEO";
import { homeSeo, SITE_LOGO_URL, SITE_URL } from "../config/seoPages";

const Home = () => {
  const activeCategory = "All";
  useSEO({
    title: homeSeo.metaTitle,
    description: homeSeo.description,
    keywords: homeSeo.keywords,
    canonicalPath: "/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ListnRent",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ListnRent",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/collection?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "ListnRent",
        url: SITE_URL,
        image: SITE_LOGO_URL,
        areaServed: {
          "@type": "City",
          name: "Mumbai",
        },
        priceRange: "INR",
      },
    ],
  });

  // Fetch from real API — pass category filter (skip 'All')
  const { listings, loading } = useListings(
    activeCategory !== "All"
      ? { category: activeCategory, limit: 4, sortBy: "trending" }
      : { limit: 4, sortBy: "trending" },
  );

  return (
    <div>
      <HeroSection listings={listings} loading={loading} />
      <TrendingNowSection listings={listings} loading={loading} />
      <CuratedOccasionsSection />
      <SeamlessJourneySection />
      <NewsletterSection />
    </div>
  );
};

export default Home;
