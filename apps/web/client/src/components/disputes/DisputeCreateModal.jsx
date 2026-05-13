import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCreateDispute } from "../../hooks/useDisputes";
import { DISPUTE_CATEGORY, DISPUTE_TYPE } from "@listnrent/shared/constants";

void motion;

const categoryOptions = Object.values(DISPUTE_CATEGORY).map((value) => ({
  value,
  label: value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" "),
}));

const fieldBase =
  "w-full rounded-2xl border border-[#E8E0D5] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none transition-all placeholder:text-[#A39A8D] focus:border-[#004D40] focus:ring-4 focus:ring-[#004D40]/8";

const errorClass = "border-red-300 focus:border-red-500 focus:ring-red-100";

const DisputeCreateModal = ({ isOpen, booking, listing, contextType, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { submit, loading } = useCreateDispute();
  const [form, setForm] = useState({ category: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});

  const supportType = contextType || (booking ? DISPUTE_TYPE.BOOKING_DISPUTE : listing ? DISPUTE_TYPE.LISTING_SUPPORT : DISPUTE_TYPE.GENERAL_SUPPORT);

  const bookingSummary = useMemo(() => {
    if (!booking) return null;

    return {
      bookingId: booking._id || booking.bookingId || booking.id,
      title: booking.listingId?.title || booking.listingTitle || "Booking",
      category: booking.listingId?.category || booking.listingCategory || "",
      size: booking.listingId?.size || booking.listingSize || "",
      dates: `${booking.startDate ? new Date(booking.startDate).toLocaleDateString("en-IN") : "—"} to ${booking.endDate ? new Date(booking.endDate).toLocaleDateString("en-IN") : "—"}`,
      amount: booking.totalAmount,
    };
  }, [booking]);

  const listingSummary = useMemo(() => {
    const source = listing || booking?.listingId || null;
    if (!source) return null;

    return {
      listingId: source._id || source.id || source.listingId,
      title: source.title || "Listing",
      image: source.images?.[0] || source.image || null,
      category: source.category || "—",
      pricePerDay: source.pricePerDay ?? source.pricing?.pricePerDay ?? 0,
      deposit: source.deposit ?? source.pricing?.deposit ?? 0,
      size: source.size || source.variant || "",
      ownerName: source.owner?.displayName || source.owner?.name || source.owner?.email || source.userName || "",
      ownerEmail: source.owner?.email || "",
    };
  }, [booking, listing]);

  const requestTitle = supportType === DISPUTE_TYPE.LISTING_SUPPORT
    ? "Raise listing support"
    : supportType === DISPUTE_TYPE.GENERAL_SUPPORT
      ? "Contact support"
      : "Raise a dispute";

  const requestDescription = supportType === DISPUTE_TYPE.LISTING_SUPPORT
    ? "Ask about this listing, pricing, fit, or availability with the listing context attached."
    : supportType === DISPUTE_TYPE.GENERAL_SUPPORT
      ? "Start a general support thread when there is no specific booking or listing attached."
      : "Tell us what happened and we’ll keep everything calm, clear, and traceable.";

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      setForm({ category: "", subject: "", message: "" });
      setErrors({});
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  const validate = () => {
    const nextErrors = {};

    if (supportType === DISPUTE_TYPE.BOOKING_DISPUTE && !bookingSummary?.bookingId) {
      nextErrors.context = "Booking details are missing.";
    }

    if (supportType === DISPUTE_TYPE.LISTING_SUPPORT && !listingSummary?.listingId) {
      nextErrors.context = "Listing details are missing.";
    }

    if (!form.subject.trim() || form.subject.trim().length < 5) {
      nextErrors.subject = "Subject should be at least 5 characters.";
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      nextErrors.message = "Please describe the issue in a little more detail.";
    }

    return nextErrors;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const response = await submit({
        bookingId: bookingSummary?.bookingId || undefined,
        listingId: listingSummary?.listingId || undefined,
        disputeType: supportType,
        subject: form.subject.trim(),
        message: form.message.trim(),
        category: form.category || undefined,
      });

      const dispute = response?.data?.dispute || response?.dispute;
      toast.success("Your support request is on its way.");
      onSuccess?.(response);
      onClose?.();

      if (dispute?._id || dispute?.disputeId) {
        navigate(`/disputes/${dispute._id || dispute.disputeId}`);
      }
    } catch (submitError) {
      toast.error(submitError.message || "Unable to create dispute right now.");
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-90 flex items-end justify-center bg-black/50 px-3 py-3 sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl max-h-[92dvh] overflow-hidden rounded-[28px] border border-[#E8E0D5] bg-[#FCFAF6] shadow-[0_28px_80px_rgba(0,0,0,0.24)]"
        >
          <div className="h-1.5 bg-[linear-gradient(90deg,#004D40,#D4AF37,#C8622A)]" />

          <div className="flex flex-col max-h-[calc(92dvh-6px)] overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#E8E0D5] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9E9E7A]">
                  {supportType === DISPUTE_TYPE.LISTING_SUPPORT ? "Listing Support" : supportType === DISPUTE_TYPE.GENERAL_SUPPORT ? "Support Center" : "Support Center"}
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A1A]">
                  {requestTitle}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B645A]">
                  {requestDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#E8E0D5] bg-white px-3 py-1.5 text-sm font-semibold text-[#666] transition-colors hover:border-[#D4AF37] hover:text-[#1A1A1A]"
              >
                Close
              </button>
            </div>

            <div className="grid gap-0 overflow-y-auto px-5 py-5 sm:grid-cols-[1.05fr_0.95fr] sm:gap-5 sm:px-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {errors.context && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.context}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={handleChange("category")}
                    className={fieldBase}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
                    Subject
                  </label>
                  <input
                    value={form.subject}
                    onChange={handleChange("subject")}
                    placeholder="Example: Outfit arrived with damage"
                    className={`${fieldBase} ${errors.subject ? errorClass : ""}`}
                  />
                  {errors.subject && <p className="mt-2 text-xs font-medium text-red-600">{errors.subject}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
                    Issue Description
                  </label>
                  <textarea
                    value={form.message}
                    onChange={handleChange("message")}
                    rows={7}
                    placeholder="Describe what happened, what you expected, and how we can help."
                    className={`${fieldBase} resize-none ${errors.message ? errorClass : ""}`}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#9E9E7A]">
                    <span>{Math.max(0, form.message.length)} / 5000</span>
                    {errors.message && <span className="font-medium text-red-600">{errors.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#E8E0D5] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-[#E8E0D5] bg-white px-5 py-3 text-sm font-semibold text-[#666] transition-all hover:border-[#D4AF37] hover:text-[#1A1A1A]"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[#004D40] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,77,64,0.24)] transition-all hover:bg-[#003830] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Sending request..." : "Submit dispute"}
                  </button>
                </div>
              </form>

              <aside className="mt-5 space-y-4 sm:mt-0">
                <div className="rounded-3xl border border-[#E8E0D5] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">
                    {supportType === DISPUTE_TYPE.LISTING_SUPPORT ? "Listing summary" : supportType === DISPUTE_TYPE.GENERAL_SUPPORT ? "Support summary" : "Booking summary"}
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-[#4F473F]">
                    {supportType === DISPUTE_TYPE.BOOKING_DISPUTE ? (
                      <>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E9E7A]">Booking</p>
                          <p className="mt-1 font-semibold text-[#1A1A1A]">#{bookingSummary?.bookingId?.slice(-8)?.toUpperCase?.() || bookingSummary?.bookingId || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E9E7A]">Outfit</p>
                          <p className="mt-1 font-semibold text-[#1A1A1A]">{bookingSummary?.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-[#FAF7F2] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Category</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{bookingSummary?.category || "—"}</p>
                          </div>
                          <div className="rounded-2xl bg-[#FAF7F2] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Size</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{bookingSummary?.size || "—"}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-[#FAF7F2] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Rental period</p>
                          <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{bookingSummary?.dates}</p>
                        </div>
                        <div className="rounded-2xl bg-[#FAF7F2] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Amount</p>
                          <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">₹{bookingSummary?.amount?.toLocaleString("en-IN") || "0"}</p>
                        </div>
                      </>
                    ) : supportType === DISPUTE_TYPE.LISTING_SUPPORT ? (
                      <>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9E9E7A]">Listing</p>
                          <p className="mt-1 font-semibold text-[#1A1A1A]">{listingSummary?.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-[#FAF7F2] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Category</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{listingSummary?.category || "—"}</p>
                          </div>
                          <div className="rounded-2xl bg-[#FAF7F2] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Size</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{listingSummary?.size || "—"}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-[#FAF7F2] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Pricing</p>
                          <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">₹{listingSummary?.pricePerDay?.toLocaleString("en-IN") || "0"}/day</p>
                          <p className="mt-1 text-xs text-[#8F8575]">Deposit ₹{listingSummary?.deposit?.toLocaleString("en-IN") || "0"}</p>
                        </div>
                        {listingSummary?.ownerName ? (
                          <div className="rounded-2xl bg-[#FAF7F2] p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Owner</p>
                            <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">{listingSummary.ownerName}</p>
                            {listingSummary.ownerEmail && <p className="mt-1 text-xs text-[#8F8575]">{listingSummary.ownerEmail}</p>}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="rounded-2xl bg-[#FAF7F2] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9E7A]">Context</p>
                        <p className="mt-1 text-sm font-semibold text-[#1A1A1A]">General support request</p>
                        <p className="mt-1 text-xs text-[#8F8575]">No booking or listing is attached to this thread.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E8E0D5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBF8F1_100%)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
                    What happens next
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#6B645A]">
                    <li>We’ll open a private support thread tied to this booking.</li>
                    <li>Support can respond, resolve, and ask for confirmation.</li>
                    <li>You’ll be able to reopen the conversation if the issue remains.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
      </motion.div>,
    </AnimatePresence>,
    document.body,
  );
};

export default DisputeCreateModal;