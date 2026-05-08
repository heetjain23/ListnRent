/**
 * Centralized measurement definitions for ListnRent.
 * Shared between backend and frontend.
 */

const ALL_CATEGORIES = [
  'DESIGNER SUIT/ TUXEDO',
  'INDO-WESTERN/ SHERWANI',
  'JODHPURI',
  'KURTA JACKET',
  'BLAZER/ FORMAL SUIT',
  'SAREE',
  'LEHENGA',
  'NAVRATRI',
  'KURTA',
];

export const FEMALE_DEFAULT_CATEGORIES = ['SAREE', 'LEHENGA'];

export const UPPER_BODY_MEASUREMENTS = [
  'chest',
  'shoulder',
  'armhole',
  'sleeveLength',
  'sleeveRound',
  'upperBodyLength',
  'upperBodyBottom',
];

export const LOWER_BODY_MEASUREMENTS = [
  'hip',
  'lowerBodyLength',
  'bottomRound',
];

export const BLOUSE_MEASUREMENTS = [
  'blouseShoulder',
  'blouseChest',
  'blouseWaist',
  'blouseBackLength',
  'blouseSleeveLength',
  'blouseArmRound',
];

export const BASE_MEASUREMENTS = {
  chest: {
    key: 'chest',
    label: 'Chest',
    description: 'Measure around the fullest part of the chest',
    unit: 'cm',
    required: true,
    min: 60,
    max: 160,
    family: ['upper-body'],
  },
  shoulder: {
    key: 'shoulder',
    label: 'Shoulder',
    description: 'Shoulder-to-shoulder distance, measured across the back',
    unit: 'cm',
    required: true,
    min: 30,
    max: 70,
    family: ['upper-body'],
  },
  armhole: {
    key: 'armhole',
    label: 'Arm Hole',
    description: 'Measure around the arm hole',
    unit: 'cm',
    required: true,
    min: 25,
    max: 80,
    family: ['upper-body'],
  },
  sleeveLength: {
    key: 'sleeveLength',
    label: 'Sleeve Length',
    description: 'Measure from shoulder point to sleeve end',
    unit: 'cm',
    required: true,
    min: 10,
    max: 90,
    family: ['upper-body'],
  },
  sleeveRound: {
    key: 'sleeveRound',
    label: 'Sleeve Round',
    description: 'Measure around the sleeve opening',
    unit: 'cm',
    required: true,
    min: 15,
    max: 70,
    family: ['upper-body'],
  },
  upperBodyLength: {
    key: 'upperBodyLength',
    label: 'Upper Body Length',
    description: 'Measure from shoulder point to upper-body hem',
    unit: 'cm',
    required: true,
    min: 25,
    max: 140,
    family: ['upper-body'],
  },
  upperBodyBottom: {
    key: 'upperBodyBottom',
    label: 'Upper Body Bottom',
    description: 'Measure around the bottom opening of the upper body garment',
    unit: 'cm',
    required: true,
    min: 50,
    max: 180,
    family: ['upper-body'],
  },
  hip: {
    key: 'hip',
    label: 'Hip',
    description: 'Measure around the fullest part of the hip',
    unit: 'cm',
    required: true,
    min: 60,
    max: 180,
    family: ['lower-body'],
  },
  lowerBodyLength: {
    key: 'lowerBodyLength',
    label: 'Lower Body Length',
    description: 'Measure from waist to lower-body hem',
    unit: 'cm',
    required: true,
    min: 40,
    max: 140,
    family: ['lower-body'],
  },
  bottomRound: {
    key: 'bottomRound',
    label: 'Bottom Round',
    description: 'Measure around the bottom opening',
    unit: 'cm',
    required: true,
    min: 20,
    max: 120,
    family: ['lower-body'],
  },
};

export const MEASUREMENT_FIELDS = {
  chest: {
    ...BASE_MEASUREMENTS.chest,
    label: 'Chest',
    placeholder: 'e.g., 92',
    tooltip: 'Measure horizontally around the fullest part of the chest.',
  },
  shoulder: {
    ...BASE_MEASUREMENTS.shoulder,
    label: 'Shoulder',
    placeholder: 'e.g., 42',
    tooltip: 'Measure straight across from shoulder point to shoulder point.',
  },
  armhole: {
    ...BASE_MEASUREMENTS.armhole,
    label: 'Arm Hole',
    placeholder: 'e.g., 45',
    tooltip: 'Measure the full round around the arm hole.',
  },
  sleeveLength: {
    ...BASE_MEASUREMENTS.sleeveLength,
    label: 'Sleeve Length',
    placeholder: 'e.g., 60',
    tooltip: 'Measure from the shoulder point to the sleeve end.',
  },
  sleeveRound: {
    ...BASE_MEASUREMENTS.sleeveRound,
    label: 'Sleeve Round',
    placeholder: 'e.g., 32',
    tooltip: 'Measure around the sleeve opening.',
  },
  upperBodyLength: {
    ...BASE_MEASUREMENTS.upperBodyLength,
    label: 'Upper Body Length',
    placeholder: 'e.g., 76',
    tooltip: 'Measure from the shoulder point down to the upper-body garment hem.',
  },
  upperBodyBottom: {
    ...BASE_MEASUREMENTS.upperBodyBottom,
    label: 'Upper Body Bottom',
    placeholder: 'e.g., 104',
    tooltip: 'Measure around the bottom opening of the upper body garment.',
  },
  hip: {
    ...BASE_MEASUREMENTS.hip,
    label: 'Hip',
    placeholder: 'e.g., 100',
    tooltip: 'Measure around the fullest part of the hip.',
  },
  lowerBodyLength: {
    ...BASE_MEASUREMENTS.lowerBodyLength,
    label: 'Lower Body Length',
    placeholder: 'e.g., 102',
    tooltip: 'Measure from the waist point to the lower-body hem.',
  },
  bottomRound: {
    ...BASE_MEASUREMENTS.bottomRound,
    label: 'Bottom Round',
    placeholder: 'e.g., 42',
    tooltip: 'Measure around the bottom opening.',
  },
  blouseShoulder: {
    key: 'blouseShoulder',
    label: 'Blouse Shoulder',
    description: 'Shoulder-to-shoulder blouse measurement',
    tooltip: 'Measure blouse shoulder point to shoulder point.',
    unit: 'cm',
    required: true,
    min: 25,
    max: 70,
    placeholder: 'e.g., 38',
  },
  blouseChest: {
    key: 'blouseChest',
    label: 'Blouse Chest',
    description: 'Chest measurement for blouse',
    tooltip: 'Measure around the fullest part of the blouse chest.',
    unit: 'cm',
    required: true,
    min: 50,
    max: 150,
    placeholder: 'e.g., 88',
  },
  blouseWaist: {
    key: 'blouseWaist',
    label: 'Blouse Waist',
    description: 'Waist measurement for blouse',
    tooltip: 'Measure around the blouse waist.',
    unit: 'cm',
    required: true,
    min: 45,
    max: 140,
    placeholder: 'e.g., 76',
  },
  blouseBackLength: {
    key: 'blouseBackLength',
    label: 'Blouse Back Length',
    description: 'Back length for blouse',
    tooltip: 'Measure from back shoulder point to blouse hem.',
    unit: 'cm',
    required: true,
    min: 20,
    max: 70,
    placeholder: 'e.g., 38',
  },
  blouseSleeveLength: {
    key: 'blouseSleeveLength',
    label: 'Blouse Sleeve Length',
    description: 'Sleeve length for blouse',
    tooltip: 'Measure from blouse shoulder point to sleeve end.',
    unit: 'cm',
    required: true,
    min: 5,
    max: 80,
    placeholder: 'e.g., 24',
  },
  blouseArmRound: {
    key: 'blouseArmRound',
    label: 'Blouse Arm Round',
    description: 'Arm round for blouse',
    tooltip: 'Measure around the blouse sleeve/arm opening.',
    unit: 'cm',
    required: true,
    min: 15,
    max: 70,
    placeholder: 'e.g., 28',
  },
};

const createAdditionalField = (key) => ({ ...MEASUREMENT_FIELDS[key] });

export const isFemaleDefaultCategory = (category) => (
  FEMALE_DEFAULT_CATEGORIES.includes(category)
);

export const getEffectiveMeasurementGender = (category, gender) => (
  isFemaleDefaultCategory(category) ? 'Female' : gender
);

const getBaseMeasurementKeysForCategory = (category) => {
  if (category === 'SAREE') return [];
  if (category === 'LEHENGA') return LOWER_BODY_MEASUREMENTS;
  return [...UPPER_BODY_MEASUREMENTS, ...LOWER_BODY_MEASUREMENTS];
};

const getAdditionalFieldsForCategory = (category, gender) => (
  getEffectiveMeasurementGender(category, gender) === 'Female'
    ? BLOUSE_MEASUREMENTS.map(createAdditionalField)
    : []
);

/**
 * Category families group similar categories.
 */
export const CATEGORY_FAMILIES = {
  'upper-lower-body': {
    id: 'upper-lower-body',
    label: 'Upper and Lower Body',
    description: 'Core garment measurements',
    categories: ALL_CATEGORIES,
    baseMeasurements: [...UPPER_BODY_MEASUREMENTS, ...LOWER_BODY_MEASUREMENTS],
    weightings: {
      chest: 0.45,
      shoulder: 0.25,
      hip: 0.3,
      armhole: 0,
      sleeveLength: 0,
      sleeveRound: 0,
      upperBodyLength: 0,
      upperBodyBottom: 0,
      lowerBodyLength: 0,
      bottomRound: 0,
    },
    additionalFields: [],
  },
};

/**
 * UI-specific category families for form rendering.
 */
export const CATEGORY_FAMILIES_UI = {
  'upper-lower-body': {
    id: 'upper-lower-body',
    label: 'Upper and Lower Body',
    fields: [...UPPER_BODY_MEASUREMENTS, ...LOWER_BODY_MEASUREMENTS],
    groups: [
      {
        id: 'upper-body',
        label: 'Upper Body',
        fields: UPPER_BODY_MEASUREMENTS,
      },
      {
        id: 'lower-body',
        label: 'Lower Body',
        fields: LOWER_BODY_MEASUREMENTS,
      },
    ],
    extraFields: [],
    categories: ALL_CATEGORIES,
  },
};

export const getCategoryFamilyUI = () => CATEGORY_FAMILIES_UI['upper-lower-body'];

export const getMeasurementFieldsUI = (category, gender) => {
  const family = getCategoryFamilyUI(category);
  const baseKeys = getBaseMeasurementKeysForCategory(category);
  const groups = family.groups.map((group) => ({
    ...group,
    fields: group.fields
      .filter((key) => baseKeys.includes(key))
      .map((key) => ({
        ...MEASUREMENT_FIELDS[key],
        required: true,
        type: 'base',
      })),
  })).filter((group) => group.fields.length > 0);
  const baseFields = groups.flatMap((group) => group.fields);
  const extraFields = getAdditionalFieldsForCategory(category, gender).map((field) => ({
    ...field,
    required: true,
    type: 'extra',
  }));

  return { baseFields, extraFields, groups };
};

/**
 * SIZE CLASSIFICATION RULES & FUNCTIONS.
 */

const BODY_SIZE_RULES = {
  XS: { chest: [70, 81], shoulder: [33, 38], hip: [81, 91], blouseChest: [70, 81], blouseShoulder: [30, 35] },
  S: { chest: [81, 91], shoulder: [38, 42], hip: [91, 102], blouseChest: [81, 91], blouseShoulder: [35, 39] },
  M: { chest: [91, 102], shoulder: [42, 46], hip: [102, 112], blouseChest: [91, 102], blouseShoulder: [39, 43] },
  L: { chest: [102, 112], shoulder: [46, 50], hip: [112, 122], blouseChest: [102, 112], blouseShoulder: [43, 47] },
  XL: { chest: [112, 122], shoulder: [50, 54], hip: [122, 135], blouseChest: [112, 122], blouseShoulder: [47, 51] },
  XXL: { chest: [122, 160], shoulder: [54, 70], hip: [135, 180], blouseChest: [122, 150], blouseShoulder: [51, 70] },
};

export const SIZE_RULES = {
  version: '1.1.0',
  createdAt: new Date('2026-05-03'),
  description: 'Upper body, lower body, and female blouse measurement model',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  families: {
    'upper-lower-body': {
      rules: BODY_SIZE_RULES,
    },
    'upper-body': {
      rules: BODY_SIZE_RULES,
    },
    'lower-body': {
      rules: BODY_SIZE_RULES,
    },
    'general-ethnic': {
      rules: BODY_SIZE_RULES,
    },
    'structured-womens': {
      rules: BODY_SIZE_RULES,
    },
    draped: {
      rules: BODY_SIZE_RULES,
    },
  },
};

export const FAMILY_WEIGHTINGS = {
  'upper-lower-body': CATEGORY_FAMILIES['upper-lower-body'].weightings,
  'upper-body': CATEGORY_FAMILIES['upper-lower-body'].weightings,
  'lower-body': CATEGORY_FAMILIES['upper-lower-body'].weightings,
  'general-ethnic': CATEGORY_FAMILIES['upper-lower-body'].weightings,
  'structured-womens': CATEGORY_FAMILIES['upper-lower-body'].weightings,
  draped: CATEGORY_FAMILIES['upper-lower-body'].weightings,
};

export const valueInRange = (value, range) => {
  if (!range || !Array.isArray(range) || range.length !== 2) return false;
  const [min, max] = range;
  return value >= min && value <= max;
};

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
      const distance = value < min ? min - value : value - max;
      const distanceScore = Math.max(0, 1 - distance / (rangeSize * 0.5));
      totalScore += distanceScore * weight;
    } else {
      totalScore += weight;
    }
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

export const getFamilyRules = (familyId) => (
  SIZE_RULES.families[familyId] || SIZE_RULES.families['upper-lower-body']
);

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

export const getCategoryFamily = (category, gender) => {
  const family = CATEGORY_FAMILIES['upper-lower-body'];
  const baseMeasurements = getBaseMeasurementKeysForCategory(category);
  const additionalFields = getAdditionalFieldsForCategory(category, gender);
  const weightings = category === 'SAREE'
    ? { blouseChest: 0.75, blouseShoulder: 0.25 }
    : category === 'LEHENGA'
      ? { hip: 0.7, blouseChest: 0.3 }
      : family.weightings;

  return {
    ...family,
    baseMeasurements,
    additionalFields,
    weightings,
  };
};

export const getMeasurementFieldsForCategory = (category, gender) => {
  const family = getCategoryFamily(category, gender);
  const baseFields = family.baseMeasurements.map((key) => BASE_MEASUREMENTS[key]);
  const extraFields = family.additionalFields || [];
  return { baseFields, extraFields, family };
};

export const validateMeasurement = (key, value) => {
  const def = BASE_MEASUREMENTS[key] || MEASUREMENT_FIELDS[key];
  if (!def) return { valid: false, error: `Unknown measurement: ${key}` };

  const num = parseFloat(value);
  if (Number.isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num < def.min) return { valid: false, error: `Minimum ${def.min} cm` };
  if (num > def.max) return { valid: false, error: `Maximum ${def.max} cm` };
  return { valid: true, value: num };
};
