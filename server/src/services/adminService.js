import Admin from '../models/Admin.js'

const getLocalDateKey = (dateValue) => {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStartOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const isDeliveryCompleted = (status = '') => ['delivered', 'returned'].includes(status)

const isDeliveryAssigned = (status = '') => ['assigned', 'picked_up'].includes(status)

const splitDisplayName = (displayName = '') => {
  const normalizedName = (displayName || '').trim()

  if (!normalizedName) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  const [firstName, ...lastNameParts] = normalizedName.split(/\s+/)

  return {
    firstName: firstName || '',
    lastName: lastNameParts.join(' ') || '',
  }
}

const normalizeOptionalField = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  const normalized = String(value).trim()
  return normalized.toUpperCase() === 'N/A' ? '' : normalized
}

const formatDeliveryPartnerProfile = (partner) => {
  const { firstName, lastName } = splitDisplayName(partner.displayName)

  return {
    id: partner._id.toString(),
    firstName,
    lastName,
    email: partner.email,
    phone: normalizeOptionalField(partner.phone),
    address: normalizeOptionalField(partner.address),
    photoURL: partner.photoURL || null,
    role: partner.role,
    status: partner.status,
  }
}

const formatDeliveryTask = ({ booking, listing, customer, deliveryPartner }) => {
  const deliveryDate = booking.deliveryDate || booking.startDate
  const deliveryDateKey = getLocalDateKey(deliveryDate)
  const todayKey = getLocalDateKey(new Date())
  const bucket =
    deliveryDateKey === todayKey
      ? 'today'
      : deliveryDateKey > todayKey
        ? 'future'
        : 'past'

  return {
    id: booking._id.toString(),
    bookingId: booking._id.toString(),
    listingId: booking.listingId?._id?.toString?.() || booking.listingId?.toString?.() || '',
    listingTitle: listing?.title || booking.listingId?.title || 'Listing',
    listingImage: listing?.images?.[0] || booking.listingId?.images?.[0] || null,
    customerName: customer?.displayName || booking.customerName || customer?.email || booking.userId,
    customerEmail: customer?.email || booking.customerEmail || '',
    customerPhone: customer?.deliveryDetails?.mobileNumber || booking.deliveryDetails?.mobileNumber || '',
    address: booking.deliveryDetails?.deliveryAddress || customer?.deliveryDetails?.deliveryAddress || '',
    landmark: booking.deliveryDetails?.landmark || customer?.deliveryDetails?.landmark || '',
    pincode: booking.deliveryDetails?.pincode || customer?.deliveryDetails?.pincode || '',
    startDate: booking.startDate,
    endDate: booking.endDate,
    deliveryDate,
    deliveryDateKey,
    bucket,
    statusGroup: isDeliveryCompleted(booking.deliveryStatus)
      ? 'completed'
      : isDeliveryAssigned(booking.deliveryStatus)
        ? 'assigned'
        : 'unassigned',
    deliveryStatus: booking.deliveryStatus || 'unassigned',
    deliveryPartnerId: booking.deliveryPartnerId ? booking.deliveryPartnerId.toString() : '',
    deliveryPartnerName: booking.deliveryPartnerName || deliveryPartner?.displayName || '',
    deliveryPartnerEmail: booking.deliveryPartnerEmail || deliveryPartner?.email || '',
    deliveryAssignedAt: booking.deliveryAssignedAt || null,
    totalAmount: booking.totalAmount || 0,
    pendingAmount: booking.pendingAmount || 0,
    rentalAmount: booking.rentalAmount || 0,
    depositAmount: booking.depositAmount || 0,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
    createdAt: booking.createdAt,
  }
}

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

// Get delivery handling tasks for admin dashboard
export const getDeliveryHandlingTasks = async () => {
  const { default: Booking } = await import('../models/Booking.js')
  const { default: User } = await import('../models/User.js')

  const startOfToday = getStartOfToday()

  const bookings = await Booking.find({
    bookingStatus: 'active',
    paymentStatus: { $in: ['partial', 'completed'] },
    $or: [
      { deliveryDate: { $gte: startOfToday } },
      { deliveryDate: { $exists: false } },
      { deliveryDate: null },
    ],
  })
    .populate('listingId')
    .sort({ deliveryDate: 1, startDate: 1, createdAt: -1 })

  const userIds = [...new Set(bookings.map((booking) => booking.userId).filter(Boolean))]
  const users = await User.find({ uid: { $in: userIds } }, { uid: 1, email: 1, displayName: 1, deliveryDetails: 1 })
  const userMap = new Map(users.map((user) => [user.uid, user]))

  const partnerIds = [...new Set(bookings.map((booking) => booking.deliveryPartnerId).filter(Boolean).map((partnerId) => partnerId.toString()))]
  const partners = partnerIds.length
    ? await Admin.find({ _id: { $in: partnerIds } }, { email: 1, displayName: 1, phone: 1 })
    : []
  const partnerMap = new Map(partners.map((partner) => [partner._id.toString(), partner]))

  return bookings.map((booking) => {
    const customer = userMap.get(booking.userId)
    const deliveryPartner = booking.deliveryPartnerId ? partnerMap.get(booking.deliveryPartnerId.toString()) : null

    return formatDeliveryTask({
      booking,
      listing: booking.listingId,
      customer,
      deliveryPartner,
    })
  })
}

// Assign delivery partner to a booking
export const assignDeliveryPartnerToBooking = async (bookingId, partnerId) => {
  const { default: Booking } = await import('../models/Booking.js')

  const booking = await Booking.findById(bookingId).populate('listingId')
  if (!booking) {
    throw new Error('Booking not found')
  }

  const partner = await Admin.findOne({
    _id: partnerId,
    role: 'delivery_partner',
  })

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  booking.deliveryPartnerId = partner._id
  booking.deliveryPartnerName = partner.displayName || partner.email
  booking.deliveryPartnerEmail = partner.email
  booking.deliveryAssignedAt = new Date()
  booking.deliveryStatus = 'assigned'
  booking.deliveryDate = booking.deliveryDate || booking.startDate

  await booking.save()

  const { default: User } = await import('../models/User.js')
  const customer = await User.findOne({ uid: booking.userId }, { uid: 1, email: 1, displayName: 1, deliveryDetails: 1 })

  return formatDeliveryTask({
    booking,
    listing: booking.listingId,
    customer,
    deliveryPartner: partner,
  })
}

// Update booking delivery status
export const updateDeliveryTaskStatus = async (bookingId, deliveryStatus) => {
  const { default: Booking } = await import('../models/Booking.js')

  const allowedStatuses = ['unassigned', 'assigned', 'picked_up', 'delivered', 'returned']
  if (!allowedStatuses.includes(deliveryStatus)) {
    throw new Error('Invalid delivery status')
  }

  const booking = await Booking.findById(bookingId).populate('listingId')
  if (!booking) {
    throw new Error('Booking not found')
  }

  booking.deliveryStatus = deliveryStatus
  booking.deliveryDate = booking.deliveryDate || booking.startDate
  await booking.save()

  const { default: User } = await import('../models/User.js')
  const customer = await User.findOne({ uid: booking.userId }, { uid: 1, email: 1, displayName: 1, deliveryDetails: 1 })

  const deliveryPartner = booking.deliveryPartnerId
    ? await Admin.findById(booking.deliveryPartnerId, { email: 1, displayName: 1, phone: 1 })
    : null

  return formatDeliveryTask({
    booking,
    listing: booking.listingId,
    customer,
    deliveryPartner,
  })
}

// Get assigned delivery tasks for a specific delivery partner
export const getAssignedTasksForDeliveryPartner = async (email) => {
  const { default: Booking } = await import('../models/Booking.js')
  const { default: User } = await import('../models/User.js')

  const partner = await Admin.findOne({
    email,
    role: 'delivery_partner',
  })

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  const bookings = await Booking.find({
    deliveryPartnerId: partner._id,
    bookingStatus: 'active',
    paymentStatus: { $in: ['partial', 'completed'] },
  })
    .populate('listingId')
    .sort({ deliveryDate: 1, startDate: 1, createdAt: -1 })

  const userIds = [...new Set(bookings.map((booking) => booking.userId).filter(Boolean))]
  const users = await User.find({ uid: { $in: userIds } }, { uid: 1, email: 1, displayName: 1, deliveryDetails: 1 })
  const userMap = new Map(users.map((user) => [user.uid, user]))

  return bookings
    .map((booking) => {
      const customer = userMap.get(booking.userId)

      return formatDeliveryTask({
        booking,
        listing: booking.listingId,
        customer,
        deliveryPartner: partner,
      })
    })
    .filter((task) => task.bucket === 'today' || task.bucket === 'future')
}

// Get delivery partner profile by email
export const getDeliveryPartnerProfileByEmail = async (email) => {
  const partner = await Admin.findOne({
    email,
    role: 'delivery_partner',
  })

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  return formatDeliveryPartnerProfile(partner)
}

// Update delivery partner profile by email
export const updateDeliveryPartnerProfileByEmail = async (email, updates) => {
  const partner = await Admin.findOne({
    email,
    role: 'delivery_partner',
  })

  if (!partner) {
    throw new Error('Delivery partner not found')
  }

  const firstName = normalizeOptionalField(updates.firstName)
  const lastName = normalizeOptionalField(updates.lastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  if (updates.firstName !== undefined || updates.lastName !== undefined) {
    partner.displayName = fullName
  }

  if (updates.phone !== undefined) {
    partner.phone = normalizeOptionalField(updates.phone)
  }

  if (updates.address !== undefined) {
    partner.address = normalizeOptionalField(updates.address)
  }

  if (updates.photoURL !== undefined) {
    partner.photoURL = normalizeOptionalField(updates.photoURL)
  }

  await partner.save()

  return formatDeliveryPartnerProfile(partner)
}

// ========== SUPPORT TEAM METHODS ==========

// Get all support team members
export const getAllSupportTeamMembers = async () => {
  try {
    const members = await Admin.find({ role: 'support_team' }).sort({ createdAt: -1 })

    const formattedMembers = members.map((member) => ({
      id: member._id.toString(),
      name: member.displayName || 'N/A',
      email: member.email,
      phone: member.phone || 'N/A',
      profileImage: member.photoURL || null,
      status: member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      joinedDate: member.createdAt,
    }))

    return formattedMembers
  } catch (error) {
    throw error
  }
}

// Add a new support team member
export const addSupportTeamMember = async (memberData) => {
  const { name, email, phone } = memberData

  // Check if member already exists
  const existing = await Admin.findOne({ email })
  if (existing) {
    throw new Error('Email already registered')
  }

  const member = await Admin.create({
    email,
    displayName: name,
    phone: phone || 'N/A',
    role: 'support_team',
    status: 'active',
  })

  return {
    id: member._id.toString(),
    name: member.displayName,
    email: member.email,
    phone: member.phone,
    profileImage: member.photoURL || null,
    status: member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: member.createdAt,
  }
}

// Update support team member
export const updateSupportTeamMember = async (memberId, updates) => {
  const updateData = {}
  
  if (updates.name) updateData.displayName = updates.name
  if (updates.email) updateData.email = updates.email
  if (updates.phone) updateData.phone = updates.phone
  if (updates.status) updateData.status = updates.status === 'ACTIVE' ? 'active' : 'inactive'

  const member = await Admin.findByIdAndUpdate(
    memberId,
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  )

  if (!member) {
    throw new Error('Support team member not found')
  }

  return {
    id: member._id.toString(),
    name: member.displayName,
    email: member.email,
    phone: member.phone,
    profileImage: member.photoURL || null,
    status: member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: member.createdAt,
  }
}

// Delete a support team member
export const deleteSupportTeamMember = async (memberId) => {
  const member = await Admin.findByIdAndDelete(memberId)

  if (!member) {
    throw new Error('Support team member not found')
  }

  return member
}

// Toggle support team member status
export const toggleSupportTeamMemberStatus = async (memberId) => {
  const member = await Admin.findById(memberId)

  if (!member) {
    throw new Error('Support team member not found')
  }

  member.status = member.status === 'active' ? 'inactive' : 'active'
  await member.save()

  return {
    id: member._id.toString(),
    name: member.displayName,
    email: member.email,
    phone: member.phone,
    profileImage: member.photoURL || null,
    status: member.status === 'active' ? 'ACTIVE' : 'INACTIVE',
    joinedDate: member.createdAt,
  }
}
