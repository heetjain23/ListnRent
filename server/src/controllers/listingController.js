import {
  createListing,
  getAllListings,
  getListingById,
} from "../services/listingService.js";
import { successResponse, errorResponse } from "../utils/helper.js";

// ----------------------------
// POST /api/listings
// Protected — requires JWT
// ----------------------------
export const handleCreateListing = async (req, res) => {
  const userId = req.user._id;
  const data = req.body;

  const required = [
    "title", "category", "occasion", "size",
    "description", "pricePerDay", "deposit", "condition",
  ];

  for (const field of required) {
    if (!data[field] && data[field] !== 0) {
      return errorResponse(res, `${field} is required`, 400);
    }
  }

  if (!data.location?.area) {
    return errorResponse(res, "location.area is required", 400);
  }

  const listing = await createListing(userId, data);
  return successResponse(res, { listing }, 201);
};

// ----------------------------
// GET /api/listings
// Public
// ----------------------------
export const handleGetAllListings = async (req, res) => {
  const { category, occasion, city } = req.query;
  const listings = await getAllListings({ category, occasion, city });
  return successResponse(res, { listings });
};

// ----------------------------
// GET /api/listings/:id
// Public
// ----------------------------
export const handleGetListingById = async (req, res) => {
  const { id } = req.params;
  const listing = await getListingById(id);

  if (!listing) {
    return errorResponse(res, "Listing not found", 404);
  }

  return successResponse(res, { listing });
};