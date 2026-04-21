import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    displayName: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'delivery_partner', 'super_admin', 'support_team'],
      default: 'delivery_partner',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

const Admin = mongoose.model('Admin', adminSchema)
export default Admin
