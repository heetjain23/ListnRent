import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { auth } from "../services/firebase";
import { getOptimizedImageUrl } from "../services/cloudinary";
import { BILLING_FEES } from "../constants";
import Button from "../components/ui/Button";
import { useSEO } from "../hooks/useSEO";

// ─── Ambient Background ───────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Soft emerald glow — top left */}
      <motion.div
        animate={{ x: [0, 22, -10, 0], y: [0, 16, 6, 0], opacity: [0.32, 0.48, 0.36, 0.32] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[16%] -left-[10%] rounded-full blur-3xl"
        style={{
          width: "min(48vw, 600px)",
          height: "min(48vw, 600px)",
          background: "radial-gradient(circle, rgba(0,52,43,0.14) 0%, rgba(0,52,43,0.06) 42%, rgba(0,52,43,0) 72%)",
        }}
      />
      {/* Warm gold glow — bottom right */}
      <motion.div
        animate={{ x: [0, -18, 8, 0], y: [0, -14, -4, 0], opacity: [0.24, 0.4, 0.3, 0.24] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-[10%] -right-[8%] rounded-full blur-3xl"
        style={{
          width: "min(42vw, 520px)",
          height: "min(42vw, 520px)",
          background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.08) 40%, rgba(212,175,55,0) 70%)",
        }}
      />
      {/* Terracotta whisper — mid */}
      <motion.div
        animate={{ x: [0, 12, -14, 0], y: [0, -10, 8, 0], opacity: [0.14, 0.24, 0.17, 0.14] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-[38%] left-[34%] rounded-full blur-[52px]"
        style={{
          width: "min(32vw, 380px)",
          height: "min(32vw, 380px)",
          background: "radial-gradient(circle, rgba(200,98,42,0.1) 0%, rgba(200,98,42,0.04) 40%, rgba(200,98,42,0) 70%)",
        }}
      />
      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,52,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      />
      {/* Ambient dots */}
      {[
        { top: "12%", left: "72%", size: 6,  color: "rgba(212,175,55,0.28)", ring: "rgba(212,175,55,0.07)", dur: 6.2, delay: 0.4 },
        { top: "78%", left: "14%", size: 8,  color: "rgba(0,52,43,0.18)",    ring: "rgba(0,52,43,0.05)",    dur: 5.8, delay: 1.1 },
        { top: "46%", left: "88%", size: 5,  color: "rgba(200,98,42,0.22)",  ring: "rgba(200,98,42,0.06)",  dur: 7.3, delay: 0.7 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.45, 1], opacity: [0.38, 0.82, 0.38] }}
          transition={{ duration: pt.dur, delay: pt.delay, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute rounded-full"
          style={{ top: pt.top, left: pt.left, width: pt.size, height: pt.size, background: pt.color, boxShadow: `0 0 0 6px ${pt.ring}` }}
        />
      ))}
    </div>
  );
}

// ─── Section wrapper with stagger animation ───────────────────────────────────
function Section({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Step Badge ───────────────────────────────────────────────────────────────
function StepBadge({ number, label }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-[#1A1A1A]"
        style={{ background: "linear-gradient(135deg, #D4AF37, #C8622A)" }}
      >
        {number}
      </div>
      <h2 className="text-lg font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
        {label}
      </h2>
    </div>
  );
}

// ─── Styled Input ─────────────────────────────────────────────────────────────
function StyledInput({ id, label, children, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B7340] mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[#AAA]">{hint}</p>}
    </div>
  );
}

function InputField({ id, name, value, onChange, placeholder, maxLength, type = "text", prefix, className = "" }) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div
      animate={{
        boxShadow: focused
          ? "0 0 0 3px rgba(0,52,43,0.12), 0 4px 16px rgba(0,52,43,0.08)"
          : "0 2px 6px rgba(0,0,0,0.04)",
      }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl overflow-hidden border bg-white ${focused ? "border-[rgba(0,52,43,0.4)]" : "border-[#E8E0D5]"} ${className}`}
    >
      <div className="flex">
        {prefix && (
          <span className="flex items-center px-4 bg-[#F7F2EA] border-r border-[#E8E0D5] text-sm font-semibold text-[#8B7340] shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-[#CCC] bg-transparent outline-none"
        />
      </div>
      {/* Focus underline */}
      <motion.div
        animate={{ scaleX: focused ? 1 : 0, originX: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 h-0.5 w-full bg-[linear-gradient(90deg,#00342B,#D4AF37)]"
      />
    </motion.div>
  );
}

// ─── Item Preview Card (in summary) ──────────────────────────────────────────
function ItemPreviewCard({ listing, dateRange, totalDays }) {
  const image = listing?.images?.[0];
  return (
    <div className="flex gap-4 items-center">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
        {image ? (
          <img
            src={getOptimizedImageUrl(image, { width: 128, height: 160, quality: "auto" })}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#F0EAE0,#E8D5C4)] text-2xl">
            🪡
          </div>
        )}
        {/* Gold shimmer */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(0,0,0,0.28)_100%)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] mb-0.5">
          {listing.category}
        </p>
        <h4
          className="text-base font-black text-[#1A1A1A] leading-tight truncate"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {listing.title}
        </h4>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[rgba(0,52,43,0.08)] border border-[rgba(0,52,43,0.14)] px-2.5 py-0.5 text-[10px] font-semibold text-[#00342B]">
            📅 {dateRange}
          </span>
          <span className="rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.25)] px-2.5 py-0.5 text-[10px] font-semibold text-[#8B7340]">
            🕐 {totalDays} day{totalDays > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Price Row ────────────────────────────────────────────────────────────────
function PriceRow({ label, value, sub, highlight, muted, large }) {
  return (
    <div className={`flex items-start justify-between gap-2 ${large ? "py-1" : ""}`}>
      <div className="flex-1">
        <span className={`${large ? "text-base font-bold" : "text-sm"} ${muted ? "text-[#AAA]" : highlight ? "text-[#00342B] font-bold" : "text-[#666]"}`}>
          {label}
        </span>
        {sub && <p className="text-[10px] text-[#BBB] mt-0.5">{sub}</p>}
      </div>
      <span className={`shrink-0 font-bold ${large ? "text-xl text-[#00342B]" : highlight ? "text-[#00342B]" : muted ? "text-[#CCC]" : "text-[#1A1A1A]"} ${large ? "" : "text-sm"}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Payment Split Visual ─────────────────────────────────────────────────────
function PaymentSplitCard({ rentalAmount, depositAmount, feesTotal }) {
  const payNow = rentalAmount / 2;
  const payLater = rentalAmount / 2 + depositAmount + feesTotal;
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.55 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(0,52,43,0.04) 0%, rgba(212,175,55,0.06) 100%)",
        border: "1px solid rgba(212,175,55,0.28)",
      }}
    >
      {/* Top accent */}
      <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">💳</span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8B7340]">
            How payment works
          </span>
        </div>
        {/* Split visual bar */}
        <div className="mb-4">
          <div className="flex rounded-full overflow-hidden h-2.5 mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#00342B]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[rgba(212,175,55,0.45)]"
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold">
            <span className="text-[#00342B]">Pay now · 50%</span>
            <span className="text-[#8B7340]">Pay at pickup · 50% + deposit + fees</span>
          </div>
        </div>
        {/* Breakdown */}
        <div className="space-y-2.5">
          {/* Now */}
          <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: "rgba(0,52,43,0.07)", border: "1px solid rgba(0,52,43,0.14)" }}>
            <div>
              <p className="text-xs font-bold text-[#00342B]">Charged now</p>
              <p className="text-[10px] text-[#777]">50% of rental • Confirms booking</p>
            </div>
            <span className="text-base font-black text-[#00342B]">{fmt(payNow)}</span>
          </div>
          {/* At pickup */}
          <div className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div>
              <p className="text-xs font-bold text-[#8B7340]">Due at pickup</p>
              <p className="text-[10px] text-[#AAA]">50% rental + deposit + fees</p>
            </div>
            <span className="text-base font-black text-[#8B7340]">{fmt(payLater)}</span>
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-[#AAA]">
          Deposit is 100% refundable when you return the outfit in the same condition.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useSEO({
    title: "Checkout",
    description: "Secure checkout for outfit rentals on ListnRent.",
    canonicalPath: "/checkout",
    noIndex: true,
  });

  const bookingData = location.state;
  const cartItems = bookingData?.cartItems || [];
  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;
  const listing = isCartCheckout ? cartItems[0]?.listing : bookingData?.listing;
  const renterId = isCartCheckout ? cartItems[0]?.renterId : bookingData?.renterId;
  const eventDate = isCartCheckout ? cartItems[0]?.eventDate : bookingData?.eventDate;
  const startDate = isCartCheckout ? cartItems[0]?.startDate : bookingData?.startDate;
  const endDate = isCartCheckout ? cartItems[0]?.endDate : bookingData?.endDate;
  const durationDays = isCartCheckout ? cartItems[0]?.durationDays : bookingData?.durationDays;

  const [formData, setFormData] = useState({
    mobileNumber: "",
    deliveryAddress: "",
    landmark: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const cartTotals = useMemo(() => {
    if (!isCartCheckout) return null;
    return cartItems.reduce(
      (acc, item) => {
        const il = item.listing || {};
        const d = Number(item.durationDays) || 1;
        acc.totalDays += d;
        acc.rentalAmount += d * (Number(il.pricePerDay) || 0);
        acc.depositAmount += Number(il.deposit) || 0;
        acc.cleaningFee += BILLING_FEES.CLEANING_FEE;
        acc.deliveryFee += BILLING_FEES.DELIVERY_FEE;
        return acc;
      },
      { totalDays: 0, rentalAmount: 0, depositAmount: 0, cleaningFee: 0, deliveryFee: 0 }
    );
  }, [isCartCheckout, cartItems]);

  useEffect(() => {
    if (!bookingData) {
      navigate("/");
    } else {
      window.scrollTo(0, 0);
      fetchUserDeliveryDetails();
    }
  }, [bookingData, navigate]);

  const getApiBaseUrl = () => {
    const env = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;
    if (env) return env.endsWith("/") ? env.slice(0, -1) : env;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return "http://localhost:5000";
    return window.location.origin;
  };

  const fetchUserDeliveryDetails = async () => {
    try {
      if (!user) return;
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/api/users/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
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

  if (!bookingData || (isCartCheckout && !cartTotals)) return null;

  const totalDays = isCartCheckout ? cartTotals.totalDays || 1 : durationDays || 1;
  const rentalAmount = isCartCheckout ? cartTotals.rentalAmount : totalDays * listing.pricePerDay;
  const depositAmount = isCartCheckout ? cartTotals.depositAmount : listing.deposit;
  const cleaningFee = isCartCheckout ? cartTotals.cleaningFee : BILLING_FEES.CLEANING_FEE;
  const deliveryFee = isCartCheckout ? cartTotals.deliveryFee : BILLING_FEES.DELIVERY_FEE;
  const feesTotal = cleaningFee + deliveryFee;
  const totalAmount = rentalAmount + depositAmount + feesTotal;
  const payNow = rentalAmount / 2;

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const dateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await fetch(`${getApiBaseUrl()}/api/users/delivery-details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(formData),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to save delivery details:", err);
    }
  };

  const openCheckout = async (key, orderId, amount, idToken) => {
    try {
      const options = {
        key, amount, currency: "INR", order_id: orderId,
        name: "ListnRent",
        description: isCartCheckout ? `Rent: ${cartItems.length} outfits` : `Rent: ${listing.title}`,
        image: listing?.images?.[0] || null,
        handler: async (response) => {
          try {
            const verifyUrl = isCartCheckout
              ? `${getApiBaseUrl()}/api/payments/verify-cart-payment`
              : `${getApiBaseUrl()}/api/payments/verify-payment`;
            const verifyPayload = isCartCheckout
              ? {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  cartItems: cartItems.map((item) => ({
                    listingId: item.listing._id,
                    renterId: item.renterId,
                    eventDate: item.eventDate,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    totalDays: item.durationDays || 1,
                    pricePerDay: item.listing.pricePerDay,
                    depositAmount: item.listing.deposit,
                    cleaningFee: BILLING_FEES.CLEANING_FEE,
                    deliveryFee: BILLING_FEES.DELIVERY_FEE,
                  })),
                  deliveryDetails: formData,
                }
              : {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  listingId: listing._id,
                  userId: user.uid,
                  renterId, eventDate, startDate, endDate, totalDays,
                  pricePerDay: listing.pricePerDay,
                  rentalAmount,
                  depositAmount: listing.deposit,
                  cleaningFee, deliveryFee, totalAmount,
                  deliveryDetails: formData,
                };

            const verifyResponse = await fetch(verifyUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
              body: JSON.stringify(verifyPayload),
              credentials: "include",
            });
            if (!verifyResponse.ok) {
              const data = await verifyResponse.json();
              throw new Error(data.message || "Payment verification failed");
            }
            const verifyData = await verifyResponse.json();
            await saveDeliveryDetailsToProfile(idToken);
            toast.success("🎉 Payment successful! 50% rental charged. Balance & deposit due at pickup.");
            navigate("/dashboard", {
              state: { activeTab: "orders", bookingData: verifyData.data.booking || verifyData.data.bookings },
            });
            setLoading(false);
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
            setError(err.message || "Payment verification failed");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        prefill: { name: user?.displayName || "", email: user?.email || "", contact: formData.mobileNumber },
        theme: { color: "#00342B" },
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
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      const idToken = await currentUser.getIdToken();

      const orderUrl = isCartCheckout
        ? `${getApiBaseUrl()}/api/payments/create-cart-order`
        : `${getApiBaseUrl()}/api/payments/create-order`;
      const orderBody = isCartCheckout
        ? {
            cartItems: cartItems.map((item) => ({
              listingId: item.listing._id,
              renterId: item.renterId,
              eventDate: item.eventDate,
              startDate: item.startDate,
              endDate: item.endDate,
              durationDays: item.durationDays || 1,
              pricePerDay: item.listing.pricePerDay,
              depositAmount: item.listing.deposit,
              cleaningFee: BILLING_FEES.CLEANING_FEE,
              deliveryFee: BILLING_FEES.DELIVERY_FEE,
            })),
            deliveryDetails: formData,
          }
        : {
            listingId: listing._id,
            renterId, startDate, endDate,
            durationDays: durationDays || 1,
            pricePerDay: listing.pricePerDay,
            depositAmount: listing.deposit,
            cleaningFee, deliveryFee,
            deliveryDetails: formData,
          };

      const orderResponse = await fetch(orderUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(orderBody),
        credentials: "include",
      });
      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.message || "Failed to create order");
      }
      const orderData = await orderResponse.json();
      const { orderId, amount, key } = orderData.data;

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        script.onerror = () => { setError("Failed to load payment gateway"); setLoading(false); };
        script.onload = () => openCheckout(key, orderId, amount, idToken);
      } else {
        openCheckout(key, orderId, amount, idToken);
      }
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
      setError(err.message || "Failed to process payment");
      setLoading(false);
    }
  };

  // ── Loading ──
  if (pageLoading) {
    return (
      <div className="relative min-h-screen bg-[#FAF7F2]">
        <AmbientBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,52,43,0.1))",
                border: "2px solid rgba(212,175,55,0.4)",
              }}
            >
              <span className="text-xl">⏳</span>
            </motion.div>
            <p className="text-sm text-[#888] tracking-wide">Preparing your checkout…</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAF7F2]">
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pt-28 pb-24">

        {/* ── Page Header ── */}
        <Section delay={0} className="mb-10">
          {/* Back button */}
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#777] hover:text-[#00342B] transition-colors"
          >
            <span>←</span>
            <span>Back to Cart</span>
          </motion.button>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
              Secure
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
              Final step — confirm your rental
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-black text-[#1A1A1A] leading-[1.06]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Checkout
          </h1>

          {/* Gold underline */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 h-0.75 max-w-28 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />
          <p className="mt-3 text-sm text-[#888] hidden md:block tracking-wide">
            You're almost there. Tell us where to deliver and confirm your booking.
          </p>
        </Section>

        {/* ── Main 2-col Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-12 items-start">

          {/* ══ LEFT COLUMN: Form ══════════════════════════════════════════════ */}
          <div className="flex flex-col gap-6">

            {/* 1. Who you are — identity reassurance */}
            <Section delay={0.1}>
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(250,247,242,0.88) 100%)",
                  border: "1px solid rgba(232,224,213,0.7)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                }}
              >
                {/* Top accent */}
                <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
                <div className="p-6 md:p-8">
                  <StepBadge number="1" label="Your Details" />

                  {/* Identity card — calms user, no action needed */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-5 flex items-center gap-4 rounded-2xl px-5 py-4"
                    style={{
                      background: "rgba(0,52,43,0.05)",
                      border: "1px solid rgba(0,52,43,0.12)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-[#FAF7F2]"
                      style={{ background: "linear-gradient(135deg, #00342B, #00695C)" }}
                    >
                      {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">{user?.displayName || "Guest"}</p>
                      <p className="text-[11px] text-[#888]">{user?.email}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[rgba(0,52,43,0.2)] bg-[rgba(0,52,43,0.06)] px-2.5 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00342B]" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#00342B]">Verified</span>
                    </div>
                  </motion.div>

                  {/* Mobile number */}
                  <StyledInput id="mobileNumber" label="Mobile Number" hint="We'll send booking updates to this number">
                    <InputField
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      maxLength="10"
                      type="tel"
                      prefix="+91"
                    />
                  </StyledInput>
                </div>
              </div>
            </Section>

            {/* 2. Where to deliver */}
            <Section delay={0.18}>
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(250,247,242,0.88) 100%)",
                  border: "1px solid rgba(232,224,213,0.7)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                }}
              >
                <div className="h-0.5 w-full bg-[linear-gradient(90deg,#C8622A,#D4AF37,transparent)]" />
                <div className="p-6 md:p-8">
                  <StepBadge number="2" label="Delivery Address" />

                  <div className="grid grid-cols-1 gap-4">
                    <StyledInput id="deliveryAddress" label="Full Address" hint="Flat/House No, Building, Street, Area — Mumbai only">
                      <InputField
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="Flat 4B, Sea View Apartments, Carter Road, Bandra West"
                      />
                    </StyledInput>

                    <div className="grid grid-cols-2 gap-4">
                      <StyledInput id="landmark" label="Landmark">
                        <InputField
                          id="landmark"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleInputChange}
                          placeholder="Near Linking Road"
                        />
                      </StyledInput>
                      <StyledInput id="pincode" label="Pincode">
                        <InputField
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="400050"
                          maxLength="6"
                        />
                      </StyledInput>
                    </div>
                  </div>

                  {/* Delivery note */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 flex items-start gap-3 rounded-2xl px-4 py-3"
                    style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)" }}
                  >
                    <span className="text-base shrink-0 mt-0.5">⚡</span>
                    <p className="text-[11px] leading-relaxed text-[#8B7340]">
                      <strong>Same-day delivery in Mumbai.</strong> We'll coordinate the exact delivery slot over WhatsApp after your booking is confirmed.
                    </p>
                  </motion.div>
                </div>
              </div>
            </Section>

            {/* 3. Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
                >
                  <span className="text-lg shrink-0">⚠️</span>
                  <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile: Order Summary (placed after delivery address) */}
            <Section delay={0.26} className="lg:hidden">
              <div
                className="rounded-3xl overflow-hidden mb-4"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(250,247,242,0.9) 100%)",
                  border: "1px solid rgba(232,224,213,0.7)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
                <div className="p-5">
                  <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-3.5">
                    <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">Review</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B7340]">Order Summary</span>
                  </div>

                  <div className="mb-4 pb-4 border-b border-[#F0E8DB]">
                    <ItemPreviewCard listing={listing} dateRange={dateRange} totalDays={totalDays} />
                  </div>

                  <div className="space-y-3 mb-4">
                    <PriceRow label={`Rental fee · ${totalDays} day${totalDays > 1 ? "s" : ""}`} value={fmt(rentalAmount)} />
                    <PriceRow label="Refundable deposit" value={fmt(depositAmount)} sub="100% back on return" />
                    <PriceRow label="Cleaning fee" value={cleaningFee === 0 ? "Free" : fmt(cleaningFee)} muted={cleaningFee === 0} />
                    <PriceRow label="Delivery fee" value={deliveryFee === 0 ? "Free" : fmt(deliveryFee)} muted={deliveryFee === 0} />
                  </div>

                  <div className="rounded-2xl px-4 py-3.5 mb-4" style={{ background: "linear-gradient(135deg, rgba(0,52,43,0.07), rgba(0,52,43,0.04))", border: "1px solid rgba(0,52,43,0.14)" }}>
                    <PriceRow label="Full order value" value={fmt(totalAmount)} highlight large />
                  </div>

                  <motion.button
                    onClick={handleConfirmAndPay}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="relative w-full overflow-hidden rounded-2xl py-4 text-sm font-bold tracking-[0.08em] text-[#1A1A1A] shadow-[0_8px_28px_rgba(212,175,55,0.28)] disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    style={{ background: loading ? "rgba(212,175,55,0.5)" : "#D4AF37" }}
                  >
                    <span className="relative z-10">{loading ? "Processing…" : `Confirm & Pay ${fmt(payNow)}`}</span>
                    {!loading && (
                      <motion.div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" style={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                    )}
                  </motion.button>
                  <p className="mt-1 text-center text-[10px] text-[#AAA] tracking-wide">Balance + deposit collected at pickup · 100% refundable deposit</p>
                </div>
              </div>
            </Section>

            {/* 3. Payment split explanation — shown AFTER the mobile CTA so user sees order then payment flow */}
            <Section delay={0.32}>
              <PaymentSplitCard rentalAmount={rentalAmount} depositAmount={depositAmount} feesTotal={feesTotal} />
            </Section>

            {/* Trust strip — bottom of form */}
            <Section delay={0.38}>
              <motion.div
                className="flex flex-wrap gap-5 pt-4 border-t border-[rgba(212,175,55,0.2)]"
              >
                {[
                  { icon: "🔒", label: "SSL Encrypted" },
                  { icon: "🌿", label: "Sustainable Fashion" },
                  { icon: "🧹", label: "Dry Cleaning Included" },
                  { icon: "↩️", label: "Easy Returns" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.42 + i * 0.07 }}
                    className="flex items-center gap-1.5"
                  >
                    <span className="text-sm text-[#D4AF37]">{item.icon}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#AAA]">{item.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          </div>

          {/* ══ RIGHT COLUMN: Summary + Sticky CTA ════════════════════════════ */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.14, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-28 flex flex-col gap-5"
            >
              {/* Summary card */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(250,247,242,0.9) 100%)",
                  border: "1px solid rgba(232,224,213,0.7)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.07)",
                }}
              >
                <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
                <div className="p-6">

                  {/* Eyebrow */}
                  <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-3.5">
                    <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
                      Review
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B7340]">
                      Order Summary
                    </span>
                  </div>

                  {/* Item preview — "what am I paying for?" first */}
                  <div className="mb-5 pb-5 border-b border-[#F0E8DB]">
                    <ItemPreviewCard listing={listing} dateRange={dateRange} totalDays={totalDays} />
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-3 mb-4">
                    <PriceRow
                      label={`Rental fee · ${totalDays} day${totalDays > 1 ? "s" : ""}`}
                      value={fmt(rentalAmount)}
                    />
                    <PriceRow
                      label="Refundable deposit"
                      value={fmt(depositAmount)}
                      sub="100% back on return"
                    />
                    <PriceRow
                      label="Cleaning fee"
                      value={cleaningFee === 0 ? "Free" : fmt(cleaningFee)}
                      muted={cleaningFee === 0}
                    />
                    <PriceRow
                      label="Delivery fee"
                      value={deliveryFee === 0 ? "Free" : fmt(deliveryFee)}
                      muted={deliveryFee === 0}
                    />
                  </div>

                  {/* Total bar */}
                  <div
                    className="rounded-2xl px-4 py-3.5 mb-5"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,52,43,0.07), rgba(0,52,43,0.04))",
                      border: "1px solid rgba(0,52,43,0.14)",
                    }}
                  >
                    <PriceRow label="Full order value" value={fmt(totalAmount)} highlight large />
                  </div>

                  {/* Pay-now callout */}
                  <div
                    className="rounded-2xl px-4 py-3.5 mb-5"
                    style={{
                      background: "linear-gradient(135deg, #00342B, #005040)",
                      boxShadow: "0 8px 24px rgba(0,52,43,0.22)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-0.5">
                          Charged today
                        </p>
                        <p className="text-[10px] text-white/55">50% rental · confirms booking</p>
                      </div>
                      <span
                        className="text-2xl font-black text-white"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {fmt(payNow)}
                      </span>
                    </div>
                    {/* Animated gold underline */}
                    <motion.div
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-3 h-0.5 w-full rounded-full bg-[linear-gradient(90deg,#D4AF37,rgba(212,175,55,0.2))]"
                    />
                  </div>

                  {/* Desktop CTA */}
                  <motion.button
                    onClick={handleConfirmAndPay}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -1 }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="relative w-full overflow-hidden rounded-2xl py-4 text-sm font-bold tracking-[0.08em] text-[#1A1A1A] shadow-[0_8px_28px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    style={{ background: loading ? "rgba(212,175,55,0.5)" : "#D4AF37" }}
                  >
                    <span className="relative z-10">
                      {loading ? "Processing…" : `Confirm & Pay ${fmt(payNow)}`}
                    </span>
                    {!loading && (
                      <motion.div
                        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
                        style={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.button>

                  <p className="text-center text-[10px] text-[#BBB] leading-relaxed tracking-wide">
                    By confirming you agree to ListnRent's Rental Agreement · Secure SSL payment
                  </p>
                </div>
              </div>

              {/* Trust badges panel */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="rounded-3xl border border-[rgba(232,224,213,0.7)] bg-white/80 p-5 backdrop-blur-sm"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "🧹", title: "Dry Cleaning", sub: "Included with every rental" },
                    { icon: "✓", title: "Quality Verified", sub: "Authenticated pieces only" },
                    { icon: "⭐", title: "4.9 / 5 Rating", sub: "340+ happy renters" },
                    { icon: "↩️", title: "Easy Returns", sub: "We handle pickup" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      className="flex flex-col gap-1"
                    >
                      <span className="text-base text-[#D4AF37]">{item.icon}</span>
                      <p className="text-[11px] font-bold text-[#1A1A1A]">{item.title}</p>
                      <p className="text-[10px] text-[#AAA] leading-tight">{item.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;