export const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`

export const calculateDays = (startDate, endDate) => {
  const diff = new Date(endDate) - new Date(startDate)
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export const calculateRentalTotal = (pricePerDay, deposit, startDate, endDate) => {
  const days = calculateDays(startDate, endDate)
  const rental = days * pricePerDay
  return { days, rental, deposit, total: rental + deposit }
}

export const truncate = (str, maxLen = 60) =>
  str.length > maxLen ? str.slice(0, maxLen) + '…' : str