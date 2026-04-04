import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";
import { getOptimizedImageUrl } from "../services/cloudinary";
import { BILLING_FEES } from "../constants";
import Button from "../components/ui/Button";

const Checkout = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const { user } = useAuth();

  // Get booking details from navigation state
  const bookingData = location.state;

  const [formData, setFormData] = useState({
    mobileNumber: "",
    deliveryAddress: "",
    landmark: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Redirect if no booking data and scroll to top
  useEffect(() => {
    if (!bookingData) {
      navigate("/");
    } else {
      window.scrollTo(0, 0);
      // Fetch saved delivery details from user profile
      fetchUserDeliveryDetails();
    }
  }, [bookingData, navigate]);

  const fetchUserDeliveryDetails = async () => {
    try {
      if (!user) return;
      
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const idToken = await currentUser.getIdToken();

      const response = await fetch(`${getApiBaseUrl()}/api/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.deliveryDetails) {
          setFormData({
            mobileNumber: data.user.deliveryDetails.mobileNumber || "",
            deliveryAddress: data.user.deliveryDetails.deliveryAddress || "",
            landmark: data.user.deliveryDetails.landmark || "",
            pincode: data.user.deliveryDetails.pincode || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch delivery details:", err);
    } finally {
      setPageLoading(false);
    }
  };

  if (!bookingData) {
    return null;
  }

  const { listing, renterId, startDate, endDate, durationDays } = bookingData;

  // Calculate days and amount using durationDays (actual rental duration)
  const totalDays = durationDays || 1;
  const rentalAmount = totalDays * listing.pricePerDay;
  const depositAmount = listing.deposit;
  const cleaningFee = BILLING_FEES.CLEANING_FEE;
  const deliveryFee = BILLING_FEES.DELIVERY_FEE;
  const feesTotal = cleaningFee + deliveryFee;
  const totalAmount = rentalAmount + depositAmount + feesTotal;

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.mobileNumber.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      setError("Delivery address is required");
      return false;
    }
    if (!formData.landmark.trim()) {
      setError("Landmark is required");
      return false;
    }
    if (!formData.pincode.match(/^\d{6}$/)) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }
    return true;
  };

  const saveDeliveryDetailsToProfile = async (idToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/delivery-details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Delivery details saved to profile");
      }
    } catch (err) {
      console.error("Failed to save delivery details:", err);
      // Don't show error to user as payment was successful
    }
  };

  const getApiBaseUrl = () => {
    const env = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;
    if (env) return env.endsWith("/") ? env.slice(0, -1) : env;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    return window.location.origin;
  };

  const openCheckout = async (key, orderId, amount, idToken) => {
    try {
      const options = {
        key,
        amount,
        currency: "INR",
        order_id: orderId,
        name: "ListnRent",
        description: `Rent: ${listing.title}`,
        image: listing.images?.[0] || null,
        handler: async (response) => {
          try {
            console.log("[Checkout] Payment handler called with response:", response);
            console.log("[Checkout] Sending delivery details:", formData);
            
            const verifyResponse = await fetch(`${getApiBaseUrl()}/api/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                listingId: listing._id,
                userId: user.uid,
                renterId,
                startDate,
                endDate,
                totalDays,
                pricePerDay: listing.pricePerDay,
                rentalAmount,
                depositAmount: listing.deposit,
                cleaningFee,
                deliveryFee,
                totalAmount,
                deliveryDetails: formData,
              }),
              credentials: "include",
            });

            if (!verifyResponse.ok) {
              const data = await verifyResponse.json();
              throw new Error(data.message || "Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            
            // Save delivery details to user profile
            await saveDeliveryDetailsToProfile(idToken);
            
            // Show success toast
            toast.success('🎉 Payment successful! 50% rental charged. Balance & deposit due at pickup.')
            
            // Navigate to success page or dashboard
            navigate("/dashboard", { state: { bookingData: verifyData.data.booking } });
            setLoading(false);
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
            setError(err.message || "Payment verification failed");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
          contact: formData.mobileNumber,
        },
        theme: {
          color: "#163B35",
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err) {
      toast.error(err.message || "Failed to open payment gateway");
      setError(err.message || "Failed to open payment gateway");
      setLoading(false);
    }
  };

  const handleConfirmAndPay = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await currentUser.getIdToken();

      // Step 1: Create order on backend
      const orderResponse = await fetch(`${getApiBaseUrl()}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          listingId: listing._id,
          renterId,
          startDate,
          endDate,
          durationDays: durationDays || 1,
          pricePerDay: listing.pricePerDay,
          depositAmount: listing.deposit,
          cleaningFee,
          deliveryFee,
          deliveryDetails: formData,
        }),
        credentials: "include",
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.message || "Failed to create order");
      }

      const orderData = await orderResponse.json();
      const { orderId, amount, key } = orderData.data;

      // Step 2: Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onerror = () => {
          setError("Failed to load payment gateway");
          setLoading(false);
        };

        script.onload = () => {
          openCheckout(key, orderId, amount, idToken);
        };
      } else {
        openCheckout(key, orderId, amount, idToken);
      }
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
      setError(err.message || "Failed to process payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5] pt-20 md:pt-24">
      {/* Loading State */}
      {pageLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="w-12 h-12 border-4 border-[#E8E0D5] border-t-[#163B35] rounded-full"></div>
            </div>
            <p className="text-[#666]">Loading checkout details...</p>
          </div>
        </div>
      )}

      {!pageLoading && (
        <>
      {/* Header */}
      <div className="border-b border-[#E8E0D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button and Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm text-[#666]">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-[#163B35] hover:text-[#163B35]/80 font-medium transition-colors mr-2"
              aria-label="Go back"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <span className="text-[#999]">|</span>
            <span>Cart</span>
            <span>›</span>
            <span className="font-medium text-[#1A1A1A]">Secure Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#163B35]">
            Finalize Your Selection
          </h1>
          <p className="text-[#666] mt-2">
            Review your heritage rental details and complete the booking for your upcoming occasion.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Delivery Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 md:p-8">
              {/* Delivery Details Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#163B35] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">Delivery Details</h2>
                </div>

                <div className="space-y-5">
                  {/* User Name Display and Mobile Number */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Full Name
                    </label>
                    <div className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg bg-[#F5F5F5] text-[#1A1A1A]">
                      {user?.displayName || "Not available"}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 bg-[#F5F5F5] border border-[#E8E0D5] rounded-l-lg text-sm text-[#666]">
                        +91
                      </span>
                      <input
                        id="mobileNumber"
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        maxLength="10"
                        className="flex-1 px-4 py-3 border border-l-0 border-[#E8E0D5] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#163B35] placeholder-[#CCC]"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Delivery Address (Mumbai only)
                    </label>
                    <input
                      id="deliveryAddress"
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Flat/House No, Building, Area"
                      className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163B35] placeholder-[#CCC]"
                    />
                  </div>

                  {/* Landmark and Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="landmark" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Landmark
                      </label>
                      <input
                        id="landmark"
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        placeholder="Near Gateway of India"
                        className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163B35] placeholder-[#CCC]"
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength="6"
                        className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163B35] placeholder-[#CCC]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Mobile: Confirm Button */}
              <div className="lg:hidden">
                <Button
                  onClick={handleConfirmAndPay}
                  disabled={loading}
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  {loading ? "Processing..." : `Pay ₹${(rentalAmount / 2).toLocaleString("en-IN")} Now`}
                </Button>
                <p className="text-xs text-[#999] text-center mt-2">
                  Secure payment. Balance & deposit due at pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-6 sticky top-24">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">Order Summary</h3>

              {/* Item Card */}
              <div className="mb-6 pb-6 border-b border-[#E8E0D5]">
                <div className="flex gap-4 mb-4">
                  <div className="w-24 h-24 bg-[#F5F5F5] rounded-lg overflow-hidden">
                    {listing.images?.[0] && (
                      <img
                        src={getOptimizedImageUrl(listing.images[0], { width: 96, height: 96, quality: 'auto' })}
                        alt={listing.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] mb-1">{listing.title}</h4>
                    <p className="text-sm text-[#666] mb-2">{listing.category}</p>
                    <p className="text-sm text-[#163B35] font-medium">{dateRange}</p>
                    <p className="text-xs text-[#999] mt-1">{totalDays} Days</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Rental Fee ({totalDays} Days)</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    ₹{rentalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Refundable Deposit</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    ₹{depositAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Cleaning Fee</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {cleaningFee === 0 ? "Free" : `₹${cleaningFee.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Delivery Fee</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Payment Split Information */}
              <div className="mb-6 p-4 bg-[#FFF4E6] border border-[#FFE0CC] rounded-lg">
                <h4 className="font-semibold text-[#163B35] mb-3 flex items-center gap-2">
                  <span>💳</span>
                  <span>Payment Breakdown</span>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#666]">
                      <span className="font-medium">50% Rental Amount</span> (Charged Now)
                    </span>
                    <span className="font-semibold text-[#163B35]">
                      ₹{(rentalAmount / 2).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">
                      <span className="font-medium">50% Rental Amount</span> (Due at Pickup)
                    </span>
                    <span className="font-semibold text-[#FF8C42]">
                      ₹{(rentalAmount / 2).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">
                      <span className="font-medium">Refundable Deposit</span> (Due at Pickup)
                    </span>
                    <span className="font-semibold text-[#FF8C42]">
                      ₹{depositAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666]">
                      <span className="font-medium">Cleaning Fee & Delivery Fee</span> (Due at Pickup)
                    </span>
                    <span className="font-semibold text-[#FF8C42]">
                      ₹{feesTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="border-t border-[#FFE0CC] pt-2 mt-2 flex justify-between">
                    <span className="text-[#666] font-medium">Amount to Pay Now</span>
                    <span className="font-bold text-lg text-[#163B35]">
                      ₹{(rentalAmount / 2).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#666] mt-3 pt-3 border-t border-[#FFE0CC]">
                  ℹ️ The remaining 50% of rental amount, refundable deposit, and applicable fees will be collected at the time of pickup. The deposit is fully refundable after you return the item in good condition.
                </p>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 bg-[#163B35] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Amount Due</span>
                  <span className="text-xl font-bold text-[#9EC89E]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Desktop: Confirm Button */}
              <div className="hidden lg:block mb-6">
                <Button
                  onClick={handleConfirmAndPay}
                  disabled={loading}
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  {loading ? "Processing..." : `Pay ₹${(rentalAmount / 2).toLocaleString("en-IN")} Now`}
                </Button>
                <p className="text-xs text-[#999] text-center mt-2">
                  Secure payment. Balance & deposit due at pickup.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 pt-4 border-t border-[#E8E0D5]">
                <div className="flex items-center justify-center gap-2 text-center text-xs">
                  <div className="flex flex-col items-center">
                    <div className="text-lg mb-1">🧹</div>
                    <span className="font-medium text-[#1A1A1A]">Professional</span>
                    <span className="text-[#666] text-xs">Dry Cleaning Included</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-center text-xs">
                  <div className="flex flex-col items-center">
                    <div className="text-lg mb-1">✓</div>
                    <span className="font-medium text-[#1A1A1A]">100% Quality</span>
                    <span className="text-[#666] text-xs">Authenticity Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-[#999] text-center mt-4">
                By clicking you agree to ListnRent's Rental Agreement and Cancellation Policy
              </p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
