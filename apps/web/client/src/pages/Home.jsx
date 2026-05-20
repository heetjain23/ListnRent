import React from "react";
import HeroSection from "../components/home/HeroSection";
import CuratedOccasionsSection from "../components/home/CuratedOccasionsSection";
import SeamlessJourneySection from "../components/home/SeamlessJourneySection";
import TrendingNowSection from "../components/home/TrendingNowSection";
import NewsletterSection from "../components/home/NewsletterSection";
import { useListings } from "../hooks/useListings";
import { useSEO } from "../hooks/useSEO";

const SITE_URL = "https://listnrent.com";
const SITE_LOGO_URL = `${SITE_URL}/apple-touch-icon.png`;

const Home = () => {
  const activeCategory = "All";
  useSEO({
    title: "Rent Designer Outfits Online",
    description:
      "Discover and rent premium ethnic and party wear for weddings, festivals, and special occasions. List your outfits and earn with ListnRent.",
    keywords:
      "clothing rental, outfit rental, dress rental, ethnic wear rental, lehenga rental, saree rental, wedding outfit rental, party wear rental, rent clothes online, ListnRent",
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
