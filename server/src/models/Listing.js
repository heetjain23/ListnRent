import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
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
      enum: [
        "DESIGNER SUIT/ TUXEDO",
        "INDO-WESTERN/ SHERWANI",
        "JODHPURI",
        "KURTA JACKET",
        "BLAZER/ FORMAL SUIT",
        "SAREE",
        "LEHENGA",
        "NAVRATRI",
      ],
    },
    occasion: {
      type: String,
      required: true,
      enum: ["Wedding", "Festive", "Party", "Casual", "Other"],
    },
    size: {
      type: String,
      required: true,
      enum: ['XS(34)','S(36)','M(38)','L(40)','XL(42)','XXL(44)','3XL(46)','4XL(48)','5XL(50)'],
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
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
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
  { timestamps: true },
);

export default mongoose.model("Listing", listingSchema);
