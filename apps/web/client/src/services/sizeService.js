/**
 * Frontend Size Calculation Service
 * Provides real-time size preview while user enters measurements
 * Uses shared sizing rules and calculations for consistency with backend
 */

import {
  MEASUREMENT_FIELDS,
  classifyMeasurements,
  getFamilyRules,
  getMeasurementFieldsUI,
  getCategoryFamily,
} from '@listnrent/shared/measurements';

/**
 * Calculate size from measurements
 * Returns { size, confidence, note }
 */
export const calculateSizeFromMeasurements = (category, measurements, gender) => {
  const family = getCategoryFamily(category, gender);

  const familyRules = getFamilyRules(family.id);

  if (!familyRules) {
    return { size: null, confidence: 0, note: 'Unable to calculate size' };
  }

  const result = classifyMeasurements(measurements, family.id, family.weightings);

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
export const validateAllMeasurements = (category, measurements, gender) => {
  const errors = {};
  const { baseFields, extraFields } = getMeasurementFieldsUI(category, gender);
  const allFields = [
    ...baseFields.map((field) => field.key),
    ...extraFields.map((field) => field.key),
  ];

  for (const fieldKey of allFields) {
    const value = measurements[fieldKey];
    if (!value) {
      errors[fieldKey] = 'Required';
      continue;
    }
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
export const hasEnoughMeasurementsForSize = (category, measurements, gender) => {
  const { baseFields, extraFields } = getMeasurementFieldsUI(category, gender);
  const requiredFields = [
    ...baseFields.map((field) => field.key),
    ...extraFields.map((field) => field.key),
  ];
  const providedCount = requiredFields.filter((key) => measurements[key]).length;
  return providedCount === requiredFields.length;
};
