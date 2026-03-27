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
    "images",
    "location",
    "isActive",
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
        isRented: true,
        currentRenterId: booking.userId,
        currentRentalStartDate: booking.startDate,
        currentRentalEndDate: booking.endDate,
        currentBookingId: booking._id,
        isActive: false,
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
        isRented: false,
        currentRenterId: null,
        currentRentalStartDate: null,
        currentRentalEndDate: null,
        currentBookingId: null,
        isActive: true,
        $push: {
          rentalHistory: {
            bookingId: booking._id,
            renterId: booking.userId,
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
// ----------------------------
export const getRentedListings = async (userId) => {
  try {
    const listings = await Listing.find({
      userId,
      isRented: true,
    })
      .populate("currentBookingId")
      .sort({ currentRentalStartDate: -1 });
    return listings;
  } catch (error) {
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