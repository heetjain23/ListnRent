import React from "react";
import { CATEGORIES, SIZES, OCCASIONS } from "../../constants";

const FilterModal = ({
  isOpen,
  onClose,
  selectedCategories,
  toggleCategory,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  selectedOccasion,
  handleOccasionChange,
  minMaxPrice,
}) => {
  const handleSizeChange = (size) => {
    setSelectedSize(selectedSize === size ? "All" : size);
  };

  const handlePriceChange = (e) => {
    const newMax = Math.max(parseInt(e.target.value), priceRange[0]);
    setPriceRange([priceRange[0], newMax]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end overflow-hidden">
        <div className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Filters</h2>
            <button
              onClick={onClose}
              className="text-2xl text-[#999] hover:text-[#1A1A1A]"
            >
              ✕
            </button>
          </div>

          {/* Category */}
          <div className="mb-6 pb-6 border-b border-[#E8E0D5]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Category
            </h3>
            <div className="space-y-3">
              {CATEGORIES.filter((cat) => cat !== "All").map((category) => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4 rounded border-gray-300 text-[#C8622A] focus:ring-[#C8622A] cursor-pointer"
                  />
                  <span className="ml-3 text-[#666] group-hover:text-[#1A1A1A] transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6 pb-6 border-b border-[#E8E0D5]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Size</h3>
            <div className="flex gap-2 flex-wrap">
              {SIZES.filter((size) => size !== "All").map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-2 rounded-md font-medium transition-all text-sm ${
                    selectedSize === size
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E8E0D5]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6 pb-6 border-b border-[#E8E0D5]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Price / Day
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[#666] text-sm">
                  ₹{priceRange ? priceRange[0] : minMaxPrice[0]}
                </span>
                <span className="text-[#999]">—</span>
                <span className="text-[#666] text-sm">
                  ₹{priceRange ? priceRange[1] : minMaxPrice[1]}+
                </span>
              </div>
              {priceRange && (
                <input
                  type="range"
                  min={minMaxPrice[0]}
                  max={minMaxPrice[1]}
                  step={100}
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  className="w-full"
                />
              )}
            </div>
          </div>

          {/* Occasion */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Occasion
            </h3>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="occasion"
                  checked={selectedOccasion === ""}
                  onChange={() => handleOccasionChange("")}
                  className="w-4 h-4 text-[#C8622A] focus:ring-[#C8622A] cursor-pointer"
                />
                <span className="ml-3 text-[#666] group-hover:text-[#1A1A1A] transition-colors">
                  All
                </span>
              </label>
              {OCCASIONS.filter((occ) => occ !== "All").map((occasion) => (
                <label
                  key={occasion}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="occasion"
                    checked={selectedOccasion === occasion}
                    onChange={() => handleOccasionChange(occasion)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="ml-3 text-[#666] group-hover:text-[#1A1A1A] transition-colors">
                    {occasion}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#00342B] text-white rounded-lg font-semibold hover:bg-[#00695C] transition-colors mt-4"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterModal;
