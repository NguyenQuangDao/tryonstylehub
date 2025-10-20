/**
 * Body Calculation Utilities
 * Pure functions for body metrics calculations
 */

import {
    BMI_RANGES,
    BODY_FACTOR_LIMITS,
    BODY_SHAPE_FACTORS,
    FAT_LEVEL_FACTOR,
    MUSCLE_BASE,
    MUSCLE_FACTOR,
    VALIDATION_RANGES,
} from '@/constants/body-preview';

/**
 * Calculate BMI (Body Mass Index)
 * @param weight - Weight in kilograms
 * @param height - Height in centimeters
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / Math.pow(heightInMeters, 2);
}

/**
 * Calculate body width factor based on shape, BMI, and fat level
 * @param bodyShape - Body shape type
 * @param bmi - Body Mass Index
 * @param fatLevel - Fat level (1-5)
 * @returns Body width factor (0.7 - 1.8)
 */
export function calculateBodyWidthFactor(
  bodyShape: string,
  bmi: number,
  fatLevel?: number
): number {
  let factor = 1;

  // Apply body shape factor
  if (bodyShape && bodyShape in BODY_SHAPE_FACTORS) {
    factor = BODY_SHAPE_FACTORS[bodyShape as keyof typeof BODY_SHAPE_FACTORS];
  } else {
    // Fallback to BMI-based calculation
    if (bmi < BMI_RANGES.UNDERWEIGHT.max) {
      factor = BMI_RANGES.UNDERWEIGHT.factor;
    } else if (bmi >= BMI_RANGES.OVERWEIGHT.min && bmi < BMI_RANGES.OVERWEIGHT.max) {
      factor = BMI_RANGES.OVERWEIGHT.factor;
    } else if (bmi >= BMI_RANGES.OBESE.min) {
      factor = BMI_RANGES.OBESE.factor;
    }
  }

  // Adjust for fat level
  if (fatLevel) {
    factor += (fatLevel - 3) * FAT_LEVEL_FACTOR;
  }

  // Clamp to valid range
  return Math.max(
    BODY_FACTOR_LIMITS.MIN,
    Math.min(BODY_FACTOR_LIMITS.MAX, factor)
  );
}

/**
 * Calculate muscle factor based on muscle level
 * @param muscleLevel - Muscle level (1-5)
 * @returns Muscle factor multiplier
 */
export function calculateMuscleFactor(muscleLevel?: number): number {
  if (!muscleLevel) return 1;
  return MUSCLE_BASE + muscleLevel * MUSCLE_FACTOR;
}

/**
 * Validate and clamp height to acceptable range
 * @param height - Height in centimeters
 * @returns Validated height
 */
export function validateHeight(height: number): number {
  return Math.max(
    VALIDATION_RANGES.HEIGHT.MIN,
    Math.min(VALIDATION_RANGES.HEIGHT.MAX, height)
  );
}

/**
 * Validate and clamp weight to acceptable range
 * @param weight - Weight in kilograms
 * @returns Validated weight
 */
export function validateWeight(weight: number): number {
  return Math.max(
    VALIDATION_RANGES.WEIGHT.MIN,
    Math.min(VALIDATION_RANGES.WEIGHT.MAX, weight)
  );
}

/**
 * Validate muscle level
 * @param muscleLevel - Muscle level input
 * @returns Validated muscle level or undefined
 */
export function validateMuscleLevel(muscleLevel?: number): number | undefined {
  if (!muscleLevel) return undefined;
  return Math.max(
    VALIDATION_RANGES.MUSCLE_LEVEL.MIN,
    Math.min(VALIDATION_RANGES.MUSCLE_LEVEL.MAX, muscleLevel)
  );
}

/**
 * Validate fat level
 * @param fatLevel - Fat level input
 * @returns Validated fat level or undefined
 */
export function validateFatLevel(fatLevel?: number): number | undefined {
  if (!fatLevel) return undefined;
  return Math.max(
    VALIDATION_RANGES.FAT_LEVEL.MIN,
    Math.min(VALIDATION_RANGES.FAT_LEVEL.MAX, fatLevel)
  );
}

/**
 * Generate shadow color from base color
 * @param baseColor - Base hex color
 * @param factor - Darkness factor (0-1)
 * @returns RGB shadow color string
 */
export function getSkinShade(baseColor: string, factor: number = 0.85): string {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

/**
 * Generate highlight color from base color
 * @param baseColor - Base hex color
 * @param factor - Brightness factor (>1)
 * @returns RGB highlight color string
 */
export function getSkinHighlight(baseColor: string, factor: number = 1.15): string {
  const hex = baseColor.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * factor);
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * factor);
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * factor);
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}


