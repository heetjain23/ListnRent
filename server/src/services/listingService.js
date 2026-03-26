import Listing from "../models/Listing.js";

// ----------------------------
// Create Listing
// ----------------------------
export const createListing = async (userId, data) => {
  const listing = await Listing.create({ userId, ...data });
  return listing;
};

// ----------------------------
// Get All Active Listings
// Optional filters: category, city, occasion
// ----------------------------
export const getAllListings = async (filters = {}) => {
  const query = { isActive: true };

  if (filters.category) query.category = filters.category;
  if (filters.occasion) query.occasion = filters.occasion;
  if (filters.city) query["location.city"] = filters.city;

  const listings = await Listing.find(query)
    .populate("userId", "name phone email")
    .sort({ createdAt: -1 });

  return listings;
};

// ----------------------------
// Get Single Listing by ID
// ----------------------------
export const getListingById = async (id) => {
  const listing = await Listing.findById(id).populate(
    "userId",
    "name phone email"
  );
  return listing;
};