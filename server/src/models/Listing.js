import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Saree", "Lehenga", "Salwar Suit", "Sherwani", "Kurta", "Gown", "Other"],
    },
    occasion: {
      type: String,
      required: true,
      enum: ["Wedding", "Festive", "Party", "Casual", "Other"],
    },
    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Custom"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },
    deposit: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Used"],
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      area: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        default: "Mumbai",
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);