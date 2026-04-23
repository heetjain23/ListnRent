import Listing from "../models/Listing.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import admin from "../config/firebase-admin.js";

const toPlainListing = (listing) =>
  listing?.toObject ? listing.toObject() : listing;

const displayNameFromEmail = (email) => {
  if (!email) return "User";
  return email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "User";
};

const ownerFromDbUser = (user) => ({
  displayName: user.displayName || displayNameFromEmail(user.email),
  name: user.displayName || displayNameFromEmail(user.email),
  email: user.email,
  phone: null,
});

const ownerFromFirebaseUser = (user) => {
  const displayName = user.displayName || displayNameFromEmail(user.email);

  return {
    displayName,
    name: displayName,
    email: user.email,
    phone: user.phoneNumber,
  };
};

const getOwnerMap = async (userIds) => {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  const ownerMap = new Map();

  if (uniqueUserIds.length === 0) return ownerMap;

  const dbUsers = await User.find({ uid: { $in: uniqueUserIds } })
    .select("uid email displayName")
    .lean();

  for (const user of dbUsers) {
    ownerMap.set(user.uid, ownerFromDbUser(user));
  }

  const missingUserIds = uniqueUserIds.filter((uid) => !ownerMap.has(uid));
  if (missingUserIds.length === 0) return ownerMap;

  try {
    const firebaseResult = await admin.auth().getUsers(
      missingUserIds.map((uid) => ({ uid })),
    );

    for (const user of firebaseResult.users) {
      ownerMap.set(user.uid, ownerFromFirebaseUser(user));
    }
  } catch (error) {
    console.warn("[ListingService] Firebase owner batch fallback failed:", error.message);
  }

  return ownerMap;
};

const enrichListingsWithOwnerData = async (listings) => {
  const plainListings = listings.map(toPlainListing);
  const ownerMap = await getOwnerMap(plainListings.map((listing) => listing.userId));

  return plainListings.map((listing) => ({
    ...listing,
    owner: ownerMap.get(listing.userId) || {
      displayName: "User",
      name: "User",
      email: null,
      phone: null,
    },
  }));
};

const enrichListingWithOwnerData = async (listing) => {
  const [enrichedListing] = await enrichListingsWithOwnerData([listing]);
  return enrichedListing;
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
  const limit = Math.min(Math.max(Number(filters.limit) || 0, 0), 60);

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

  let listingsQuery = Listing.find(query)
    .select("-bookings -rentalHistory -__v")
    .sort({ createdAt: -1 })
    .lean();

  if (limit > 0) {
    listingsQuery = listingsQuery.limit(limit);
  }

  const listings = await listingsQuery;

  return enrichListingsWithOwnerData(listings);
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
