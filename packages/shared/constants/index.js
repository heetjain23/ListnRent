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
