import React from "react";

const ConfirmationModal = ({
  isOpen,
  title = "Are you sure?",
  message = "Please confirm this action.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const confirmButtonClass =
    confirmVariant === "danger"
      ? "bg-[#C8622A] hover:bg-[#B65524] text-white"
      : "bg-[#00342B] hover:bg-[#022920] text-white";

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
        <h3 className="text-lg font-bold text-[#1A1A1A]">{title}</h3>
        <p className="mt-2 text-sm text-[#666] leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-[#E8E0D5] text-sm font-semibold text-[#666] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-all disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${confirmButtonClass}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
