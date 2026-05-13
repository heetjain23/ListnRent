import mongoose from 'mongoose'
import { DISPUTE_TYPE } from '@listnrent/shared/constants'

/**
 * DISPUTE STATUS FLOW:
 *
 *  OPEN
 *   │
 *   ├──► IN_PROGRESS          (staff/admin starts working)
 *   │
 *   ├──► WAITING_FOR_USER     (staff replied, waiting on user)
 *   │
 *   ├──► RESOLVED_PENDING_CONFIRMATION  (staff marks resolved, awaiting user confirm)
 *   │         │
 *   │         ├──► CLOSED     (user confirms resolved)
 *   │         │
 *   │         └──► REOPENED   (user says not resolved)
 *   │
 *   └──► REOPENED             (after user rejects resolution)
 *            │
 *            └── (loops back into IN_PROGRESS / WAITING_FOR_USER)
 *
 * PRIORITY: LOW | MEDIUM | HIGH | URGENT
 * CATEGORY: future-ready field for dispute categorisation
 */

const disputeSchema = new mongoose.Schema(
  {
    // Human-readable ticket ID: DSP-YYYYMM-XXXX
    disputeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Booking context, if the thread originates from an order
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },

    // Listing context, if the thread originates from a listing detail page
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null,
      index: true,
    },

    // Support route classification: booking, listing, or general
    disputeType: {
      type: String,
      enum: Object.values(DISPUTE_TYPE),
      default: DISPUTE_TYPE.BOOKING_DISPUTE,
      index: true,
    },

    // Firebase UID of the customer who raised the dispute
    raisedBy: {
      type: String,
      required: true,
      index: true,
    },

    // Admin/support member assigned to this dispute (future: assignment system)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    // Core ticket info
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Dispute category — future-ready for filtering/routing
    category: {
      type: String,
      enum: [
        'DELIVERY_ISSUE',
        'PAYMENT_ISSUE',
        'ITEM_DAMAGED',
        'ITEM_NOT_AS_DESCRIBED',
        'REFUND_REQUEST',
        'CANCELLATION',
        'OTHER',
      ],
      default: 'OTHER',
    },

    // Priority level — can be escalated
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },

    // Status lifecycle
    status: {
      type: String,
      enum: [
        'OPEN',
        'IN_PROGRESS',
        'WAITING_FOR_USER',
        'RESOLVED_PENDING_CONFIRMATION',
        'REOPENED',
        'CLOSED',
      ],
      default: 'OPEN',
      index: true,
    },

    // Denormalized last message for list queries (avoids N+1)
    lastMessage: {
      type: String,
      default: '',
      maxlength: 300,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Who sent the last message (for UI indicators)
    lastMessageBy: {
      type: String, // Firebase UID or 'system'
      default: null,
    },

    // Unread counts per participant uid (Map for O(1) lookup)
    // Key: Firebase UID or admin ID string, Value: unread count
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // Resolution tracking
    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    // How many times this dispute was reopened
    reopenCount: {
      type: Number,
      default: 0,
    },

    // Future: SLA tracking
    slaDeadline: {
      type: Date,
      default: null,
    },

    slaBreached: {
      type: Boolean,
      default: false,
    },

    // Future: refund handling
    refundRequested: {
      type: Boolean,
      default: false,
    },

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSED'],
      default: 'NONE',
    },

    // Flexible metadata for future extensions (AI tags, escalation notes, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Durable support context snapshot for thread headers and queue cards
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
)

// ─── Compound indexes for efficient admin queries ──────────────────────────────
disputeSchema.index({ status: 1, lastMessageAt: -1 })
disputeSchema.index({ raisedBy: 1, status: 1, createdAt: -1 })
disputeSchema.index({ assignedTo: 1, status: 1, lastMessageAt: -1 })
disputeSchema.index({ bookingId: 1, raisedBy: 1 })
disputeSchema.index({ listingId: 1, raisedBy: 1 })
disputeSchema.index({ disputeType: 1, lastMessageAt: -1 })
disputeSchema.index({ createdAt: -1 })

const Dispute = mongoose.model('Dispute', disputeSchema)
export default Dispute