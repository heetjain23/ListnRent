import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { IoArrowBack } from 'react-icons/io5'
import { FiMessageSquare } from 'react-icons/fi'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { auth } from '../services/firebase'
import { getOptimizedImageUrl } from '../services/cloudinary'

const RentalDetail = () => {
  const { rentalId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [rental, setRental] = useState(location.state?.rental || null)
  const [loading, setLoading] = useState(!rental)
  const [error, setError] = useState(null)
  const [rentalDetails, setRentalDetails] = useState(null)
  const [timelineExpanded, setTimelineExpanded] = useState(false)

  const getApiBaseUrl = () => {
    const env = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL
    if (env) return env.endsWith('/') ? env.slice(0, -1) : env
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000'
    }
    return window.location.origin
  }

  const fetchRentalDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const idToken = await currentUser.getIdToken()

      // Extract listingId and bookingId from the rental ID
      const [listingId, bookingId] = rentalId.split('-')

      const response = await fetch(
        `${getApiBaseUrl()}/api/listings/${listingId}/bookings/${bookingId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch rental details')
      }

      const data = await response.json()
      console.log('[RentalDetail] Details fetched:', data.data)
      console.log('[RentalDetail] Payment data:', {
        rentalAmount: data.data?.rentalAmount,
        depositAmount: data.data?.depositAmount,
        bookingFee: data.data?.bookingFee,
        totalAmount: data.data?.totalAmount,
        pendingAmount: data.data?.pendingAmount,
      })
      setRentalDetails(data.data)
    } catch (err) {
      console.error('[RentalDetail] Error fetching details:', err)
      // If API fetch fails but we have data from location state, continue
      if (!rental) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!rental && rentalId) {
      fetchRentalDetails()
    }
  }, [rentalId, rental])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateWithDay = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const calculateTotalDays = () => {
    if (!rental) return 0
    // Use the actual stored total days from booking instead of recalculating from dates
    return rental.totalDaysBooked || 1
  }

  const getRentalStatus = () => {
    if (!rental) return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', badge: 'Upcoming' }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(rental.rentalStartDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(rental.rentalEndDate)
    end.setHours(0, 0, 0, 0)

    if (today < start) {
      return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', badge: 'Upcoming' }
    } else if (today >= start && today <= end) {
      return { label: 'Active', color: 'bg-blue-100 text-blue-800', badge: 'Active' }
    } else {
      return { label: 'Completed', color: 'bg-green-100 text-green-800', badge: 'Completed' }
    }
  }

  const getTimelineEvents = () => {
    const events = []
    
    // 1. Booking Confirmed - booking creation date
    events.push({
      id: 'confirmed',
      title: 'Booking Confirmed',
      description: 'User has successfully booked the outfit',
      date: rentalDetails?.createdAt || rental?.bookingDate || new Date(),
      status: 'completed',
      showDate: true,
    })

    // 2. Advance Payment Received (no date display)
    events.push({
      id: 'advance_payment',
      title: 'Advance Payment Received',
      description: 'Pre-booking/partial payment completed',
      status: 'completed',
      showDate: false,
    })

    // 3. Outfit Picked Up from Owner - start date
    events.push({
      id: 'pickup_owner',
      title: 'Outfit Picked Up from Owner',
      description: 'Item collected from owner/vendor',
      date: rental?.rentalStartDate || new Date(),
      status: 'completed',
      showDate: true,
    })

    // 4. Full Payment Completed (no date display)
    events.push({
      id: 'full_payment',
      title: 'Full Payment Completed',
      description: 'Remaining payment received',
      status: 'completed',
      showDate: false,
    })

    // 5. Delivered to Customer - same as start date
    const deliveryDate = new Date(rental?.rentalStartDate || new Date())
    events.push({
      id: 'delivered_customer',
      title: 'Delivered to Customer',
      description: 'Outfit successfully delivered',
      date: deliveryDate,
      status: 'pending',
      showDate: true,
    })

    // 6. Return Collected from Customer - end date
    const returnCollectedDate = new Date(rental?.rentalEndDate || new Date())
    events.push({
      id: 'return_collected',
      title: 'Return Collected from Customer',
      description: 'Outfit picked up after rental period',
      date: returnCollectedDate,
      status: 'pending',
      showDate: true,
    })

    // 7. Security Deposit Refunded (no date display)
    events.push({
      id: 'deposit_refunded',
      title: 'Security Deposit Refunded',
      description: 'Deposit returned to customer',
      status: 'pending',
      showDate: false,
    })

    // 8. Sent for Cleaning - same as end date
    const cleaningDate = new Date(rental?.rentalEndDate || new Date())
    events.push({
      id: 'cleaning',
      title: 'Sent for Cleaning',
      description: 'Outfit sent for maintenance/cleaning',
      date: cleaningDate,
      status: 'pending',
      showDate: true,
    })

    // 9. Returned to Owner - 2 days after end date
    const returnOwnerDate = new Date(rental?.rentalEndDate || new Date())
    returnOwnerDate.setDate(returnOwnerDate.getDate() + 2)
    events.push({
      id: 'returned_owner',
      title: 'Returned to Owner',
      description: 'Outfit handed back to owner and cycle complete',
      date: returnOwnerDate,
      status: 'pending',
      showDate: true,
    })

    return events
  }

  const status = getRentalStatus()
  const totalDays = calculateTotalDays()
  const timelineEvents = getTimelineEvents()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl animate-spin mb-4">⏳</div>
            <p className="text-[#666]">Loading rental details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !rental) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#004D40] hover:text-[#00342B] font-medium mb-6 transition-colors"
          >
            <IoArrowBack size={20} /> Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Error loading rental details</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#004D40] hover:text-[#00342B] font-medium mb-6 transition-colors"
          >
            <IoArrowBack size={20} /> Back
          </button>
          <div className="text-center py-12">
            <p className="text-[#666]">Rental details not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#FAF7F2] pt-20 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#004D40] hover:text-[#00342B] font-medium transition-colors"
          >
            <IoArrowBack size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Rental Details</h1>
          <div className="w-8"></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Rental Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-6 border border-[#E8E0D5]"
            >
              {/* Booking ID and Status */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-[#999] mb-1">BOOKING ID</p>
                  <p className="text-xl font-bold text-[#1A1A1A]">#{rental.bookingId?.slice(-8).toUpperCase()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-sm ${status.color}`}>
                  {status.badge}
                </div>
              </div>

              {/* Outfit Section - Image on Left, Details on Right */}
              <div className="border-t border-[#E8E0D5] pt-6 mb-6">
                <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Outfit Details</h2>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image - Left */}
                  {rental.listingImage && (
                    <div className="md:w-1/3 shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5] h-56 md:h-64">
                      <img
                        src={getOptimizedImageUrl(rental.listingImage, {
                          width: 300,
                          height: 300,
                          quality: 'auto',
                        })}
                        alt={rental.listingTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details & Rental Period - Right */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{rental.listingTitle}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-[#999] mb-1">SIZE</p>
                        <p className="font-medium text-[#555]">{rental.listingSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#999] mb-1">CATEGORY</p>
                        <p className="font-medium text-[#555]">{rental.listingCategory}</p>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div className="bg-[#004D40] text-white rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <p className="text-xs opacity-80 mb-1">STARTS</p>
                          <p className="font-bold text-sm">
                            {new Date(rental.rentalStartDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs opacity-70">
                            {new Date(rental.rentalStartDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-bold">{totalDays}</p>
                          <p className="text-xs opacity-80">DAYS</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-80 mb-1">ENDS</p>
                          <p className="font-bold text-sm">
                            {new Date(rental.rentalEndDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-xs opacity-70">
                            {new Date(rental.rentalEndDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Button */}
              {rental.renterEmail && (
                <div className="border-t border-[#E8E0D5] pt-6 mt-6">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#004D40] text-white rounded-lg font-bold hover:bg-[#00342B] transition-colors">
                    <FiMessageSquare size={20} /> Message Renter
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-6 border border-[#E8E0D5]"
            >
              <h3 className="text-sm font-bold text-[#999] mb-4">PAYMENT DETAILS</h3>
              
              <div className="space-y-3 mb-4">
                {/* Rent Amount */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#666]">Rent Amount</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {formatCurrency(rentalDetails?.rentalAmount || rental?.rentalAmount || 0)}
                  </p>
                </div>

                {/* Security Deposit */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#666]">Security Deposit</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {formatCurrency(rentalDetails?.depositAmount || rental?.depositAmount || 0)}
                  </p>
                </div>

                {/* Booking Fee */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#666]">Booking Fee</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {formatCurrency(rentalDetails?.bookingFee || rental?.bookingFee || 0)}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E8E0D5] my-4"></div>

              {/* Total Amount */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-[#1A1A1A]">Total Amount</p>
                  <p className="text-lg font-bold text-[#004D40]">
                    {formatCurrency(
                      rentalDetails?.totalAmount || rental?.totalAmount ||
                      ((rentalDetails?.rentalAmount || rental?.rentalAmount || 0) + 
                       (rentalDetails?.depositAmount || rental?.depositAmount || 0) + 
                       (rentalDetails?.bookingFee || rental?.bookingFee || 0))
                    )}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E8E0D5] my-4"></div>

              {/* Pending Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#666]">Pending to Collect</p>
                  <p className="text-sm font-bold text-[#E5BF37]">
                    {formatCurrency(
                      rentalDetails?.pendingAmount || rental?.pendingAmount || 
                      rentalDetails?.totalAmount || rental?.totalAmount ||
                      ((rentalDetails?.rentalAmount || rental?.rentalAmount || 0) + 
                       (rentalDetails?.depositAmount || rental?.depositAmount || 0) + 
                       (rentalDetails?.bookingFee || rental?.bookingFee || 0))
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg p-6 border border-[#E8E0D5] relative"
            >
              <h3 className="text-sm font-bold text-[#999] mb-6">ACTIVITY TIMELINE</h3>
              
              {/* Timeline Container with Blur Effect */}
              <div className={`relative ${!timelineExpanded ? 'max-h-80 overflow-hidden' : ''}`}>
                <div className="space-y-4">
                  {timelineEvents
                    .slice(0, timelineExpanded ? timelineEvents.length : Math.ceil(timelineEvents.length / 2))
                    .map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              event.status === 'completed' ? 'bg-[#004D40]' : 'bg-[#D4C5B5]'
                            }`}
                          >
                            {event.status === 'completed' ? '✓' : '•'}
                          </div>
                          {index < (timelineExpanded ? timelineEvents.length : Math.ceil(timelineEvents.length / 2)) - 1 && (
                            <div className="w-0.5 h-8 bg-[#E8E0D5] mt-2"></div>
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-[#1A1A1A] text-sm">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-[#999] mt-1">{event.description}</p>
                          )}
                          {event.showDate && event.date && (
                            <p className="text-xs text-[#999] mt-1 font-bold">{formatDate(event.date)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Gradient Blur Overlay */}
                {!timelineExpanded && (
                  <div className="absolute inset-0 top-1/2 bg-linear-to-b from-transparent via-white/40 to-white/90 pointer-events-none"></div>
                )}
              </div>

              {/* Expand Button at Bottom */}
              {timelineEvents.length > 0 && !timelineExpanded && (
                <div className="flex justify-center mt-6 pt-6 border-t border-[#E8E0D5]">
                  <button
                    onClick={() => setTimelineExpanded(true)}
                    className="flex items-center gap-2 text-[#004D40] hover:text-[#00342B] font-bold transition-colors py-2 px-6 rounded-lg hover:bg-[#F5F5F5]"
                  >
                    <span>Expand Timeline</span>
                    <MdExpandMore size={20} />
                  </button>
                </div>
              )}

              {/* Collapse Button at Bottom when Expanded */}
              {timelineEvents.length > 0 && timelineExpanded && (
                <div className="flex justify-center mt-6 pt-6 border-t border-[#E8E0D5]">
                  <button
                    onClick={() => setTimelineExpanded(false)}
                    className="flex items-center gap-2 text-[#004D40] hover:text-[#00342B] font-bold transition-colors py-2 px-6 rounded-lg hover:bg-[#F5F5F5]"
                  >
                    <span>Collapse Timeline</span>
                    <MdExpandLess size={20} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Action Button */}
            {rental.isCompleted ? (
              <button className="w-full px-4 py-3 bg-[#004D40] text-white rounded-lg font-bold hover:bg-[#00342B] transition-colors">
                RENTAL COMPLETED ✓
              </button>
            ) : status.badge === 'Upcoming' ? (
              <button className="w-full px-4 py-3 bg-[#004D40] text-white rounded-lg font-bold hover:bg-[#00342B] transition-colors">
                PREPARE FOR PICKUP
              </button>
            ) : (
              <button className="w-full px-4 py-3 bg-[#004D40] text-white rounded-lg font-bold hover:bg-[#00342B] transition-colors">
                CONFIRM RETURN
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RentalDetail
