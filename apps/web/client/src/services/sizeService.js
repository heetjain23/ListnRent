/**
 * Frontend Size Calculation Service
 * Provides real-time size preview while user enters measurements
 * Uses shared sizing rules and calculations for consistency with backend
 */

import {
  CATEGORY_FAMILIES_UI,
  MEASUREMENT_FIELDS,
  classifyMeasurements,
  getFamilyRules,
  FAMILY_WEIGHTINGS,
} from '@listnrent/shared/measurements';

/**
 * Calculate size from measurements
 * Returns { size, confidence, note }
 */
export const calculateSizeFromMeasurements = (category, measurements) => {
  // Get family
  let family = null;
  for (const fam of Object.values(CATEGORY_FAMILIES_UI)) {
    if (fam.categories.includes(category)) {
      family = fam;
      break;
    }
  }
  if (!family) family = CATEGORY_FAMILIES_UI['general-ethnic'];

  const familyRules = getFamilyRules(family.id);

  if (!familyRules) {
    return { size: null, confidence: 0, note: 'Unable to calculate size' };
  }

  const weightings = FAMILY_WEIGHTINGS[family.id] || FAMILY_WEIGHTINGS['general-ethnic'];
  const result = classifyMeasurements(measurements, family.id, weightings);

  return {
    size: result.size,
    confidence: result.confidence,
    isBetween: result.isBetween,
    note: result.note,
    bestScore: result.score,
  };
};

/**
 * Validate a single measurement value
 */
export const validateMeasurementValue = (key, value) => {
  if (!value) return null; // Optional

  const field = MEASUREMENT_FIELDS[key];
  if (!field) return 'Unknown field';

  const num = parseFloat(value);
  if (isNaN(num)) return 'Must be a number';
  if (num < field.min) return `Minimum ${field.min} cm`;
  if (num > field.max) return `Maximum ${field.max} cm`;

  return null; // Valid
};

/**
 * Validate all measurements for a category
 */
export const validateAllMeasurements = (category, measurements) => {
  const family = CATEGORY_FAMILIES_UI[
    Object.keys(CATEGORY_FAMILIES_UI).find((id) =>
      CATEGORY_FAMILIES_UI[id].categories.includes(category)
    )
  ] || CATEGORY_FAMILIES_UI['general-ethnic'];

  const errors = {};
  const allFields = [...family.fields, ...(family.extraFields || [])];

  for (const fieldKey of allFields) {
    const value = measurements[fieldKey];
    const error = validateMeasurementValue(fieldKey, value);
    if (error) {
      errors[fieldKey] = error;
    }
  }

  return errors;
};

/**
 * Format measurements for display (with units)
 */
export const formatMeasurement = (key, value) => {
  if (!value) return '';
  const field = MEASUREMENT_FIELDS[key];
  return `${value} ${field?.unit || 'cm'}`;
};

/**
 * Check if enough measurements are provided for size calculation
 */
export const hasEnoughMeasurementsForSize = (category, measurements) => {
  const family = CATEGORY_FAMILIES_UI[
    Object.keys(CATEGORY_FAMILIES_UI).find((id) =>
      CATEGORY_FAMILIES_UI[id].categories.includes(category)
    )
  ] || CATEGORY_FAMILIES_UI['general-ethnic'];

  // Need at least 50% of base fields to calculate a size
  const requiredFields = family.fields;
  const providedCount = requiredFields.filter((key) => measurements[key]).length;
  return providedCount >= Math.ceil(requiredFields.length * 0.5);
};
