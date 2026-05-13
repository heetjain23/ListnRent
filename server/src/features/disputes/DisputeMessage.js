import mongoose from 'mongoose'

/**
 * DisputeMessage — individual message in a dispute thread.
 *
 * Kept separate from Dispute to allow:
 *  - Paginated message loading (thread can grow large)
 *  - Efficient unread calculations
 *  - Future: attachment support, AI response tagging
 */
const disputeMessageSchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      required: true,
      index: true,
    },

    // Firebase UID for customers, Admin ObjectId stringified for staff/admin
    sender: {
      type: String,
      required: true,
    },

    // Denormalized for display without extra lookups
    senderRole: {
      type: String,
      enum: ['customer', 'support_team', 'admin', 'super_admin', 'system'],
      required: true,
    },

    // Sender display name — cached for fast list rendering
    senderName: {
      type: String,
      default: '',
    },

    senderPhoto: {
      type: String,
      default: null,
    },

    // Message body
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Flag for auto-generated system messages (status changes, resolution prompts)
    isSystemMessage: {
      type: Boolean,
      default: false,
      index: true,
    },

    // System message action type — drives UI rendering
    systemAction: {
      type: String,
      enum: [
        null,
        'DISPUTE_OPENED',
        'STATUS_CHANGED',
        'ASSIGNED',
        'MARKED_RESOLVED',
        'USER_CONFIRMED_RESOLVED',
        'USER_REOPENED',
        'PRIORITY_CHANGED',
        'ESCALATED',
      ],
      default: null,
    },

    // Track read status per participant
    // Array of { uid, readAt } — supports multiple readers
    readBy: [
      {
        uid: { type: String, required: true },
        readAt: { type: Date, default: Date.now },
      },
    ],

    // Future: attachment support
    attachments: [
      {
        url: String,
        publicId: String,       // Cloudinary public ID
        fileName: String,
        fileType: String,       // MIME type
        fileSize: Number,       // bytes
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Soft-delete for moderation
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// ─── Indexes ───────────────────────────────────────────────────────────────────
disputeMessageSchema.index({ disputeId: 1, createdAt: 1 })         // thread pagination
disputeMessageSchema.index({ disputeId: 1, isSystemMessage: 1 })   // filter system msgs
disputeMessageSchema.index({ sender: 1, createdAt: -1 })

const DisputeMessage = mongoose.model('DisputeMessage', disputeMessageSchema)
export default DisputeMessage