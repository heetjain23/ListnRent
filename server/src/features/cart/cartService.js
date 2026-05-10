import CartItem from './CartItem.js'
import Listing from '../listings/Listing.js'
import Booking from '../bookings/Booking.js'
import User from '../users/User.js'
import { markListingAsRented } from '../listings/listingService.js'

const addDays = (dateValue, days) => {
  const date = new Date(dateValue)
  date.setDate(date.getDate() + days)
  return date
}

const buildListingSnapshot = (listing) => ({
  listingId: String(listing._id),
  userId: listing.userId,
  title: listing.title,
  category: listing.category,
  occasion: listing.occasion,
  size: listing.size,
  description: listing.description,
  pricePerDay: listing.pricePerDay,
  deposit: listing.deposit,
  condition: listing.condition,
  gender: listing.gender,
  images: listing.images || [],
  location: listing.location || {},
  isActive: listing.isActive,
})

export const getCartItems = async (userId) => {
  return CartItem.find({ userId })
    .sort({ updatedAt: -1 })
    .populate('listingId', 'title category occasion size description pricePerDay deposit condition gender images location isActive userId')
}

export const addCartItem = async (userId, payload) => {
  const { listingId, eventDate, startDate, endDate, durationDays } = payload || {}

  if (!listingId) {
    const error = new Error('listingId is required')
    error.statusCode = 400
    throw error
  }

  const listing = await Listing.findById(listingId)
  if (!listing) {
    const error = new Error('Listing not found')
    error.statusCode = 404
    throw error
  }

  if (!listing.isActive || listing.isDraft) {
    const error = new Error('This listing is not available for cart')
    error.statusCode = 400
    throw error
  }

  const cartItemData = {
    userId,
    listingId,
    listingSnapshot: buildListingSnapshot(listing),
    eventDate: eventDate ? new Date(eventDate) : null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    durationDays: Number(durationDays) || 1,
  }

  const item = await CartItem.findOneAndUpdate(
    { userId, listingId },
    { $set: cartItemData },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  ).populate('listingId', 'title category occasion size description pricePerDay deposit condition gender images location isActive userId')

  return item
}

export const removeCartItem = async (userId, listingId) => {
  return CartItem.findOneAndDelete({ userId, listingId })
}

export const clearCart = async (userId) => {
  return CartItem.deleteMany({ userId })
}

export const reserveCartItems = async (userId) => {
  const cartItems = await CartItem.find({ userId })
    .sort({ updatedAt: -1 })
    .populate('listingId', 'title category occasion size description pricePerDay deposit condition gender images location isActive isDraft userId bookings')

  if (!cartItems.length) {
    const error = new Error('Your cart is empty')
    error.statusCode = 400
    throw error
  }

  const readyItems = cartItems.filter((item) => item.startDate && item.endDate)
  if (readyItems.length !== cartItems.length) {
    const error = new Error('Please add event dates for every cart item before reserving')
    error.statusCode = 400
    throw error
  }

  const renterUser = await User.findOne({ uid: userId })
  const renterInfo = {
    userId,
    email: renterUser?.email || `user_${userId}@listnrent.com`,
    displayName: renterUser?.displayName || 'Renter',
  }

  const reservedBookings = []

  for (const cartItem of readyItems) {
    const listing = cartItem.listingId

    if (!listing) {
      const error = new Error('One of the cart items is no longer available')
      error.statusCode = 404
      throw error
    }

    if (!listing.isActive || listing.isDraft) {
      const error = new Error(`Listing "${listing.title || 'Item'}" is no longer available`) 
      error.statusCode = 400
      throw error
    }

    const hasConflict = (listing.bookings || []).some((booking) => {
      const existingStart = new Date(booking.startDate)
      const existingEnd = new Date(booking.endDate)
      const requestedStart = new Date(cartItem.startDate)
      const requestedEnd = new Date(cartItem.endDate)
      return requestedStart <= existingEnd && requestedEnd >= existingStart
    })

    if (hasConflict) {
      const error = new Error(`Selected dates for "${listing.title || 'Item'}" are no longer available`)
      error.statusCode = 409
      throw error
    }

    const totalDays = Number(cartItem.durationDays) || 1
    const pricePerDay = Number(listing.pricePerDay) || 0
    const depositAmount = Number(listing.deposit) || 0
    const rentalAmount = totalDays * pricePerDay
    const totalAmount = rentalAmount + depositAmount
    const startDate = new Date(cartItem.startDate)
    const endDate = new Date(cartItem.endDate)
    const eventDate = cartItem.eventDate ? new Date(cartItem.eventDate) : addDays(startDate, 1)

    const booking = new Booking({
      listingId: listing._id,
      userId,
      renterId: listing.userId,
      startDate,
      endDate,
      deliveryDate: startDate,
      eventDate,
      sellerPickupDate: startDate,
      customerPickupDate: addDays(endDate, 1),
      sellerReturnDate: addDays(endDate, 1),
      totalDays,
      pricePerDay,
      rentalAmount,
      depositAmount,
      bookingFee: 0,
      cleaningFee: 0,
      deliveryFee: 0,
      totalAmount,
      paidAmount: 0,
      pendingAmount: totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'active',
      deliveryStatus: 'unassigned',
      deliveryPartnerId: null,
      deliveryPartnerName: '',
      deliveryPartnerEmail: '',
      deliveryAssignedAt: null,
      milestones: {
        sellerPickupCompletedAt: null,
        buyerDeliveryCompletedAt: null,
        buyerPickupCompletedAt: null,
        sellerReturnCompletedAt: null,
        restPaymentCompletedAt: null,
        depositReturnedAt: null,
      },
      deliveryDetails: {},
      notes: 'Reserved from cart',
    })

    await booking.save()
    await booking.populate('listingId')
    await markListingAsRented(listing._id, booking, renterInfo)
    reservedBookings.push(booking)
  }

  await CartItem.deleteMany({ userId })

  return reservedBookings
}