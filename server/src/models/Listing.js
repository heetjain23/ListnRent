import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
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
      enum: ["Wedding", "Parties", "Festivals"],
    },
    size: {
      type: String,
      enum: ['XS(34)','S(36)','M(38)','L(40)','XL(42)','XXL(44)','3XL(46)','4XL(48)','5XL(50)'],
    },
    measurements: {
      allMeasurements: {
        type: Map,
        of: Number,
        default: null,
      },
      base: {
        type: Map,
        of: Number,
        default: null,
      },
      extra: {
        type: Map,
        of: Number,
        default: null,
      },
      derivedSize: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        default: null,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
      },
      isBetween: {
        type: Boolean,
        default: false,
      },
      ruleSetVersion: {
        type: String,
        default: '1.0.0',
      },
      fitNotes: {
        type: String,
        trim: true,
        default: null,
      },
      classification: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    pricePerDay: {
      type: Number,
      min: 1,
    },
    deposit: {
      type: Number,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Used"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    material: {
      type: String,
      trim: true,
      default: '', // Empty default for old listings without material
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      area: {
        type: String,
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
    isDraft: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookings: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },
        userId: String,
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        renterName: String,
        renterEmail: String,
        rentalAmount: {
          type: Number,
          default: 0,
        },
        depositAmount: {
          type: Number,
          default: 0,
        },
        bookingFee: {
          type: Number,
          default: 0,
        },
        totalAmount: {
          type: Number,
          default: 0,
        },
        pendingAmount: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rentalHistory: [
      {
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },
        userId: String,
        renterEmail: String,
        renterName: String,
        startDate: Date,
        endDate: Date,
        totalAmount: Number,
        rentalDays: Number,
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

listingSchema.index({ isActive: 1, isDraft: 1, createdAt: -1 });
listingSchema.index({ isActive: 1, isDraft: 1, viewCount: -1, createdAt: -1 });
listingSchema.index({ category: 1, occasion: 1, gender: 1, "location.city": 1, createdAt: -1 });
listingSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Listing", listingSchema);
