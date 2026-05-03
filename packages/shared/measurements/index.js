/**
 * Centralized measurement definitions for ListnRent
 * Shared between backend and frontend
 * Defines the base measurements used across all categories and category-specific overrides
 */

export const BASE_MEASUREMENTS = {
  chest: {
    key: 'chest',
    label: 'Chest',
    description: 'Measure around the fullest part of the chest',
    unit: 'cm',
    required: true,
    min: 60,
    max: 160,
    family: ['upper-body', 'structured-womens', 'general-ethnic'],
  },
  shoulder: {
    key: 'shoulder',
    label: 'Shoulder Width',
    description: 'Shoulder-to-shoulder distance, measured across back',
    unit: 'cm',
    required: true,
    min: 30,
    max: 60,
    family: ['upper-body', 'structured-womens', 'general-ethnic'],
  },
  waist: {
    key: 'waist',
    label: 'Waist',
    description: 'Measure around the waist at the narrowest point',
    unit: 'cm',
    required: true,
    min: 50,
    max: 150,
    family: ['upper-body', 'structured-womens', 'general-ethnic'],
  },
  sleeveLength: {
    key: 'sleeveLength',
    label: 'Sleeve Length',
    description: 'From shoulder point to wrist',
    unit: 'cm',
    required: true,
    min: 40,
    max: 80,
    family: ['upper-body', 'general-ethnic'],
  },
  armhole: {
    key: 'armhole',
    label: 'Armhole/Armpit Circumference',
    description: 'Circumference around armpit area',
    unit: 'cm',
    required: false,
    min: 35,
    max: 70,
    family: ['upper-body', 'structured-womens'],
  },
  outfitLength: {
    key: 'outfitLength',
    label: 'Outfit Length (Height)',
    description: 'Full length from shoulder to hem',
    unit: 'cm',
    required: true,
    min: 80,
    max: 200,
    family: ['upper-body', 'structured-womens', 'general-ethnic', 'draped'],
  },
};

/**
 * Category families group similar categories
 * Reduces schema duplication and standardizes UI flow
 */
export const CATEGORY_FAMILIES = {
  'upper-body': {
    id: 'upper-body',
    label: 'Upper Body Fitted',
    description: 'Fitted upper body garments',
    categories: [
      'DESIGNER SUIT/ TUXEDO',
      'INDO-WESTERN/ SHERWANI',
      'JODHPURI',
      'KURTA JACKET',
      'BLAZER/ FORMAL SUIT',
    ],
    baseMeasurements: ['chest', 'shoulder', 'waist', 'sleeveLength', 'outfitLength'],
    additionalFields: [
      {
        key: 'blouseShoulder',
        label: 'Blouse Shoulder Width (Female Indo-Western)',
        description: 'Full shoulder width for blouse - only for female Indo-Western (measurement #2)',
        unit: 'cm',
        required: false,
        min: 30,
        max: 55,
      },
      {
        key: 'blouseChest',
        label: 'Blouse Chest (Female Indo-Western)',
        description: 'Chest circumference for blouse - only for female Indo-Western (measurement #8)',
        unit: 'cm',
        required: false,
        min: 60,
        max: 140,
      },
    ],
  },
};

/**
 * UI-specific category families for form rendering
 * Different from backend CATEGORY_FAMILIES - organized for frontend flow
 */
export const CATEGORY_FAMILIES_UI = {
  'upper-body': {
    id: 'upper-body',
    label: 'Fitted Upper Body',
    fields: ['chest', 'shoulder', 'waist', 'sleeveLength', 'outfitLength'],
    extraFields: ['blouseShoulder', 'blouseChest', 'blouseWaist', 'blouseBackLength'],
    categories: [
      'DESIGNER SUIT/ TUXEDO',
      'INDO-WESTERN/ SHERWANI',
      'JODHPURI',
      'KURTA JACKET',
      'BLAZER/ FORMAL SUIT',
    ],
  },
  'draped': {
    id: 'draped',
    label: 'Draped Wear',
    fields: ['outfitLength'],
    extraFields: ['length', 'width', 'blouseShoulder', 'blouseChest', 'blouseWaist', 'blouseBackLength', 'blouseSleeveLength', 'blouseArmRound'],
    categories: ['SAREE'],
  },
  'structured-womens': {
    id: 'structured-womens',
    label: 'Structured Womens',
    fields: ['chest', 'waist', 'outfitLength'],
    extraFields: ['waistToFloor', 'hip', 'blouseShoulder', 'blouseChest', 'blouseWaist', 'blouseBackLength', 'blouseSleeveLength', 'blouseArmRound'],
    categories: ['LEHENGA'],
  },
  'general-ethnic': {
    id: 'general-ethnic',
    label: 'General Ethnic',
    fields: ['chest', 'shoulder', 'waist', 'sleeveLength', 'outfitLength'],
    extraFields: ['blouseShoulder', 'blouseChest', 'blouseWaist', 'blouseBackLength'],
    categories: ['KURTA', 'NAVRATRI'],
  },
};

/**
 * UI-specific measurement field configurations
 * Frontend uses these for form rendering and tooltips
 */
export const MEASUREMENT_FIELDS = {
  chest: {
    key: 'chest',
    label: 'Chest / Bust',
    placeholder: 'e.g., 92',
    description: 'Measure around the fullest part of the chest',
    tooltip: 'Wear the outfit or use a similar-fitting garment. Measure horizontally around the fullest part of the chest.',
    min: 60,
    max: 160,
  },
  shoulder: {
    key: 'shoulder',
    label: 'Shoulder Width',
    placeholder: 'e.g., 42',
    description: 'Shoulder-to-shoulder distance, measured across back',
    tooltip: 'Measure straight across from shoulder point to shoulder point at the back.',
    min: 30,
    max: 60,
  },
  waist: {
    key: 'waist',
    label: 'Waist',
    placeholder: 'e.g., 76',
    description: 'Measure around the waist at the narrowest point',
    tooltip: 'Measure at the natural waist (narrowest part), typically at navel level or slightly above.',
    min: 50,
    max: 150,
  },
  sleeveLength: {
    key: 'sleeveLength',
    label: 'Sleeve Length',
    placeholder: 'e.g., 60',
    description: 'From shoulder point to wrist',
    tooltip: 'Measure from the shoulder point down the arm to the wrist bone.',
    min: 40,
    max: 80,
  },
  armhole: {
    key: 'armhole',
    label: 'Armhole / Armpit',
    placeholder: 'e.g., 45',
    description: 'Circumference around armpit area',
    tooltip: 'Measure around the armpit circumference. Optional - only needed for precise tailored fits.',
    min: 35,
    max: 70,
  },
  outfitLength: {
    key: 'outfitLength',
    label: 'Outfit Length',
    placeholder: 'e.g., 140',
    description: 'Full length from shoulder to hem',
    tooltip: 'Measure from the shoulder point all the way down to the hem.',
    min: 80,
    max: 200,
  },
};

/**
 * Helper: Get category family for a category
 */
export const getCategoryFamilyUI = (category) => {
  for (const family of Object.values(CATEGORY_FAMILIES_UI)) {
    if (family.categories.includes(category)) {
      return family;
    }
  }
  return CATEGORY_FAMILIES_UI['general-ethnic'];
};

/**
 * Helper: Get all field definitions (base + extra) for a category
 */
export const getMeasurementFieldsUI = (category) => {
  const family = getCategoryFamilyUI(category);
  const baseFields = family.fields.map((key) => ({
    ...MEASUREMENT_FIELDS[key],
    required: true,
    type: 'base',
  }));
  
  const extraFields = (family.extraFields || []).map((key) => ({
    ...MEASUREMENT_FIELDS[key],
    required: true,
    type: 'extra',
  }));

  return { baseFields, extraFields };
};

/**
 * SIZE CLASSIFICATION RULES & FUNCTIONS
 * Maps measurements to standard sizes (XS, S, M, L, XL, XXL)
 * Used by both backend and frontend for consistent sizing
 * Versioned for future adjustments
 */

export const SIZE_RULES = {
  version: '1.0.0',
  createdAt: new Date('2026-05-01'),
  description: 'Initial sizing rules based on Indian ethnic wear standards',
  
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

  families: {
    'upper-body': {
      rules: {
        XS: { 
          chest: [70, 81], 
          shoulder: [33, 38], 
          waist: [61, 66], 
          sleeveLength: [50, 54],
          blouseShoulder: [32, 36],
          blouseChest: [80, 88],
          blouseWaist: [68, 74],
          blouseBackLength: [38, 42],
        },
        S: { 
          chest: [81, 91], 
          shoulder: [38, 42], 
          waist: [66, 71], 
          sleeveLength: [54, 57],
          blouseShoulder: [36, 40],
          blouseChest: [88, 96],
          blouseWaist: [74, 80],
          blouseBackLength: [42, 45],
        },
        M: { 
          chest: [91, 102], 
          shoulder: [42, 46], 
          waist: [71, 76], 
          sleeveLength: [57, 60],
          blouseShoulder: [40, 44],
          blouseChest: [96, 104],
          blouseWaist: [80, 88],
          blouseBackLength: [45, 48],
        },
        L: { 
          chest: [102, 112], 
          shoulder: [46, 50], 
          waist: [76, 84], 
          sleeveLength: [60, 63],
          blouseShoulder: [44, 48],
          blouseChest: [104, 112],
          blouseWaist: [88, 96],
          blouseBackLength: [48, 50],
        },
        XL: { 
          chest: [112, 122], 
          shoulder: [50, 54], 
          waist: [84, 94], 
          sleeveLength: [63, 66],
          blouseShoulder: [48, 52],
          blouseChest: [112, 120],
          blouseWaist: [96, 104],
          blouseBackLength: [50, 50],
        },
        XXL: { 
          chest: [122, 160], 
          shoulder: [54, 60], 
          waist: [94, 150], 
          sleeveLength: [66, 80],
          blouseShoulder: [52, 56],
          blouseChest: [120, 120],
          blouseWaist: [104, 110],
          blouseBackLength: [50, 50],
        },
      },
    },
    'draped': {
      rules: {
        S: { 
          length: [500, 550], 
          blouseShoulder: [32, 36],
          blouseChest: [80, 88],
          blouseWaist: [68, 74],
          blouseBackLength: [38, 42],
        },
        M: { 
          length: [550, 600], 
          blouseShoulder: [36, 40],
          blouseChest: [88, 96],
          blouseWaist: [74, 80],
          blouseBackLength: [42, 45],
        },
        L: { 
          length: [600, 650], 
          blouseShoulder: [40, 44],
          blouseChest: [96, 104],
          blouseWaist: [80, 88],
          blouseBackLength: [45, 48],
        },
        XL: { 
          length: [650, 700], 
          blouseShoulder: [44, 48],
          blouseChest: [104, 112],
          blouseWaist: [88, 96],
          blouseBackLength: [48, 50],
        },
      },
    },
    'structured-womens': {
      rules: {
        XS: { 
          chest: [70, 81], 
          waist: [61, 66], 
          hip: [81, 91], 
          waistToFloor: [80, 90],
          blouseShoulder: [32, 36],
          blouseChest: [80, 88],
          blouseWaist: [68, 74],
          blouseBackLength: [38, 42],
        },
        S: { 
          chest: [81, 91], 
          waist: [66, 71], 
          hip: [91, 102], 
          waistToFloor: [90, 100],
          blouseShoulder: [36, 40],
          blouseChest: [88, 96],
          blouseWaist: [74, 80],
          blouseBackLength: [42, 45],
        },
        M: { 
          chest: [91, 102], 
          waist: [71, 76], 
          hip: [102, 112], 
          waistToFloor: [100, 110],
          blouseShoulder: [40, 44],
          blouseChest: [96, 104],
          blouseWaist: [80, 88],
          blouseBackLength: [45, 48],
        },
        L: { 
          chest: [102, 112], 
          waist: [76, 84], 
          hip: [112, 122], 
          waistToFloor: [110, 120],
          blouseShoulder: [44, 48],
          blouseChest: [104, 112],
          blouseWaist: [88, 96],
          blouseBackLength: [48, 50],
        },
        XL: { 
          chest: [112, 122], 
          waist: [84, 94], 
          hip: [122, 135], 
          waistToFloor: [120, 130],
          blouseShoulder: [48, 52],
          blouseChest: [112, 120],
          blouseWaist: [96, 104],
          blouseBackLength: [50, 50],
        },
      },
    },
    'general-ethnic': {
      rules: {
        XS: { 
          chest: [70, 81], 
          shoulder: [33, 38], 
          waist: [61, 66],
          blouseShoulder: [32, 36],
          blouseChest: [80, 88],
          blouseWaist: [68, 74],
          blouseBackLength: [38, 42],
        },
        S: { 
          chest: [81, 91], 
          shoulder: [38, 42], 
          waist: [66, 71],
          blouseShoulder: [36, 40],
          blouseChest: [88, 96],
          blouseWaist: [74, 80],
          blouseBackLength: [42, 45],
        },
        M: { 
          chest: [91, 102], 
          shoulder: [42, 46], 
          waist: [71, 76],
          blouseShoulder: [40, 44],
          blouseChest: [96, 104],
          blouseWaist: [80, 88],
          blouseBackLength: [45, 48],
        },
        L: { 
          chest: [102, 112], 
          shoulder: [46, 50], 
          waist: [76, 84],
          blouseShoulder: [44, 48],
          blouseChest: [104, 112],
          blouseWaist: [88, 96],
          blouseBackLength: [48, 50],
        },
        XL: { 
          chest: [112, 122], 
          shoulder: [50, 54], 
          waist: [84, 94],
          blouseShoulder: [48, 52],
          blouseChest: [112, 120],
          blouseWaist: [96, 104],
          blouseBackLength: [50, 50],
        },
        XXL: { 
          chest: [122, 160], 
          shoulder: [54, 60], 
          waist: [94, 150],
          blouseShoulder: [52, 56],
          blouseChest: [120, 120],
          blouseWaist: [104, 110],
          blouseBackLength: [50, 50],
        },
      },
    },
  },
};

/**
 * Measurement weightings for each family
 * How much each measurement influences the final size decision
 * Used by both backend and frontend for consistent size classification
 */
export const FAMILY_WEIGHTINGS = {
  'upper-body': {
    chest: 0.4,
    shoulder: 0.2,
    waist: 0.25,
    sleeveLength: 0.15,
    outfitLength: 0.0,
    blouseShoulder: 0.0,
    blouseChest: 0.0,
    blouseWaist: 0.0,
    blouseBackLength: 0.0,
  },
  'draped': {
    outfitLength: 0.15,
    length: 0.15,
    width: 0.1,
    blouseShoulder: 0.15,
    blouseChest: 0.2,
    blouseWaist: 0.15,
    blouseBackLength: 0.1,
    blouseSleeveLength: 0.0,
    blouseArmRound: 0.0,
  },
  'structured-womens': {
    chest: 0.1,
    waist: 0.1,
    hip: 0.15,
    waistToFloor: 0.15,
    blouseShoulder: 0.12,
    blouseChest: 0.18,
    blouseWaist: 0.12,
    blouseBackLength: 0.08,
    blouseSleeveLength: 0.0,
    blouseArmRound: 0.0,
  },
  'general-ethnic': {
    chest: 0.4,
    shoulder: 0.2,
    waist: 0.25,
    sleeveLength: 0.15,
    blouseShoulder: 0.0,
    blouseChest: 0.0,
    blouseWaist: 0.0,
    blouseBackLength: 0.0,
  },
};

/**
 * Check if a measurement value falls within a size's range
 */
export const valueInRange = (value, range) => {
  if (!range || !Array.isArray(range) || range.length !== 2) return false;
  const [min, max] = range;
  return value >= min && value <= max;
};

/**
 * Score how well measurements fit a specific size
 * Returns a score 0-1 where 1 is perfect fit
 */
export const scoreForSize = (measurements, sizeLabel, familyRules, weightings) => {
  const sizeRules = familyRules.rules[sizeLabel];
  if (!sizeRules) return 0;

  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weightings)) {
    if (weight === 0) continue;
    if (!(key in measurements)) continue;
    if (!(key in sizeRules)) continue;

    const value = measurements[key];
    const range = sizeRules[key];

    if (!valueInRange(value, range)) {
      const [min, max] = range;
      const rangeSize = max - min;
      let distance = 0;
      if (value < min) {
        distance = min - value;
      } else {
        distance = value - max;
      }
      const distanceScore = Math.max(0, 1 - distance / (rangeSize * 0.5));
      totalScore += distanceScore * weight;
    } else {
      totalScore += weight;
    }
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

/**
 * Get the size rules for a specific family
 */
export const getFamilyRules = (familyId) => {
  return SIZE_RULES.families[familyId] || SIZE_RULES.families['general-ethnic'];
};

/**
 * Classify measurements to a size
 * Returns { size, confidence, isBetween, note, allScores }
 */
export const classifyMeasurements = (measurements, familyId, weightings) => {
  const familyRules = getFamilyRules(familyId);
  const sizes = Object.keys(familyRules.rules);

  const scores = {};
  sizes.forEach((size) => {
    scores[size] = scoreForSize(measurements, size, familyRules, weightings);
  });

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [bestSize, bestScore] = sorted[0];
  const [secondSize, secondScore] = sorted[1] || ['', 0];

  const confidence = bestScore - secondScore;
  const isBetween = confidence < 0.15;

  return {
    size: bestSize,
    score: bestScore,
    confidence,
    isBetween,
    nextBestSize: secondSize,
    allScores: scores,
    note: isBetween ? `Between ${bestSize} and ${secondSize}` : undefined,
  };
};

/**
 * Get family for a given category
 */
export const getCategoryFamily = (category) => {
  for (const [familyId, family] of Object.entries(CATEGORY_FAMILIES)) {
    if (family.categories.includes(category)) {
      return family;
    }
  }
  return CATEGORY_FAMILIES['general-ethnic']; // Fallback
};

/**
 * Get fields required for a category
 */
export const getMeasurementFieldsForCategory = (category) => {
  const family = getCategoryFamily(category);
  const baseFields = family.baseMeasurements.map((key) => BASE_MEASUREMENTS[key]);
  const extraFields = family.additionalFields || [];
  return { baseFields, extraFields, family };
};

/**
 * Validate measurement values
 */
export const validateMeasurement = (key, value) => {
  const def = BASE_MEASUREMENTS[key];
  if (!def) return { valid: false, error: `Unknown measurement: ${key}` };

  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num < def.min) return { valid: false, error: `Minimum ${def.min} cm` };
  if (num > def.max) return { valid: false, error: `Maximum ${def.max} cm` };
  return { valid: true, value: num };
};
