import {
  createListing,
  getAllListings,
  getListingById,
  getUserListings,
  updateListing,
  deleteListing,
  getRentedListings,
  markListingAsAvailable,
  incrementListingViewCount,
} from "../services/listingService.js";
import { buildMeasurementPayload } from "../services/sizeClassificationService.js";
import { successResponse, errorResponse } from "../utils/helper.js";

export const handleCreateListing = async (req, res) => {
  try {
    const data = req.body;
    const isDraft = data.isDraft === true;

    // For drafts, no fields are required
    if (!isDraft) {
      const required = [
        "title", "category", "occasion",
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

      // Handle measurements if provided
      if (data.measurements) {
        const measurementResult = buildMeasurementPayload(
          data.category,
          data.measurements,
          data.measurementNotes,
          data.gender
        );

        if (!measurementResult.valid) {
          return errorResponse(res, "Invalid measurements", 400, measurementResult.errors);
        }

        data.measurements = measurementResult.measurements;
        // Set derived size from measurements
        data.size = `${measurementResult.measurements.derivedSize}`;
      } else if (!data.size) {
        // Fallback: require either measurements or size for backward compatibility
        return errorResponse(res, "Either measurements or size is required", 400);
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
    const { category, occasion, gender, city, limit, sortBy } = req.query;
    const listings = await getAllListings({
      category,
      occasion,
      gender,
      city,
      limit,
      sortBy,
    });
    return successResponse(res, { listings });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch listings", 500);
  }
};

export const handleTrackListingView = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await incrementListingViewCount(id);

    if (!listing) {
      return errorResponse(res, "Listing not found", 404);
    }

    return successResponse(res, {
      listingId: listing._id,
      viewCount: listing.viewCount,
    });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to track listing view", 500);
  }
};

export const handleGetListingById = async (req, res) => {
  const { id } = req.params;
  const { bypassCache } = req.query;
  
  // Allow bypassing cache with ?bypassCache=true query parameter
  const shouldBypassCache = bypassCache === 'true' || bypassCache === '1';
  
  const listing = await getListingById(id, shouldBypassCache);

  if (!listing) {
    return errorResponse(res, "Listing not found", 404);
  }

  // Add cache control headers to prevent browser caching
  if (shouldBypassCache) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
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

    // Check if there are active bookings
    if (!listing.bookings || listing.bookings.length === 0) {
      return errorResponse(res, "No active bookings to complete", 400);
    }

    // Get the most recent booking
    const currentBooking = listing.bookings[listing.bookings.length - 1];

    // Check if rental period has ended
    if (new Date() < new Date(currentBooking.endDate)) {
      return errorResponse(res, "Cannot relist: Rental period is still active", 400);
    }

    // Mark as available again using the current booking
    const booking = {
      _id: currentBooking.bookingId,
      userId: currentBooking.userId,
      startDate: currentBooking.startDate,
      endDate: currentBooking.endDate,
      totalAmount: 0, // Will be updated from rental history if needed
      totalDays: 0,
    };

    const updatedListing = await markListingAsAvailable(id, booking, {
      email: currentBooking.renterEmail,
      displayName: currentBooking.renterName,
    });

    return successResponse(res, { listing: updatedListing });
  } catch (error) {
    return errorResponse(res, error.message || "Failed to relist listing", 500);
  }
};
