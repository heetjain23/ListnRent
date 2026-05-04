/**
 * Size Classification Service
 * Provides utilities to:
 * - Validate and normalize measurements
 * - Map measurements to standard sizes
 * - Store and retrieve measurement data
 */

import {
  BASE_MEASUREMENTS,
  MEASUREMENT_FIELDS,
  getCategoryFamily,
  validateMeasurement
} from '@listnrent/shared/measurements';

import { classifyMeasurements } from '../config/sizeRules.js';

/**
 * Normalize and validate all measurements for a category
 * Returns { valid, measurements, errors }
 */
export const normalizeMeasurements = (categoryId, rawMeasurements, gender) => {
  const family = getCategoryFamily(categoryId, gender);
  const measurements = {};
  const errors = {};

  // Validate base measurements
  for (const fieldKey of family.baseMeasurements) {
    const fieldDef = BASE_MEASUREMENTS[fieldKey];
    const rawValue = rawMeasurements[fieldKey];

    if (!rawValue && fieldDef.required) {
      errors[fieldKey] = `${fieldDef.label} is required`;
      continue;
    }

    if (rawValue) {
      const validation = validateMeasurement(fieldKey, rawValue);
      if (!validation.valid) {
        errors[fieldKey] = validation.error;
      } else {
        measurements[fieldKey] = validation.value;
      }
    }
  }

  // Validate additional fields
  for (const extraField of (family.additionalFields || [])) {
    const rawValue = rawMeasurements[extraField.key];

    if (!rawValue && extraField.required) {
      errors[extraField.key] = `${extraField.label} is required`;
      continue;
    }

    if (rawValue) {
      const num = parseFloat(rawValue);
      if (isNaN(num)) {
        errors[extraField.key] = 'Must be a number';
      } else if (num < extraField.min) {
        errors[extraField.key] = `Minimum ${extraField.min} cm`;
      } else if (num > extraField.max) {
        errors[extraField.key] = `Maximum ${extraField.max} cm`;
      } else {
        measurements[extraField.key] = num;
      }
    }
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, measurements, errors };
};

/**
 * Calculate derived size from measurements
 */
export const calculateSize = (categoryId, measurements, gender) => {
  const family = getCategoryFamily(categoryId, gender);

  const result = classifyMeasurements(
    measurements,
    family.id,
    family.weightings
  );

  return {
    derivedSize: result.size,
    confidence: result.confidence,
    isBetween: result.isBetween,
    note: result.note,
    allScores: result.allScores,
    ruleSetVersion: '1.1.0',
  };
};

/**
 * Build complete measurements object for listing storage
 */
export const buildMeasurementPayload = (
  categoryId,
  rawMeasurements,
  fitNotes = '',
  gender
) => {
  // Normalize and validate
  const { valid, measurements, errors } = normalizeMeasurements(
    categoryId,
    rawMeasurements,
    gender
  );

  if (!valid) {
    return {
      valid: false,
      errors,
    };
  }

  // Calculate derived size
  const family = getCategoryFamily(categoryId, gender);

  const sizeData = classifyMeasurements(
    measurements,
    family.id,
    family.weightings
  );

  // Separate base from extra
  const base = {};
  const extra = {};

  for (const [key, value] of Object.entries(measurements)) {
    if (family.baseMeasurements.includes(key)) {
      base[key] = value;
    } else {
      extra[key] = value;
    }
  }

  return {
    valid: true,
    measurements: {
      allMeasurements: measurements,
      base,
      extra,
      derivedSize: sizeData.size,
      confidence: sizeData.confidence,
      isBetween: sizeData.isBetween,
      ruleSetVersion: '1.1.0',
      fitNotes: fitNotes || undefined,
      classification: sizeData,
    },
  };
};

/**
 * Display measurements in human-readable format
 */
export const formatMeasurementsForDisplay = (measurements) => {
  const family = getCategoryFamily(measurements._category || 'KURTA');
  const formatted = [];

  if (measurements.base) {
    for (const [key, value] of Object.entries(measurements.base)) {
      const def = BASE_MEASUREMENTS[key];
      if (def) {
        formatted.push({
          label: def.label,
          value: `${value} cm`,
          type: 'base',
        });
      }
    }
  }

  if (measurements.extra && Object.keys(measurements.extra).length > 0) {
    for (const [key, value] of Object.entries(measurements.extra)) {
      const def = MEASUREMENT_FIELDS[key];
      if (!def) continue;
      formatted.push({
        label: def.label,
        value: `${value} cm`,
        type: 'extra',
      });
    }
  }

  return formatted;
};
