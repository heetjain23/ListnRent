import React, { useState } from "react";
import HeroSection from "../components/home/HeroSection";
import CuratedOccasionsSection from "../components/home/CuratedOccasionsSection";
import SeamlessJourneySection from "../components/home/SeamlessJourneySection";
import TrendingNowSection from "../components/home/TrendingNowSection";
import NewsletterSection from "../components/home/NewsletterSection";
import { useListings } from "../hooks/useListings";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch from real API — pass category filter (skip 'All')
  const { listings, loading, error } = useListings(
    activeCategory !== "All" ? { category: activeCategory } : {},
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
