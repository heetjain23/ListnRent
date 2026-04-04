import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import admin from "../config/firebase-admin.js";

// Helper function to fetch owner data from MongoDB
const enrichListingWithOwnerData = async (listing) => {
  try {
    if (listing.userId) {
      
      // First try to get user from MongoDB
      let dbUser = await User.findOne({ uid: listing.userId });
      
      if (dbUser) {
        return {
          ...listing.toObject ? listing.toObject() : listing,
          owner: {
            displayName: dbUser.displayName || 'User',
            name: dbUser.displayName || 'User',
            email: dbUser.email,
            phone: null,
          },
        };
      }
      
      // Fallback to Firebase if user not in DB
      console.log('[ListingService] User not in DB, falling back to Firebase')
      const firebaseUser = await admin.auth().getUser(listing.userId);
      
      // Determine displayName: use Firebase displayName, or create default from email
      let displayName = firebaseUser.displayName;
      if (!displayName) {
        // Create default displayName from email (e.g., "john.doe@gmail.com" -> "John Doe")
        if (firebaseUser.email) {
          displayName = firebaseUser.email.split('@')[0].replace(/[._-]/g, ' ');
          displayName = displayName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        } else {
          displayName = 'User';
        }
      }
      
      return {
        ...listing.toObject ? listing.toObject() : listing,
        owner: {
          displayName: displayName,
          name: displayName,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
        },
      };
    }
  } catch (error) {
    console.warn(`Could not fetch owner data for UID ${listing.userId}:`, error.message);
  }
  return listing.toObject ? listing.toObject() : listing;
};

export const createListing = async (userId, data) => {
  const listing = await Listing.create({ userId, ...data });
  return listing;
};

// ----------------------------
// Get All Active Listings
// Optional filters: category, city, occasion
// Excludes draft listings
// ----------------------------
export const getAllListings = async (filters = {}) => {
  const query = { isActive: true, isDraft: { $ne: true } };

  // Handle filters - convert to array if string for consistent $in usage
  if (filters.category) {
    const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
    query.category = { $in: categories };
  }
  if (filters.occasion) {
    const occasions = Array.isArray(filters.occasion) ? filters.occasion : [filters.occasion];
    query.occasion = { $in: occasions };
  }
  if (filters.gender) {
    const genders = Array.isArray(filters.gender) ? filters.gender : [filters.gender];
    query.gender = { $in: genders };
  }
  if (filters.city) query["location.city"] = filters.city;

  const listings = await Listing.find(query).sort({ createdAt: -1 });

  // Enrich each listing with owner data from Firebase
  const enrichedListings = await Promise.all(
    listings.map((listing) => enrichListingWithOwnerData(listing))
  );
  
  return enrichedListings;
};

// ----------------------------
// Get Single Listing by ID
// ----------------------------
export const getListingById = async (id, bypassCache = false) => {
  const listing = await Listing.findById(id);
  if (!listing) return null;
  
  const enrichedListing = await enrichListingWithOwnerData(listing);
  
  return enrichedListing;
};

// ----------------------------
// Get All Listings by User ID (including inactive)
// ----------------------------
export const getUserListings = async (userId) => {
  const listings = await Listing.find({ userId })
    .sort({ createdAt: -1 });
  return listings;
};

// ----------------------------
// Update Listing (owner only)
// ----------------------------
export const updateListing = async (id, userId, data) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.userId !== userId) {
    throw new Error("Unauthorized: You can only update your own listings");
  }

  // Fields that can be updated
  const updatableFields = [
    "title",
    "category",
    "occasion",
    "size",
    "description",
    "pricePerDay",
    "deposit",
    "condition",
    "gender",
    "material",
    "images",
    "location",
    "isActive",
    "isDraft",
  ];

  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      listing[field] = data[field];
    }
  }

  const updated = await listing.save();
  
  return updated;
};

// ----------------------------
// Delete Listing (owner only)
// ----------------------------
export const deleteListing = async (id, userId) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own listings");
  }

  await Listing.deleteOne({ _id: id });
  
  return { success: true, message: "Listing deleted successfully" };
};

// ----------------------------
// Mark Listing as Rented
// ----------------------------
export const markListingAsRented = async (listingId, booking, renterInfo) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      listingId,
      {
        // Keep isActive: true - listing should remain visible for booking other dates
        $push: {
          bookings: {
            bookingId: booking._id,
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalDays: booking.totalDays || 1,
            renterName: renterInfo?.displayName || "N/A",
            renterEmail: renterInfo?.email || "N/A",
            rentalAmount: booking.rentalAmount || 0,
            depositAmount: booking.depositAmount || 0,
            bookingFee: booking.bookingFee || 0,
            totalAmount: booking.totalAmount || 0,
            pendingAmount: booking.pendingAmount || 0,
          },
        },
      },
      { new: true }
    );

    return listing;
  } catch (error) {
    throw new Error(`Failed to mark listing as rented: ${error.message}`);
  }
};


// ----------------------------
// Mark Listing as Available After Rental Period
// ----------------------------
export const markListingAsAvailable = async (listingId, booking, renterInfo) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      listingId,
      {
        // Don't force isActive status - let owner manage it separately
        $pull: {
          bookings: { bookingId: booking._id },
        },
        $push: {
          rentalHistory: {
            bookingId: booking._id,
            userId: booking.userId,
            renterEmail: renterInfo?.email || "N/A",
            renterName: renterInfo?.displayName || "N/A",
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalAmount: booking.totalAmount,
            rentalDays: booking.totalDays,
          },
        },
      },
      { new: true }
    );

    // Invalidate caches after marking as available
    try {
      await deleteCache(`listing:${listingId}`);
      const client = (await import("../config/redis.js")).getRedisClient();
      const keys = await client.keys("listings:*");
      if (keys.length > 0) {
        await client.del(keys);
        console.log("[ListingService] Invalidated listing caches after marking as available");
      }
    } catch (cacheError) {
      console.error("[ListingService] Cache invalidation error:", cacheError.message);
    }

    return listing;
  } catch (error) {
    throw new Error(`Failed to mark listing as available: ${error.message}`);
  }
};


// ----------------------------
// Get Rented Listings for Owner
// Returns listings with active bookings
// ----------------------------
export const getRentedListings = async (userId) => {
  try {
    // Find all listings owned by the user that have active bookings
    const listings = await Listing.find({
      userId,
      bookings: { $exists: true, $ne: [] },
    }).sort({ createdAt: -1 });

    console.log(`[getRentedListings] Found ${listings.length} listings with bookings for user ${userId}`);
    
    // Populate booking details with payment information from Booking collection
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const listingObj = listing.toObject();
        
        console.log(`[getRentedListings] Listing: ${listing.title}, bookings count: ${listingObj.bookings.length}`);
        
        // Fetch full booking details for each booking reference
        const enrichedBookings = await Promise.all(
          listingObj.bookings.map(async (booking) => {
            if (!booking.bookingId) {
              console.log(`[getRentedListings] Warning: No bookingId in booking`);
              return booking;
            }
            
            console.log(`[getRentedListings] Fetching booking details for: ${booking.bookingId}`);
            
            const bookingDetails = await Booking.findById(booking.bookingId);
            
            if (bookingDetails) {
              console.log(`[getRentedListings] Found booking details:`, {
                rentalAmount: bookingDetails.rentalAmount,
                depositAmount: bookingDetails.depositAmount,
                bookingFee: bookingDetails.bookingFee,
                totalAmount: bookingDetails.totalAmount,
              });

              return {
                ...booking,
                rentalAmount: bookingDetails.rentalAmount,
                depositAmount: bookingDetails.depositAmount,
                bookingFee: bookingDetails.bookingFee || 0,
                cleaningFee: bookingDetails.cleaningFee || 0,
                deliveryFee: bookingDetails.deliveryFee || 0,
                totalAmount: bookingDetails.totalAmount,
                paidAmount: bookingDetails.paidAmount,
                pendingAmount: bookingDetails.pendingAmount,
                paymentStatus: bookingDetails.paymentStatus,
              };
            }
            console.log(`[getRentedListings] Warning: No booking found for ID: ${booking.bookingId}`);
            return booking;
          })
        );
        
        return {
          ...listingObj,
          bookings: enrichedBookings,
        };
      })
    );
    
    return enrichedListings;
  } catch (error) {
    console.error('[getRentedListings] Error:', error);
    throw new Error(`Failed to get rented listings: ${error.message}`);
  }
};

// ----------------------------
// Get Rental History for a Listing
// ----------------------------
export const getListingRentalHistory = async (listingId) => {
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    return listing.rentalHistory || [];
  } catch (error) {
    throw new Error(`Failed to get rental history: ${error.message}`);
  }
};
