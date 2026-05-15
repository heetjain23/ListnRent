import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import DisputeCreateModal from "../components/disputes/DisputeCreateModal";
import { auth } from "../services/firebase";
import { getOptimizedImageUrl } from "../services/cloudinary";
import jsPDF from "jspdf";
import { useSEO } from "../hooks/useSEO";

void motion;

const OrderDetail = () => {
  const { bookingId } = useParams();
  useSEO({
    title: "Order Details",
    description: "View your rental order details and timeline on ListnRent.",
    canonicalPath: `/order/${bookingId || ''}`,
    noIndex: true,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  const formatTimelineDate = (value) => {
    if (!value) return "Pending";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Pending";
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const normalizeTimelineItems = (items = []) =>
    items.map((item) => ({
      ...item,
      status: item.completed ? "completed" : "pending",
      dateLabel: formatTimelineDate(item.at),
    }));

  const getApiBaseUrl = () => {
    const env = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;
    if (env) return env.endsWith("/") ? env.slice(0, -1) : env;
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000";
    }
    return window.location.origin;
  };

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await currentUser.getIdToken();

      console.log("[OrderDetail] Fetching booking:", bookingId);
      const response = await fetch(
        `${getApiBaseUrl()}/api/payments/booking/${bookingId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const data = await response.json();
      console.log("[OrderDetail] Booking fetched:", data.data);
      console.log("[OrderDetail] DeliveryDetails:", data.data?.deliveryDetails);
      setBooking(data.data?.booking || data.data);
    } catch (err) {
      console.error("[OrderDetail] Error fetching booking:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (bookingId) {
      console.log("[OrderDetail] Fetching latest booking details for timeline...");
      queueMicrotask(() => {
        void fetchBooking();
      });
    }
  }, [bookingId, fetchBooking]);

  const getStatusBadgeInfo = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "✓ COMPLETED",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: "✓",
        };
      case "active":
        return {
          label: "→ IN TRANSIT",
          bgColor: "bg-[#E5BF37]",
          textColor: "text-[#00342B]",
          icon: "→",
        };
      case "cancelled":
        return {
          label: "✗ CANCELLED",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: "✗",
        };
      case "pending":
        return {
          label: "⏱ PENDING",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: "⏱",
        };
      case "failed":
        return {
          label: "✗ PAYMENT FAILED",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: "✗",
        };
      default:
        return {
          label: status?.toUpperCase(),
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: "•",
        };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatCurrencyForPDF = (amount) => {
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs. ${formatted}`;
  };

  const generateInvoicePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Company Header
    doc.setFillColor(0, 52, 43); // #00342B
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(244, 215, 124); // #E5BF37
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("ListnRent", margin, yPosition + 12);
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "normal");
    doc.text("Premium Fashion Rental", margin, yPosition + 18);
    doc.text("www.listnrent.com | support@listnrent.com", margin, yPosition + 23);
    yPosition += 35;

    // Invoice Title and Details
    doc.setTextColor(0, 52, 43);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", margin, yPosition);

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    yPosition += 8;
    doc.text(`Invoice Number: ${booking._id?.slice(-8).toUpperCase() || "N/A"}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Invoice Date: ${formatDate(new Date())}`, margin, yPosition);
    yPosition += 10;

    // Bill To Section
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 52, 43);
    doc.text("BILL TO:", margin, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    const user = booking.userId || {};
    const lines = [
      user.name || "Customer",
      booking.deliveryDetails?.deliveryAddress || "Address N/A",
      `${booking.deliveryDetails?.landmark || ""} ${booking.deliveryDetails?.pincode || ""}`.trim(),
      `Phone: ${booking.deliveryDetails?.mobileNumber || "N/A"}`,
    ];

    lines.forEach((line) => {
      if (line) {
        doc.text(line, margin, yPosition);
        yPosition += 4;
      }
    });

    yPosition += 5;

    // Rental Details
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 98, 42); // #C8622A
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("RENTAL DETAILS", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.text(`Outfit: ${booking.listingId?.title || "Outfit Bundle"}`, margin, yPosition);
    yPosition += 4;
    doc.text(
      `Category: ${booking.listingId?.category || "N/A"}`,
      margin,
      yPosition
    );
    yPosition += 4;
    if (booking.listingId?.size) {
      doc.text(`Size: ${booking.listingId.size}`, margin, yPosition);
      yPosition += 4;
    }
    doc.text(
      `Rental Period: ${booking.totalDays} days`,
      margin,
      yPosition
    );
    yPosition += 4;
    doc.text(
      `From: ${formatDate(booking.startDate)} To: ${formatDate(booking.endDate)}`,
      margin,
      yPosition
    );
    yPosition += 8;

    // Payment Breakdown Table Header
    doc.setLineWidth(0.3);
    doc.setDrawColor(232, 224, 213); // #E8E0D5
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    const descCol = margin;
    const amountCol = pageWidth - margin - 30;

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("PAYMENT BREAKDOWN", margin, yPosition);
    yPosition += 6;

    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("Description", descCol, yPosition);
    doc.text("Amount", amountCol, yPosition);
    yPosition += 5;

    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Table Rows - Payment breakdown items
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    // Rental Fee Row
    doc.text("Rental Fee", descCol, yPosition);
    doc.text(formatCurrencyForPDF(booking.rentalAmount), amountCol, yPosition, { align: "left" });
    yPosition += 5;

    // Security Deposit Row
    doc.text("Security Deposit", descCol, yPosition);
    doc.text(formatCurrencyForPDF(booking.depositAmount), amountCol, yPosition, { align: "left" });
    yPosition += 5;

    // Delivery Charge Row (if applicable)
    if (booking.deliveryCharge) {
      doc.text("Delivery Charge", descCol, yPosition);
      doc.text(
        booking.deliveryCharge === 0 ? "Free" : formatCurrencyForPDF(booking.deliveryCharge),
        amountCol,
        yPosition,
        { align: "left" }
      );
      yPosition += 5;
    }

    yPosition += 3;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Total Row
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("TOTAL AMOUNT:", descCol, yPosition);
    doc.text(formatCurrencyForPDF(booking.totalAmount), amountCol, yPosition, { align: "left" });
    yPosition += 6;

    yPosition += 5;

    // Terms and Conditions
    doc.setTextColor(0, 52, 43);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("TERMS & CONDITIONS:", margin, yPosition);
    yPosition += 4;

    doc.setFont(undefined, "normal");
    doc.setFontSize(8);
    const terms = [
      "• Rental includes professional dry cleaning and maintenance.",
      "• Please return the outfit in the same condition as received.",
      "• Security deposit will be refunded within 5-7 business days after inspection.",
      "• Late return charges apply if the outfit is returned after the due date.",
      "• Contact support for any damage or issues with the outfit.",
      "• All terms are subject to ListnRent's rental policy.",
    ];

    terms.forEach((term) => {
      const splitText = doc.splitTextToSize(term, contentWidth - 5);
      splitText.forEach((line) => {
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin + 2, yPosition);
        yPosition += 3;
      });
    });

    yPosition += 5;

    // Footer
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 98, 42);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    doc.setTextColor(0, 52, 43);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text(
      "Thank you for choosing ListnRent! Enjoy your rental experience.",
      pageWidth / 2,
      pageHeight - 18,
      { align: "center" }
    );
    doc.text(
      "For support, contact: support@listnrent.com | +91-XXXXXXXXXX",
      pageWidth / 2,
      pageHeight - 12,
      { align: "center" }
    );
    doc.text(
      `Generated on: ${new Date().toLocaleString("en-IN")}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );

    // Download PDF
    doc.save(`ListnRent-Invoice-${booking._id}.pdf`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#FAF7F2] flex items-center justify-center"
      >
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading order details...</p>
        </div>
      </motion.div>
    );
  }

  if (!booking) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-[#666] mb-2">Order details not found</p>
          {error && <p className="text-red-600 text-sm mb-6">Error: {error}</p>}
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="px-6 py-2 bg-[#C8622A] text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Back to Orders
          </button>
        </div>
      </motion.div>
    );
  }

  const statusInfo = getStatusBadgeInfo(booking.bookingStatus);
  const customerTimeline = normalizeTimelineItems(booking.timeline?.customer || []);
  const canRaiseDispute = ["partial", "completed"].includes(booking.paymentStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="min-h-screen bg-[#FAF7F2] py-8 md:py-16 px-4 md:px-8 pt-16 md:pt-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-row items-center justify-between gap-4 mb-6">
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="text-[#C8622A] hover:text-[#1A1A1A] font-semibold transition-colors flex items-center gap-2 w-fit text-sm md:text-base"
            >
              ← Back to Orders
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className={`px-3 md:px-6 py-2 md:py-3 rounded-full w-fit font-bold text-sm md:text-lg ${statusInfo.bgColor} ${statusInfo.textColor}`}
            >
              {statusInfo.label}
            </motion.div>
          </div>
        </motion.div>

        {canRaiseDispute && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.3 }}
            className="mb-6 flex justify-end"
          >
            <button
              onClick={() => setIsDisputeOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D5] bg-white px-4 py-2.5 text-sm font-semibold text-[#004D40] shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition-all hover:border-[#D4AF37] hover:text-[#003830]"
            >
              <span>Need help?</span>
              <span>Raise Dispute</span>
            </button>
          </motion.div>
        )}

        {/* Main Content - Desktop: Grid, Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column: Outfit Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
                Outfit Details
              </h2>

              {/* Outfit Image */}
              {booking.listingId?.images?.[0] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mb-6 rounded-lg overflow-hidden bg-[#F5F5F5] aspect-square"
                >
                  <img
                    src={getOptimizedImageUrl(booking.listingId.images[0], {
                      width: 400,
                      height: 400,
                      quality: "auto",
                    })}
                    alt={booking.listingId.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Outfit Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="space-y-3"
              >
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">
                    {booking.listingId?.title || "Outfit Bundle"}
                  </h3>
                  {booking.listingId?.category && (
                    <p className="text-sm text-[#666] mt-1">
                      {booking.listingId.category}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="pt-4 border-t border-[#E8E0D5] space-y-3">
                  {booking.listingId?.size && (
                    <div className="flex justify-between">
                      <span className="text-[#666]">Size</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {booking.listingId.size}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#666]">Rental Period</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {booking.totalDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">Date</span>
                    <span className="font-semibold text-[#1A1A1A] text-right text-sm">
                      {formatDate(booking.startDate)} to{" "}
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>

                {/* View Styling Guide Button */}
                {booking.listingId?.stylingGuide && (
                  <button className="w-full mt-4 py-2 px-4 border border-[#C8622A] text-[#C8622A] hover:bg-[#FFE8E0] transition-colors rounded-lg font-semibold text-sm">
                    View Styling Guide →
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column: Payment Summary and Delivery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Payment Summary */}
            <div className="bg-[#00342B] text-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-6">Payment Summary</h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.35,
                  staggerChildren: 0.1,
                  duration: 0.4,
                }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between text-white/90"
                >
                  <span>Rental Fee</span>
                  <span>{formatCurrency(booking.rentalAmount)}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex justify-between text-white/90"
                >
                  <span>Security Deposit</span>
                  <span>{formatCurrency(booking.depositAmount)}</span>
                </motion.div>

                {booking.deliveryCharge && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between text-white/90"
                  >
                    <span>Delivery</span>
                    <span>
                      {booking.deliveryCharge === 0
                        ? "Free"
                        : formatCurrency(booking.deliveryCharge)}
                    </span>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="border-t border-white/20 pt-4 mt-4 flex justify-between"
                >
                  <span className="font-bold">Total </span>
                  <span className="text-2xl font-bold text-[#E5BF37]">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="border-t border-white/20 pt-4 mt-4 flex justify-between"
                >
                  <span className="font-bold">Paid Amount</span>
                  <span className="text-lg font-bold text-green-400">
                    {formatCurrency(booking.paidAmount || 0)}
                  </span>
                </motion.div>
              </motion.div>

              {/* Download Invoice Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateInvoicePDF}
                className="w-full mt-6 bg-[#E5BF37] hover:bg-[#E8D169] text-[#00342B] font-bold py-3 rounded-lg transition-colors"
              >
                ↓ Download Invoice
              </motion.button>
            </div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">📍</span>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  Delivery Address
                </h2>
              </div>

              {booking.deliveryDetails &&
              Object.keys(booking.deliveryDetails).length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2"
                >
                  <div className="space-y-1 text-[#666]">
                    {booking.deliveryDetails?.deliveryAddress && (
                      <p className="font-semibold text-[#1A1A1A]">
                        {booking.deliveryDetails.deliveryAddress}
                      </p>
                    )}
                    {booking.deliveryDetails?.landmark && (
                      <p className="text-sm">
                        📌 Landmark: {booking.deliveryDetails.landmark}
                      </p>
                    )}
                    {booking.deliveryDetails?.pincode && (
                      <p className="font-semibold text-[#1A1A1A]">
                        📬 {booking.deliveryDetails.pincode}
                      </p>
                    )}
                    {booking.deliveryDetails?.mobileNumber && (
                      <p className="pt-2 font-semibold">
                        📱 {booking.deliveryDetails.mobileNumber}
                      </p>
                    )}
                  </div>

                  {/* Delivery Info Note */}
                  {booking.bookingStatus === "active" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">🚚</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            Delivery executive will contact you 30 minutes
                            before arrival
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Make sure someone is available to receive the
                            package
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div>
                  <p className="text-[#666] mb-4">
                    No delivery details available
                  </p>
                  {/* Debug Panel */}
                  <details className="bg-gray-100 p-4 rounded-lg cursor-pointer text-xs">
                    <summary className="text-[#666] font-semibold mb-2">
                      Debug Info
                    </summary>
                    <div className="space-y-2 font-mono text-[#333]">
                      <p>
                        DeliveryDetails:{" "}
                        {booking.deliveryDetails
                          ? JSON.stringify(booking.deliveryDetails)
                          : "null"}
                      </p>
                      <p>
                        DeliveryDetails keys:{" "}
                        {booking.deliveryDetails
                          ? Object.keys(booking.deliveryDetails).join(", ")
                          : "none"}
                      </p>
                      <p>Booking ID: {booking._id}</p>
                      <p>Booking Status: {booking.bookingStatus}</p>
                    </div>
                  </details>
                </div>
              )}
            </motion.div>

            {/* Additional Info */}
            {booking.bookingStatus === "active" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="bg-linear-to-r from-[#E5BF37] to-[#E8D169] rounded-xl p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <h3 className="font-bold text-[#00342B] mb-2">
                      Everything You Need to Know
                    </h3>
                    <ul className="text-sm text-[#00342B] space-y-2">
                      <li>
                        • Your rental includes dry cleaning and maintenance
                      </li>
                      <li>• Return the outfit in the same condition</li>
                      <li>• Late return charges apply</li>
                      <li>• Contact support for any issues with the outfit</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Customer Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="bg-white rounded-xl border border-[#E8E0D5] p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-5">Order Timeline</h2>

              <div className="space-y-4">
                {customerTimeline.length > 0 ? (
                  customerTimeline.map((event, index) => (
                    <div key={event.key || index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-6 w-6 rounded-full grid place-items-center text-xs font-bold text-white ${
                            event.status === "completed" ? "bg-[#004D40]" : "bg-[#D4C5B5]"
                          }`}
                        >
                          {event.status === "completed" ? "✓" : "•"}
                        </div>
                        {index < customerTimeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-[#E8E0D5] mt-1" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{event.label}</p>
                        <p className="text-xs text-[#777] mt-1">{event.dateLabel}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#777]">Timeline will appear here once booking events start.</p>
                )}
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          {booking.bookingStatus === "active" && (
            <>
              <button className="flex-1 px-6 py-3 bg-[#C8622A] text-white font-bold rounded-lg hover:bg-opacity-90 transition-all">
                Need Help?
              </button>
              <button className="flex-1 px-6 py-3 border-2 border-[#C8622A] text-[#C8622A] font-bold rounded-lg hover:bg-[#FFE8E0] transition-all">
                Schedule Return Pickup
              </button>
            </>
          )}
          {booking.bookingStatus === "completed" && (
            <button className="flex-1 px-6 py-3 border-2 border-[#C8622A] text-[#C8622A] font-bold rounded-lg hover:bg-[#FFE8E0] transition-all">
              Write a Review
            </button>
          )}
        </motion.div>
      </div>

      <DisputeCreateModal
        isOpen={isDisputeOpen}
        booking={booking}
        onClose={() => setIsDisputeOpen(false)}
        onSuccess={(response) => {
          const dispute = response?.data?.dispute || response?.dispute;
          if (dispute?._id || dispute?.disputeId) {
            navigate(`/dashboard/disputes/${dispute._id || dispute.disputeId}`);
          }
        }}
      />
    </motion.div>
  );
};

export default OrderDetail;
