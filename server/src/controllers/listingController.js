import {
  createListing,
  getAllListings,
  getListingById,
  getUserListings,
  updateListing,
  deleteListing,
  getRentedListings,
  markListingAsAvailable,
} from "../services/listingService.js";
import { successResponse, errorResponse } from "../utils/helper.js";

export const handleCreateListing = async (req, res) => {
  try {
    const data = req.body;
    const isDraft = data.isDraft === true;

    // For drafts, no fields are required
    if (!isDraft) {
      const required = [
        "title", "category", "occasion", "size",
        "description", "pricePerDay", "deposit", "condition", "gender", "material",
      ];

      for (const field of required) {
        if (!data[field] && data[field] !== 0) {
          return errorResponse(res, `${field} is required`, 400);
        }
      }

      if (!data.location?.area) {
        return errorResponse(res, "location.area is required", 400);
      }
    }

    // Extract Firebase UID from verified token (set by verifyFirebaseToken middleware)
    const userId = req.user.uid;

    const listing = await createListing(userId, data);
    return successResponse(res, { listing }, 201);
  } catch (error) {
    return errorResponse(res, error.message || "Failed to create listing", 500);
  }
};

export const handleGetAllListings = async (req, res) => {
  try {
    const { category, occasion, gender, city } = req.query;
    const listings = await getAllListings({ category, occasion, gender, city });
    return successResponse(res, { listings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch listings", 500);
  }
};

export const handleGetListingById = async (req, res) => {
  const { id } = req.params;
  const listing = await getListingById(id);

  if (!listing) {
    return errorResponse(res, "Listing not found", 404);
  }

  return successResponse(res, { listing });
};

export const handleGetUserListings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const listings = await getUserListings(userId);
    return successResponse(res, { listings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch user listings", 500);
  }
};

export const handleUpdateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const data = req.body;

    const updated = await updateListing(id, userId, data);
    return successResponse(res, { listing: updated });
  } catch (error) {
    const statusCode = error.message.includes("Unauthorized") ? 403 : 
                      error.message.includes("not found") ? 404 : 500;
    return errorResponse(res, error.message || "Failed to update listing", statusCode);
  }
};

export const handleDeleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const result = await deleteListing(id, userId);
    return successResponse(res, result);
  } catch (error) {
    const statusCode = error.message.includes("Unauthorized") ? 403 : 
                      error.message.includes("not found") ? 404 : 500;
    return errorResponse(res, error.message || "Failed to delete listing", statusCode);
  }
};

export const handleGetRentedListings = async (req, res) => {
  try {
    const userId = req.user.uid;
    const listings = await getRentedListings(userId);
    return successResponse(res, { listings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch rented listings", 500);
  }
};

export const handleRelistListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Get the listing first to verify ownership
    const listing = await getListingById(id);
    if (!listing) {
      return errorResponse(res, "Listing not found", 404);
    }

    if (listing.userId !== userId) {
      return errorResponse(res, "Unauthorized: You can only relist your own listings", 403);
    }

    // Check if rental period has ended
    if (listing.currentRentalEndDate && new Date() < new Date(listing.currentRentalEndDate)) {
      return errorResponse(res, "Cannot relist: Rental period is still active", 400);
    }

    // Mark as available again using the current booking
    const booking = {
      _id: listing.currentBookingId,
      userId: listing.currentRenterId,
      startDate: listing.currentRentalStartDate,
      endDate: listing.currentRentalEndDate,
      totalAmount: 0, // Will be updated from rental history if needed
      totalDays: 0,
    };

    const updatedListing = await markListingAsAvailable(id, booking, {
      email: "N/A",
      displayName: "N/A",
    });

    return successResponse(res, { listing: updatedListing });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to relist listing", 500);
  }
};