/**
 * Body Preview Constants
 * Centralized configuration for body preview rendering
 */

// Zoom Configuration
export const ZOOM_CONFIG = {
  MIN: 0.5,
  MAX: 3,
  STEP: 0.25,
  DEFAULT: 1,
} as const;

// Body Proportions (based on 8-head canon)
export const BODY_PROPORTIONS = {
  // Head
  HEAD_RATIO: 0.65,
  
  // Torso multipliers
  BASE_MULTIPLIER: 1.1,
  
  // Y-position ratios (relative to unit)
  HEAD_Y: 0.75,
  NECK_Y: 1.15,
  SHOULDERS_Y: 1.55,
  CHEST_Y: 2.6,
  WAIST_Y: 3.6,
  HIPS_Y: 4.6,
  CROTCH_Y: 5,
  KNEE_Y: 6.5,
  ANKLE_Y: 8.1,
  FEET_Y: 8.5,
  
  // Width multipliers
  SHOULDER_MULTIPLIER: 1.65,
  CHEST_MULTIPLIER: 1.4,
  THIGH_MULTIPLIER: 0.5,
  KNEE_MULTIPLIER: 0.42,
  ANKLE_MULTIPLIER: 0.32,
} as const;

// Body Shape Factors
export const BODY_SHAPE_FACTORS = {
  slim: 0.8,
  athletic: 1.05,
  balanced: 1,
  muscular: 1.2,
  curvy: 1.15,
  'plus-size': 1.45,
} as const;

// BMI Ranges and Factors
export const BMI_RANGES = {
  UNDERWEIGHT: { max: 18.5, factor: 0.85 },
  NORMAL: { min: 18.5, max: 25, factor: 1 },
  OVERWEIGHT: { min: 25, max: 30, factor: 1.2 },
  OBESE: { min: 30, factor: 1.4 },
} as const;

// Fat Level Adjustment
export const FAT_LEVEL_FACTOR = 0.06;
export const MUSCLE_BASE = 0.9;
export const MUSCLE_FACTOR = 0.05;

// Body Factor Limits
export const BODY_FACTOR_LIMITS = {
  MIN: 0.7,
  MAX: 1.8,
} as const;

// Validation Ranges
export const VALIDATION_RANGES = {
  HEIGHT: { MIN: 120, MAX: 250 }, // cm
  WEIGHT: { MIN: 30, MAX: 300 }, // kg
  MUSCLE_LEVEL: { MIN: 1, MAX: 5 },
  FAT_LEVEL: { MIN: 1, MAX: 5 },
  AGE_APPEARANCE: { MIN: 1, MAX: 100 },
} as const;

// Skin Tones
export const SKIN_TONES = {
  'very-light': '#FFE4D0',
  'light': '#F5D5C0',
  'medium': '#DDB896',
  'tan': '#C9956F',
  'brown': '#A67C52',
  'dark': '#6B4423',
} as const;

export type SkinTone = keyof typeof SKIN_TONES;

// Hair Colors
export const HAIR_COLORS = {
  black: '#2C2C2C',
  brown: '#6F4E37',
  blonde: '#F4DCA8',
  red: '#C1440E',
  white: '#F5F5F5',
  gray: '#9E9E9E',
  purple: '#8B4789',
  blue: '#4A7C9E',
  green: '#5A7C4E',
  pink: '#FFB6C1',
  other: '#FF6B9D',
} as const;

export type HairColor = keyof typeof HAIR_COLORS;

// Eye Colors
export const EYE_COLORS = {
  brown: '#8B6F47',
  black: '#1A1A1A',
  blue: '#5B9BD5',
  green: '#70AD47',
  gray: '#A0A0A0',
  amber: '#D97706',
  hazel: '#8B7355',
} as const;

export type EyeColor = keyof typeof EYE_COLORS;

// Clothing Styles
export const CLOTHING_STYLES = {
  casual: '#94A3B8',
  formal: '#1E3A8A',
  sporty: '#EF4444',
  bohemian: '#92400E',
  vintage: '#92400E',
  preppy: '#EF4444',
  minimalist: '#6B7280',
} as const;

export type ClothingStyle = keyof typeof CLOTHING_STYLES;

// Footwear Types
export const FOOTWEAR_TYPES = {
  sneaker: '#F5F5F5',
  heels: '#1A1A1A',
  boots: '#2C3E50',
  sandals: '#8B6F47',
  formal: '#000000',
  loafers: '#8B6F47',
  flats: '#C19A6B',
  slippers: '#BDBDBD',
} as const;

export type FootwearType = keyof typeof FOOTWEAR_TYPES;

// Canvas Dimensions
export const CANVAS_DIMENSIONS = {
  WIDTH: 400,
  HEIGHT: 700,
} as const;


