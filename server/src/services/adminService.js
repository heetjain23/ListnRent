import Admin from '../models/Admin.js'

// Find or create admin user
export const findOrCreateAdmin = async ({ email, displayName, photoURL, role = 'delivery_partner' }) => {
  let admin = await Admin.findOne({ email })

  if (admin) {
    // Update profile if provided
    if (displayName) admin.displayName = displayName
    if (photoURL) admin.photoURL = photoURL
    await admin.save()
    return admin
  }

  // Create new admin
  admin = await Admin.create({
    email,
    displayName,
    photoURL,
    role,
    status: 'active',
  })

  return admin
}

// Get admin by email
export const getAdminByEmail = async (email) => {
  return await Admin.findOne({ email })
}

// Update admin profile
export const updateAdminProfile = async (email, updates) => {
  const admin = await Admin.findOneAndUpdate(
    { email },
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  )
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

// Check if admin is active
export const isAdminActive = async (email) => {
  const admin = await Admin.findOne({ email })
  return admin && admin.status === 'active'
}

// Add new admin
export const addNewAdmin = async (email) => {
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const admin = await Admin.create({
    email,
    role: 'admin',
    status: 'active',
  })

  return admin
}

// Get all users with their booking and listing counts
export const getAllUsersWithCounts = async () => {
  // Import models at the top of the function to avoid circular dependencies
  const { default: User } = await import('../models/User.js')
  const { default: Booking } = await import('../models/Booking.js')
  const { default: Listing } = await import('../models/Listing.js')

  const users = await User.find({}, { uid: 1, email: 1, displayName: 1, photoURL: 1 }).sort({ createdAt: -1 })

  const usersWithCounts = await Promise.all(
    users.map(async (user) => {
      // Count total rentals (bookings where this user is the renter)
      const rentalsCount = await Booking.countDocuments({
        userId: user.uid,
        paymentStatus: 'completed',
      })

      // Count total listings (active listings by this user)
      const listingsCount = await Listing.countDocuments({
        userId: user.uid,
        isActive: true,
      })

      return {
        id: user._id.toString(),
        uid: user.uid,
        name: user.displayName || 'N/A',
        email: user.email,
        photoURL: user.photoURL,
        totalRentals: rentalsCount,
        totalListings: listingsCount,
      }
    })
  )

  return usersWithCounts
}

// Delete a user by ID
export const deleteUserById = async (userId) => {
  const { default: User } = await import('../models/User.js')
  const { default: Booking } = await import('../models/Booking.js')
  const { default: Listing } = await import('../models/Listing.js')

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Delete all listings by this user
  await Listing.deleteMany({ userId: user.uid })

  // Delete all bookings by this user
  await Booking.deleteMany({ $or: [{ userId: user.uid }, { renterId: user.uid }] })

  // Delete the user
  await User.deleteOne({ _id: userId })

  return user
}

// Get all admins with details
export const getAllAdminsWithDetails = async () => {
  const admins = await Admin.find({ role: 'admin' }).sort({ createdAt: -1 })

  return admins.map((admin) => ({
    id: admin._id.toString(),
    name: admin.displayName || 'N/A',
    email: admin.email,
    photoURL: admin.photoURL,
    joinedDate: admin.createdAt,
    role: admin.role,
    status: admin.status,
  }))
}

// Delete an admin by email
export const deleteAdminByEmail = async (email) => {
  const admin = await Admin.findOneAndDelete({ email, role: 'admin' })
  if (!admin) {
    throw new Error('Admin not found')
  }
  return admin
}

// Update admin email
export const updateAdminEmail = async (oldEmail, newEmail) => {
  // Check if new email already exists
  const existingAdmin = await Admin.findOne({ email: newEmail })
  if (existingAdmin) {
    throw new Error('Email already in use')
  }

  const admin = await Admin.findOneAndUpdate(
    { email: oldEmail },
    { $set: { email: newEmail } },
    { returnDocument: 'after', runValidators: true }
  )

  if (!admin) {
    throw new Error('Admin not found')
  }

  return admin
}

// ========== DELIVERY PARTNER METHODS ==========

// Get all delivery partners
export const getAllDeliveryPartners = async () => {
  try {
    const partners = await Admin.find({ role: 'delivery_partner' }).sort({ createdAt: -1 })

    const formattedPartners = partners.map((partner) => ({
      id: partner._id.toString(),
      name: partner.displayName || 'N/A',
      email: partner.email,
      phone: partner.phone || 'N/A',
      profileImage: partner.photoURL || null,
      assignedDeliveries: 0,
      completedDeliveries: 0,
      pendingDeliveries: 0,
      status: partner.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      joinedDate: partner.createdAt,
    }))

    return formattedPartners
  } catch (error) {
    throw error
  }
}

// Add a new delivery partner
export const addDeliveryPartner = async (partnerData) => {
  const { name, email, phone } = partnerData

  // Check if partner already exists
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const partner = await Admin.create({
    email,
    displayName: name,
    phone: phone || 'N/A',
    role: 'delivery_partner',
    status: 'active',
  })

  return {
    id: partner._id.toString(),
    name: partner.displayName,
    email: partner.email,
    phone: partner.phone,
    profileImage: partner.photoURL || null,
    assignedDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    status: partner.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: partner.createdAt,
  }
}

// Update delivery partner
export const updateDeliveryPartner = async (partnerId, updates) => {
  const updateData = {}
  
  if (updates.name) updateData.displayName = updates.name
  if (updates.email) updateData.email = updates.email
  if (updates.phone) updateData.phone = updates.phone
  if (updates.status) updateData.status = updates.status === 'ACTIVE' ? 'active' : 'inactive'

  const partner = await Admin.findByIdAndUpdate(
    partnerId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  )

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  return {
    id: partner._id.toString(),
    name: partner.displayName,
    email: partner.email,
    phone: partner.phone,
    profileImage: partner.photoURL || null,
    assignedDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    status: partner.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: partner.createdAt,
  }
}

// Delete a delivery partner
export const deleteDeliveryPartner = async (partnerId) => {
  const partner = await Admin.findByIdAndDelete(partnerId)

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  return partner
}

// Toggle delivery partner status
export const toggleDeliveryPartnerStatus = async (partnerId) => {
  const partner = await Admin.findById(partnerId)

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  partner.status = partner.status === 'active' ? 'inactive' : 'active'
  await partner.save()

  return {
    id: partner._id.toString(),
    name: partner.displayName,
    email: partner.email,
    phone: partner.phone,
    profileImage: partner.photoURL || null,
    assignedDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    status: partner.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: partner.createdAt,
  }
}
