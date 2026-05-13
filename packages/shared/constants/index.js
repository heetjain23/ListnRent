/**
 * Shared Constants for ListnRent
 * Used across frontend (client, admin) and backend (server)
 */

// API Configuration
export const API_BASE_URL = "http://localhost:5000";
export const APP_NAME = "ListnRent";

// Categories
export const CATEGORIES = [
  'DESIGNER SUIT/ TUXEDO',
  'INDO-WESTERN/ SHERWANI',
  'JODHPURI',
  'KURTA JACKET',
  'BLAZER/ FORMAL SUIT',
  'SAREE',
  'LEHENGA',
  'NAVRATRI',
];

// Sizes
export const SIZES = [
  'XS(34)',
  'S(36)',
  'M(38)',
  'L(40)',
  'XL(42)',
  'XXL(44)',
  '3XL(46)',
  '4XL(48)',
  '5XL(50)',
];

// Gender
export const GENDER = [
  'Male',
  'Female',
];

// Occasions
export const OCCASIONS = [
  'Wedding',
  'Parties',
  'Festivals',
];

// Conditions
export const CONDITIONS = [
  'New',
  'Like New',
  'Used',
];

// Materials
export const MATERIALS = [
  'Silk',
  'Cotton',
  'Linen',
  'Wool',
  'Polyester',
  'Satin',
  'Chiffon',
  'Georgette',
  'Velvet',
  'Brocade',
  'Art Silk',
  'Khadi',
  'Blend',
];

// Billing Fees (defaults, can be overridden)
export const BILLING_FEES = {
  CLEANING_FEE: 0,
  DELIVERY_FEE: 0,
};

// Category Video Guidance
export const CATEGORY_VIDEO_GUIDANCE =
  'Use the above video as a reference to understand how to measure your outfit accurately. Enter the measured values carefully on the website to ensure the best fit.';

// Image Constants
export const IMAGE_CONSTANTS = {
  MAX_SIZE_MB: 10,
  ALLOWED_FORMATS: ['JPEG', 'PNG', 'WEBP'],
};

// Dispute system constants
export const DISPUTE_TYPE = Object.freeze({
  BOOKING_DISPUTE: 'BOOKING_DISPUTE',
  LISTING_SUPPORT: 'LISTING_SUPPORT',
  GENERAL_SUPPORT: 'GENERAL_SUPPORT',
})

export const DISPUTE_STATUS = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_USER: 'WAITING_FOR_USER',
  RESOLVED_PENDING_CONFIRMATION: 'RESOLVED_PENDING_CONFIRMATION',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED',
});

export const DISPUTE_PRIORITY = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
});

export const DISPUTE_CATEGORY = Object.freeze({
  DELIVERY_ISSUE: 'DELIVERY_ISSUE',
  PAYMENT_ISSUE: 'PAYMENT_ISSUE',
  ITEM_DAMAGED: 'ITEM_DAMAGED',
  ITEM_NOT_AS_DESCRIBED: 'ITEM_NOT_AS_DESCRIBED',
  REFUND_REQUEST: 'REFUND_REQUEST',
  CANCELLATION: 'CANCELLATION',
  OTHER: 'OTHER',
});

export const SENDER_ROLE = Object.freeze({
  CUSTOMER: 'customer',
  SUPPORT_TEAM: 'support_team',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  SYSTEM: 'system',
});

export const SYSTEM_ACTION = Object.freeze({
  DISPUTE_OPENED: 'DISPUTE_OPENED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  ASSIGNED: 'ASSIGNED',
  MARKED_RESOLVED: 'MARKED_RESOLVED',
  USER_CONFIRMED_RESOLVED: 'USER_CONFIRMED_RESOLVED',
  USER_REOPENED: 'USER_REOPENED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  ESCALATED: 'ESCALATED',
});

export const STAFF_ROLES = ['support_team', 'admin', 'super_admin'];
export const ADMIN_ROLES = ['admin', 'super_admin'];

export const ALLOWED_TRANSITIONS = {
  staff: {
    [DISPUTE_STATUS.OPEN]: [
      DISPUTE_STATUS.IN_PROGRESS,
      DISPUTE_STATUS.WAITING_FOR_USER,
      DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION,
    ],
    [DISPUTE_STATUS.IN_PROGRESS]: [
      DISPUTE_STATUS.WAITING_FOR_USER,
      DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION,
    ],
    [DISPUTE_STATUS.WAITING_FOR_USER]: [
      DISPUTE_STATUS.IN_PROGRESS,
      DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION,
    ],
    [DISPUTE_STATUS.REOPENED]: [
      DISPUTE_STATUS.IN_PROGRESS,
      DISPUTE_STATUS.WAITING_FOR_USER,
      DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION,
    ],
    [DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION]: [],
    [DISPUTE_STATUS.CLOSED]: [],
  },
  customer: {
    [DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION]: [
      DISPUTE_STATUS.CLOSED,
      DISPUTE_STATUS.REOPENED,
    ],
  },
};

export const SYSTEM_MESSAGES = {
  DISPUTE_OPENED: (subject) =>
    `Dispute raised: "${subject}". Our support team will respond shortly.`,
  STATUS_CHANGED: (from, to) => `Status updated from ${from} to ${to}.`,
  MARKED_RESOLVED: () =>
    `Our support team has marked this dispute as resolved. Was your issue resolved?`,
  USER_CONFIRMED_RESOLVED: () =>
    `User confirmed the issue is resolved. Dispute closed.`,
  USER_REOPENED: () =>
    `User indicated the issue is not resolved. Dispute has been reopened.`,
  ASSIGNED: (staffName) => `Dispute assigned to ${staffName}.`,
  PRIORITY_CHANGED: (priority) => `Priority updated to ${priority}.`,
};

export const USER_BLOCKED_STATUSES = [DISPUTE_STATUS.CLOSED];
export const STAFF_BLOCKED_STATUSES = [DISPUTE_STATUS.CLOSED];

export const adminRoleToSenderRole = (adminRole) => {
  const map = {
    support_team: SENDER_ROLE.SUPPORT_TEAM,
    admin: SENDER_ROLE.ADMIN,
    super_admin: SENDER_ROLE.SUPER_ADMIN,
  };
  return map[adminRole] || SENDER_ROLE.SUPPORT_TEAM;
};
