/**
 * Tests for body-calculations utility functions
 */

import {
    calculateBMI,
    calculateBodyWidthFactor,
    calculateMuscleFactor,
    getSkinHighlight,
    getSkinShade,
    validateFatLevel,
    validateHeight,
    validateMuscleLevel,
    validateWeight,
} from '@/utils/body-calculations';
import { describe, expect, it } from 'vitest';

describe('body-calculations', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly for normal weight', () => {
      const bmi = calculateBMI(70, 170); // 70kg, 170cm
      expect(bmi).toBeCloseTo(24.22, 2);
    });

    it('should calculate BMI correctly for underweight', () => {
      const bmi = calculateBMI(50, 170); // 50kg, 170cm
      expect(bmi).toBeCloseTo(17.30, 2);
    });

    it('should calculate BMI correctly for overweight', () => {
      const bmi = calculateBMI(90, 170); // 90kg, 170cm
      expect(bmi).toBeCloseTo(31.14, 2);
    });
  });

  describe('calculateBodyWidthFactor', () => {
    it('should return correct factor for slim body shape', () => {
      const factor = calculateBodyWidthFactor('slim', 22, 3);
      expect(factor).toBe(0.8);
    });

    it('should return correct factor for athletic body shape', () => {
      const factor = calculateBodyWidthFactor('athletic', 22, 3);
      expect(factor).toBe(1.05);
    });

    it('should return correct factor for muscular body shape', () => {
      const factor = calculateBodyWidthFactor('muscular', 22, 3);
      expect(factor).toBe(1.2);
    });

    it('should adjust for fat level', () => {
      const baseFactor = calculateBodyWidthFactor('balanced', 22, 3);
      const higherFatFactor = calculateBodyWidthFactor('balanced', 22, 5);
      expect(higherFatFactor).toBeGreaterThan(baseFactor);
    });

    it('should use BMI when no body shape is provided', () => {
      const factor = calculateBodyWidthFactor('', 17, 3); // Underweight BMI
      expect(factor).toBe(0.85);
    });

    it('should clamp factor to valid range', () => {
      const factor = calculateBodyWidthFactor('plus-size', 35, 5);
      expect(factor).toBeLessThanOrEqual(1.8);
      expect(factor).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('calculateMuscleFactor', () => {
    it('should return 1 for undefined muscle level', () => {
      const factor = calculateMuscleFactor(undefined);
      expect(factor).toBe(1);
    });

    it('should calculate correct factor for muscle level 3', () => {
      const factor = calculateMuscleFactor(3);
      expect(factor).toBe(1.05); // 0.9 + 3 * 0.05
    });

    it('should calculate correct factor for muscle level 5', () => {
      const factor = calculateMuscleFactor(5);
      expect(factor).toBe(1.15); // 0.9 + 5 * 0.05
    });
  });

  describe('validateHeight', () => {
    it('should return value within valid range', () => {
      expect(validateHeight(170)).toBe(170);
    });

    it('should clamp too low values', () => {
      expect(validateHeight(100)).toBe(120);
    });

    it('should clamp too high values', () => {
      expect(validateHeight(300)).toBe(250);
    });
  });

  describe('validateWeight', () => {
    it('should return value within valid range', () => {
      expect(validateWeight(70)).toBe(70);
    });

    it('should clamp too low values', () => {
      expect(validateWeight(20)).toBe(30);
    });

    it('should clamp too high values', () => {
      expect(validateWeight(350)).toBe(300);
    });
  });

  describe('validateMuscleLevel', () => {
    it('should return undefined for undefined input', () => {
      expect(validateMuscleLevel(undefined)).toBeUndefined();
    });

    it('should return value within valid range', () => {
      expect(validateMuscleLevel(3)).toBe(3);
    });

    it('should clamp to minimum', () => {
      expect(validateMuscleLevel(0)).toBe(1);
    });

    it('should clamp to maximum', () => {
      expect(validateMuscleLevel(10)).toBe(5);
    });
  });

  describe('validateFatLevel', () => {
    it('should return undefined for undefined input', () => {
      expect(validateFatLevel(undefined)).toBeUndefined();
    });

    it('should return value within valid range', () => {
      expect(validateFatLevel(3)).toBe(3);
    });

    it('should clamp to minimum', () => {
      expect(validateFatLevel(0)).toBe(1);
    });

    it('should clamp to maximum', () => {
      expect(validateFatLevel(10)).toBe(5);
    });
  });

  describe('getSkinShade', () => {
    it('should darken a color', () => {
      const base = '#FFFFFF';
      const shade = getSkinShade(base, 0.5);
      expect(shade).toBe('rgb(127, 127, 127)');
    });

    it('should use default factor when not provided', () => {
      const base = '#FFFFFF';
      const shade = getSkinShade(base);
      expect(shade).toBe('rgb(216, 216, 216)'); // 0.85 default
    });
  });

  describe('getSkinHighlight', () => {
    it('should lighten a color', () => {
      const base = '#808080'; // 128,128,128
      const highlight = getSkinHighlight(base, 1.5);
      expect(highlight).toBe('rgb(192, 192, 192)');
    });

    it('should not exceed 255', () => {
      const base = '#FFFFFF';
      const highlight = getSkinHighlight(base, 2);
      expect(highlight).toBe('rgb(255, 255, 255)');
    });

    it('should use default factor when not provided', () => {
      const base = '#808080';
      const highlight = getSkinHighlight(base);
      // 128 * 1.15 = 147
      expect(highlight).toBe('rgb(147, 147, 147)');
    });
  });
});


