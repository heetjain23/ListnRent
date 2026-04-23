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

const hasDateReached = (dateValue) => {
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  date.setHours(0, 0, 0, 0)
  return date.getTime() <= getStartOfToday().getTime()
}

const buildTimelineForBooking = (booking) => {
  const milestones = booking.milestones || {}

  const hasAdvancePayment = ['partial', 'completed'].includes(booking.paymentStatus) && Number(booking.paidAmount || 0) > 0
  const restPaymentCompletedAt = milestones.restPaymentCompletedAt || null
  const isRestPaymentDone = booking.paymentStatus === 'completed' || !!restPaymentCompletedAt
  const pickupDate = booking.sellerPickupDate || booking.deliveryDate || null
  const returnDate = booking.sellerReturnDate || booking.customerPickupDate || null
  const customerDeliveryDate = booking.eventDate || booking.startDate || booking.deliveryDate || null
  const customerPickupDate = booking.customerPickupDate || returnDate || null

  return {
    customer: [
      {
        key: 'booking_confirmed',
        label: 'Booking Confirmed',
        completed: true,
        at: booking.createdAt,
      },
      {
        key: 'advance_payment_done',
        label: '50% Rent Payment Done',
        completed: hasAdvancePayment,
        at: hasAdvancePayment ? booking.createdAt : null,
      },
      {
        key: 'delivery_date',
        label: 'Delivery Date',
        completed: hasAdvancePayment && hasDateReached(customerDeliveryDate),
        at: customerDeliveryDate,
      },
      {
        key: 'rest_payment_completed',
        label: 'Rest Payment Completed',
        completed: isRestPaymentDone,
        at: restPaymentCompletedAt,
      },
      {
        key: 'delivery_completed',
        label: 'Delivery Completed',
        completed: !!milestones.buyerDeliveryCompletedAt,
        at: milestones.buyerDeliveryCompletedAt || null,
      },
      {
        key: 'pickup_date',
        label: 'Pickup Date',
        completed: !!milestones.buyerDeliveryCompletedAt && hasDateReached(customerPickupDate),
        at: customerPickupDate,
      },
      {
        key: 'payment_completed',
        label: 'Payment Completed',
        completed: !!milestones.buyerPickupCompletedAt,
        at: milestones.buyerPickupCompletedAt || null,
      },
      {
        key: 'deposit_returned',
        label: 'Deposit Returned',
        completed: !!milestones.depositReturnedAt,
        at: milestones.depositReturnedAt || null,
      },
    ],
    seller: [
      {
        key: 'booking_received',
        label: 'Booking Received',
        completed: hasAdvancePayment,
        at: hasAdvancePayment ? booking.createdAt : null,
      },
      {
        key: 'pickup_date',
        label: 'Pickup Date',
        completed: hasAdvancePayment && hasDateReached(pickupDate),
        at: pickupDate,
      },
      {
        key: 'pickup_completed',
        label: 'Pickup Completed',
        completed: !!milestones.sellerPickupCompletedAt,
        at: pickupDate,
      },
      {
        key: 'payment_received',
        label: 'Payment Received',
        completed: isRestPaymentDone,
        at: restPaymentCompletedAt,
      },
      {
        key: 'return_date',
        label: 'Return Date',
        completed: isRestPaymentDone && hasDateReached(returnDate),
        at: returnDate,
      },
      {
        key: 'return_completed',
        label: 'Return Completed',
        completed: !!milestones.sellerReturnCompletedAt,
        at: milestones.sellerReturnCompletedAt || null,
      },
    ],
    logistics: [
      {
        key: 'seller_pickup_completed',
        label: 'Pickup Completed (Seller Location)',
        completed: !!milestones.sellerPickupCompletedAt,
        at: milestones.sellerPickupCompletedAt || null,
      },
      {
        key: 'buyer_delivery_completed',
        label: 'Delivery Completed (Buyer Location)',
        completed: !!milestones.buyerDeliveryCompletedAt,
        at: milestones.buyerDeliveryCompletedAt || null,
      },
      {
        key: 'buyer_pickup_completed',
        label: 'Pickup Done (Buyer Location)',
        completed: !!milestones.buyerPickupCompletedAt,
        at: milestones.buyerPickupCompletedAt || null,
      },
      {
        key: 'seller_return_completed',
        label: 'Delivery Completed (Seller Location)',
        completed: !!milestones.sellerReturnCompletedAt,
        at: milestones.sellerReturnCompletedAt || null,
      },
    ],
  }
}

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
    eventDate: booking.eventDate || booking.startDate || null,
    sellerPickupDate: booking.sellerPickupDate || booking.deliveryDate || null,
    customerPickupDate: booking.customerPickupDate || null,
    sellerReturnDate: booking.sellerReturnDate || booking.customerPickupDate || null,
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
    milestones: booking.milestones || {},
    timeline: buildTimelineForBooking(booking),
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
      { deliveryStatus: 'unassigned' },
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

// Mark a delivery lifecycle milestone
export const markDeliveryMilestone = async (bookingId, action) => {
  const { default: Booking } = await import('../models/Booking.js')

  const booking = await Booking.findById(bookingId).populate('listingId')
  if (!booking) {
    throw new Error('Booking not found')
  }

  if (!booking.milestones) {
    booking.milestones = {}
  }

  const now = new Date()
  const sellerPickupDate = booking.sellerPickupDate || booking.deliveryDate || null
  const buyerDeliveryDate = booking.eventDate || booking.startDate || booking.deliveryDate || null
  const buyerPickupDate = booking.customerPickupDate || booking.sellerReturnDate || booking.endDate || null
  const sellerReturnDate = booking.sellerReturnDate || booking.customerPickupDate || booking.endDate || null

  if (booking.bookingStatus === 'completed') {
    throw new Error('Booking is already completed')
  }

  switch (action) {
    case 'seller_pickup_completed': {
      if (!hasDateReached(sellerPickupDate)) {
        throw new Error('Seller pickup can only be marked on or after pickup date')
      }

      booking.milestones.sellerPickupCompletedAt = booking.milestones.sellerPickupCompletedAt || now
      booking.deliveryStatus = 'picked_up'
      break
    }
    case 'buyer_delivery_completed': {
      if (!booking.milestones.sellerPickupCompletedAt) {
        throw new Error('Mark seller pickup before buyer delivery')
      }

      if (booking.paymentStatus !== 'completed' && !booking.milestones.restPaymentCompletedAt) {
        throw new Error('Complete rest payment before marking buyer delivery')
      }

      if (!hasDateReached(buyerDeliveryDate)) {
        throw new Error('Buyer delivery can only be marked on or after delivery date')
      }

      booking.milestones.buyerDeliveryCompletedAt = booking.milestones.buyerDeliveryCompletedAt || now
      booking.deliveryStatus = 'delivered'
      break
    }
    case 'buyer_pickup_completed': {
      if (!booking.milestones.buyerDeliveryCompletedAt) {
        throw new Error('Mark buyer delivery before pickup from buyer')
      }

      if (!hasDateReached(buyerPickupDate)) {
        throw new Error('Pickup from buyer can only be marked on or after pickup date')
      }

      booking.milestones.buyerPickupCompletedAt = booking.milestones.buyerPickupCompletedAt || now
      booking.deliveryStatus = 'picked_up'
      break
    }
    case 'seller_return_completed': {
      if (!booking.milestones.buyerPickupCompletedAt) {
        throw new Error('Mark pickup from buyer before completing return to seller')
      }

      if (!hasDateReached(sellerReturnDate)) {
        throw new Error('Return to seller can only be marked on or after return date')
      }

      booking.milestones.sellerReturnCompletedAt = booking.milestones.sellerReturnCompletedAt || now
      booking.deliveryStatus = 'returned'
      break
    }
    case 'rest_payment_completed': {
      if (!booking.milestones.sellerPickupCompletedAt) {
        throw new Error('Mark seller pickup completed before marking payment done')
      }

      if (!hasDateReached(buyerDeliveryDate)) {
        throw new Error('Rest payment can only be marked on or after delivery date')
      }

      booking.milestones.restPaymentCompletedAt = booking.milestones.restPaymentCompletedAt || now
      booking.paymentStatus = 'completed'
      booking.pendingAmount = 0
      booking.paidAmount = Number(booking.totalAmount || booking.paidAmount || 0)
      break
    }
    case 'deposit_returned': {
      if (!booking.milestones.sellerReturnCompletedAt) {
        throw new Error('Complete seller return before deposit refund')
      }

      booking.milestones.depositReturnedAt = booking.milestones.depositReturnedAt || now
      booking.bookingStatus = 'completed'
      break
    }
    default:
      throw new Error('Invalid milestone action')
  }

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
