import React, { useEffect, useState } from 'react'
import { useEarnings } from '../../hooks/useEarnings'

const MyEarnings = () => {
  const {
    bookings,
    loading,
    error,
    fetchEarnings,
    calculateTotalEarnings,
    calculatePendingEarnings,
    getBookingsByPaymentStatus,
  } = useEarnings()

  const [filterStatus, setFilterStatus] = useState('all') // all, completed, partial, pending

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  const totalEarnings = calculateTotalEarnings()
  const pendingEarnings = calculatePendingEarnings()
  const completedBookings = getBookingsByPaymentStatus('completed')
  const partialBookings = getBookingsByPaymentStatus('partial')
  const pendingBookings = getBookingsByPaymentStatus('pending')
  const activeBookings = bookings.filter((b) => b.bookingStatus === 'active' && b.paymentStatus !== 'failed')

  // Filter bookings
  const filteredBookings =
    filterStatus === 'all'
      ? bookings.filter((b) => b.bookingStatus !== 'cancelled')
      : filterStatus === 'completed'
        ? completedBookings.filter((b) => b.bookingStatus !== 'cancelled')
        : filterStatus === 'partial'
          ? partialBookings.filter((b) => b.bookingStatus !== 'cancelled')
          : filterStatus === 'pending'
            ? pendingBookings.filter((b) => b.bookingStatus !== 'cancelled')
            : bookings.filter((b) => b.bookingStatus !== 'cancelled')

  const getEarningsAmount = (booking) => {
    // Use rentalAmount if available, otherwise calculate from totalDays * pricePerDay
    // This handles both new and old bookings
    return booking.rentalAmount || (booking.totalDays * booking.pricePerDay) || 0
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Fully Paid' },
      partial: { bg: 'bg-blue-50', text: 'text-blue-700', label: '50% Paid' },
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
      failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed' },
      refunded: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Refunded' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Active' },
      completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    }
    const config = statusConfig[status] || statusConfig.active
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading your earnings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error loading earnings</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={fetchEarnings}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
        <p className="text-xs text-red-500 mt-4">
          Debug: {bookings.length} bookings loaded before error
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">My Earnings</h2>
        <p className="text-[#666] text-sm md:text-base">Track your rental income and completed bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Earnings */}
        <div className="bg-linear-to-br from-[#004D40] to-[#003830] text-white rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[#AAA] text-xs uppercase tracking-wide font-medium mb-1">Total Earnings</p>
              <h3 className="text-4xl font-bold">{formatCurrency(totalEarnings)}</h3>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <p className="text-[#AAA] text-sm mt-4">From {completedBookings.length + partialBookings.length} rental(s)</p>
        </div>

        {/* Pending Earnings */}
        <div className="bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[#FFF] text-xs uppercase tracking-wide font-medium mb-1 opacity-80">Amount to Collect</p>
              <h3 className="text-4xl font-bold">{formatCurrency(pendingEarnings)}</h3>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
          <p className="text-[#FFF] text-sm mt-4 opacity-80">Remaining rental amount pending</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-[#E8E0D5] flex gap-4">
        {[
          { id: 'all', label: `All Rentals (${bookings.filter((b) => b.bookingStatus !== 'cancelled').length})` },
          { id: 'completed', label: `Fully Paid (${completedBookings.filter((b) => b.bookingStatus !== 'cancelled').length})` },
          { id: 'partial', label: `In Progress (${partialBookings.filter((b) => b.bookingStatus !== 'cancelled').length})` },
          { id: 'pending', label: `Pending (${pendingBookings.filter((b) => b.bookingStatus !== 'cancelled').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`pb-4 font-medium transition-colors border-b-2 text-sm md:text-base whitespace-nowrap ${
              filterStatus === tab.id
                ? 'text-[#004D40] border-b-[#004D40]'
                : 'text-[#999] border-b-transparent hover:text-[#666]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rentals Table/List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E8E0D5]">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-[#666] font-medium">
            {bookings.length === 0 ? 'No rentals yet' : 'No rentals with this filter'}
          </p>
          <p className="text-[#999] text-sm mt-2">
            {bookings.length === 0
              ? 'Start listing your outfits to earn from rentals!'
              : filterStatus === 'completed'
                ? 'No fully paid rentals to show'
                : filterStatus === 'pending'
                  ? 'No pending payment rentals'
                  : 'Try a different filter'}
          </p>
          {bookings.length > 0 && (
            <p className="text-xs text-[#999] mt-4">
              Total bookings: {bookings.length}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg border border-[#E8E0D5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E0D5] bg-[#F9F7F4]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Rental Period
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Days
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Daily Rate
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Payment Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#666] uppercase tracking-wide">
                      Booking Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, idx) => (
                    <tr key={booking._id || idx} className="border-b border-[#E8E0D5] hover:bg-[#FAF7F2]">
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-[#1A1A1A]">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#666]">{booking.totalDays} days</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#1A1A1A]">
                        {formatCurrency(booking.pricePerDay)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#004D40]">
                        {formatCurrency(getEarningsAmount(booking))}
                      </td>
                      <td className="px-6 py-4 text-sm">{getPaymentStatusBadge(booking.paymentStatus)}</td>
                      <td className="px-6 py-4 text-sm">{getBookingStatusBadge(booking.bookingStatus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredBookings.map((booking, idx) => (
              <div key={booking._id || idx} className="bg-white rounded-lg border border-[#E8E0D5] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#666] uppercase tracking-wide mb-1">Rental Period</p>
                    <p className="font-semibold text-[#1A1A1A]">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </p>
                    <p className="text-xs text-[#999] mt-1">{booking.totalDays} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-[#666] uppercase tracking-wide mb-1">Amount</p>
                      <p className="font-bold text-lg text-[#004D40]">{formatCurrency(getEarningsAmount(booking))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#E8E0D5]">
                  {getPaymentStatusBadge(booking.paymentStatus)}
                  {getBookingStatusBadge(booking.bookingStatus)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-[#F9F7F4] rounded-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide font-medium mb-2">Active Rentals</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{activeBookings.length}</p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide font-medium mb-2">Fully Collected</p>
            <p className="text-3xl font-bold text-green-600">{completedBookings.filter((b) => b.bookingStatus !== 'cancelled').length}</p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide font-medium mb-2">To Collect Later</p>
            <p className="text-3xl font-bold text-yellow-600">{(partialBookings.filter((b) => b.bookingStatus !== 'cancelled').length + pendingBookings.filter((b) => b.bookingStatus !== 'cancelled').length)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyEarnings
