import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Button from "./Button";

const PaymentCheckout = ({ listing, renterId, startDate, endDate, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate required props
  if (!listing || !listing._id || !renterId) {
    return (
      <div className="sticky top-24 bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-lg">
        <p className="text-red-600">Error: Missing required listing information</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="sticky top-24 bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-lg">
        <p className="text-red-600">Error: Not authenticated</p>
      </div>
    );
  }

  // Calculate days and amount
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const rentalAmount = totalDays * listing.pricePerDay;
  const depositAmount = listing.deposit;
  const totalAmount = rentalAmount + depositAmount;

  const openCheckout = async (key, orderId, amount, idToken) => {
    try {
      // Step 3: Open Razorpay checkout
      const options = {
        key,
        amount,
        currency: "INR",
        order_id: orderId,
        name: "RentFit",
        description: `Rent: ${listing.title}`,
        image: listing.images?.[0] || null,
        handler: async (response) => {
          try {
            // Step 4: Verify payment on backend
            const verifyResponse = await fetch("http://localhost:5000/api/payments/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              const data = await verifyResponse.json();
              throw new Error(data.message || "Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            onSuccess(verifyData.data.booking);
            setLoading(false);
          } catch (err) {
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
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#C8622A",
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.open();
    } catch (err) {
      setError(err.message || "Failed to open payment gateway");
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the ID token - it's already fetched and stored in user object
      if (!user || !user.token) {
        throw new Error("User not authenticated");
      }
      const idToken = user.token;
        
      // Step 1: Create order on backend
      const orderResponse = await fetch("http://localhost:5000/api/payments/create-order", {
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
          pricePerDay: listing.pricePerDay,
          depositAmount: listing.deposit,
        }),
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
      setError(err.message || "Failed to process payment");
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Booking Summary</h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm border-b border-[#E8E0D5] pb-2">
          <span className="text-[#666]">Rental Days:</span>
          <span className="font-semibold text-[#1A1A1A]">{totalDays} days</span>
        </div>
        <div className="flex justify-between text-sm border-b border-[#E8E0D5] pb-2">
          <span className="text-[#666]">₹{listing.pricePerDay} × {totalDays} days</span>
          <span className="font-semibold text-[#1A1A1A]">₹{rentalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm border-b border-[#E8E0D5] pb-2">
          <span className="text-[#666]">Deposit (refundable)</span>
          <span className="font-semibold text-[#1A1A1A]">₹{depositAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold bg-[#FFF5F0] p-3 rounded">
          <span className="text-[#1A1A1A]">Total Amount</span>
          <span className="text-[#C8622A]">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading}
          variant="accent"
          size="lg"
          className="w-full"
        >
          {loading ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
};

export default PaymentCheckout;
