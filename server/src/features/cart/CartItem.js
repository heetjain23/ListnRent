import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    listingSnapshot: {
      listingId: String,
      userId: String,
      title: String,
      category: String,
      occasion: String,
      size: String,
      description: String,
      pricePerDay: Number,
      deposit: Number,
      condition: String,
      gender: String,
      images: [String],
      location: {
        area: String,
        city: String,
      },
      isActive: Boolean,
    },
    eventDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    durationDays: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
)

cartItemSchema.index({ userId: 1, listingId: 1 }, { unique: true })

const CartItem = mongoose.model('CartItem', cartItemSchema)

export default CartItem