import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    // Delivery Details
    deliveryDetails: {
      mobileNumber: {
        type: String,
      },
      deliveryAddress: {
        type: String,
      },
      landmark: {
        type: String,
      },
      pincode: {
        type: String,
      },
    },
    pushSubscriptions: [
      {
        endpoint: { type: String, required: true },
        expirationTime: { type: Date, default: null },
        keys: {
          p256dh: { type: String, required: true },
          auth: { type: String, required: true },
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
export default User
