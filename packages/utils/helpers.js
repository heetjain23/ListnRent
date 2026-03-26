export const formatPrice = (price) => {
  return `₹${price}`;
};

export const calculateDays = (startDate, endDate) => {
  const diff = new Date(endDate) - new Date(startDate);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};