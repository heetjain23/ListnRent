/**
 * disputeValidation.js
 *
 * Input validation middleware for dispute routes.
 * Keeps controllers thin — all field validation is done here.
 *
 * Pattern matches existing project style (inline middleware, no external lib).
 */

import { DISPUTE_STATUS, DISPUTE_PRIORITY, DISPUTE_CATEGORY } from '@listnrent/shared/constants'
import mongoose from 'mongoose'

// ─── Generic validator runner ──────────────────────────────────────────────────
const validate = (rules) => (req, res, next) => {
  const errors = []

  for (const rule of rules) {
    const result = rule(req)
    if (result) errors.push(result)
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0], // return first error
      errors,
    })
  }

  next()
}

// ─── Field validators ──────────────────────────────────────────────────────────

const required = (field, label) => (req) => {
  const val = req.body[field]
  if (!val || (typeof val === 'string' && !val.trim())) {
    return `${label || field} is required`
  }
}

const maxLength = (field, max, label) => (req) => {
  const val = req.body[field]
  if (val && typeof val === 'string' && val.trim().length > max) {
    return `${label || field} must be at most ${max} characters`
  }
}

const minLength = (field, min, label) => (req) => {
  const val = req.body[field]
  if (val && typeof val === 'string' && val.trim().length < min) {
    return `${label || field} must be at least ${min} characters`
  }
}

const validEnum = (field, enumValues, label) => (req) => {
  const val = req.body[field]
  if (val && !enumValues.includes(val)) {
    return `${label || field} must be one of: ${enumValues.join(', ')}`
  }
}

const validObjectId = (field, label) => (req) => {
  const val = req.body[field] || req.params[field]
  if (val && !mongoose.Types.ObjectId.isValid(val)) {
    return `${label || field} is not a valid ID`
  }
}

// ─── Route-specific validators ─────────────────────────────────────────────────

/**
 * POST /disputes/create
 */
export const validateCreateDispute = validate([
  required('bookingId', 'Booking ID'),
  validObjectId('bookingId', 'Booking ID'),
  required('subject', 'Subject'),
  minLength('subject', 5, 'Subject'),
  maxLength('subject', 200, 'Subject'),
  required('message', 'Message'),
  minLength('message', 10, 'Message'),
  maxLength('message', 5000, 'Message'),
  validEnum('category', Object.values(DISPUTE_CATEGORY), 'Category'),
])

/**
 * POST /disputes/:id/message
 * POST /admin/disputes/:id/message
 */
export const validateSendMessage = validate([
  required('message', 'Message'),
  minLength('message', 1, 'Message'),
  maxLength('message', 5000, 'Message'),
])

/**
 * PATCH /admin/disputes/:id/status
 */
export const validateUpdateStatus = validate([
  required('status', 'Status'),
  validEnum('status', Object.values(DISPUTE_STATUS), 'Status'),
])

/**
 * PATCH /admin/disputes/:id/priority
 */
export const validateUpdatePriority = validate([
  required('priority', 'Priority'),
  validEnum('priority', Object.values(DISPUTE_PRIORITY), 'Priority'),
])

/**
 * PATCH /admin/disputes/:id/assign
 */
export const validateAssignDispute = validate([
  required('assigneeId', 'Assignee ID'),
  validObjectId('assigneeId', 'Assignee ID'),
])

// ─── Param validators (middleware) ─────────────────────────────────────────────

/**
 * Validates :id param is a valid Mongo ObjectId OR a dispute string ID (DSP-*).
 */
export const validateDisputeIdParam = (req, res, next) => {
  const { id } = req.params
  if (!id) {
    return res.status(400).json({ success: false, message: 'Dispute ID is required' })
  }

  const isObjectId = mongoose.Types.ObjectId.isValid(id)
  const isDisputeId = /^DSP-\d{6}-[A-Z0-9]{4}$/.test(id)

  if (!isObjectId && !isDisputeId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid dispute ID format',
    })
  }

  next()
}

/**
 * Validates :id param is a valid Mongo ObjectId only.
 */
export const validateObjectIdParam = (req, res, next) => {
  const { id } = req.params
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' })
  }
  next()
}