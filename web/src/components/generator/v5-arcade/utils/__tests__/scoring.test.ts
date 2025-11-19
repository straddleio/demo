import { describe, it, expect } from 'vitest';
import {
  calculateWaldoScore,
  calculateSpeedBonus,
  calculateTotalScore,
  getStarRating,
  HASH_SCORE,
  MINT_SCORE,
} from '../scoring';

describe('Scoring System', () => {
  describe('calculateWaldoScore', () => {
    it('should calculate 9,800 points for 98% correlation', () => {
      expect(calculateWaldoScore(0.98)).toBe(9800);
    });

    it('should calculate 10,000 points for 100% correlation', () => {
      expect(calculateWaldoScore(1.0)).toBe(10000);
    });

    it('should calculate 5,000 points for 50% correlation', () => {
      expect(calculateWaldoScore(0.5)).toBe(5000);
    });

    it('should calculate 0 points for 0% correlation', () => {
      expect(calculateWaldoScore(0)).toBe(0);
    });

    it('should floor decimal results', () => {
      expect(calculateWaldoScore(0.555)).toBe(5550);
    });
  });

  describe('calculateSpeedBonus', () => {
    it('should calculate 2,000 bonus for 10s completion', () => {
      expect(calculateSpeedBonus(10)).toBe(2000);
    });

    it('should calculate 1,000 bonus for 11s completion', () => {
      expect(calculateSpeedBonus(11)).toBe(1000);
    });

    it('should calculate 0 bonus for 12s completion', () => {
      expect(calculateSpeedBonus(12)).toBe(0);
    });

    it('should calculate 0 bonus for >12s completion', () => {
      expect(calculateSpeedBonus(15)).toBe(0);
    });

    it('should calculate 500 bonus for 11.5s completion', () => {
      expect(calculateSpeedBonus(11.5)).toBe(500);
    });

    it('should floor decimal results', () => {
      expect(calculateSpeedBonus(10.7)).toBe(1300);
    });
  });

  describe('calculateTotalScore', () => {
    it('should sum all scores for non-perfect run', () => {
      const waldoScore = 9800;
      const hashScore = 5000;
      const mintScore = 25000;
      const speedBonus = 2000;
      const isPerfect = false;

      const total = calculateTotalScore(waldoScore, hashScore, mintScore, speedBonus, isPerfect);

      expect(total).toBe(41800);
    });

    it('should double the score for perfect run', () => {
      const waldoScore = 9800;
      const hashScore = 5000;
      const mintScore = 25000;
      const speedBonus = 2000;
      const isPerfect = true;

      const total = calculateTotalScore(waldoScore, hashScore, mintScore, speedBonus, isPerfect);

      expect(total).toBe(83600); // (9800 + 5000 + 25000 + 2000) * 2
    });

    it('should handle zero scores', () => {
      const total = calculateTotalScore(0, 0, 0, 0, false);
      expect(total).toBe(0);
    });

    it('should handle perfect run with zero scores', () => {
      const total = calculateTotalScore(0, 0, 0, 0, true);
      expect(total).toBe(0);
    });
  });

  describe('getStarRating', () => {
    it('should return 1 star for score < 20,000', () => {
      expect(getStarRating(0)).toBe(1);
      expect(getStarRating(10000)).toBe(1);
      expect(getStarRating(19999)).toBe(1);
    });

    it('should return 2 stars for score 20,000-29,999', () => {
      expect(getStarRating(20000)).toBe(2);
      expect(getStarRating(25000)).toBe(2);
      expect(getStarRating(29999)).toBe(2);
    });

    it('should return 3 stars for score 30,000-34,999', () => {
      expect(getStarRating(30000)).toBe(3);
      expect(getStarRating(32500)).toBe(3);
      expect(getStarRating(34999)).toBe(3);
    });

    it('should return 4 stars for score 35,000-37,999', () => {
      expect(getStarRating(35000)).toBe(4);
      expect(getStarRating(36500)).toBe(4);
      expect(getStarRating(37999)).toBe(4);
    });

    it('should return 5 stars for score >= 38,000', () => {
      expect(getStarRating(38000)).toBe(5);
      expect(getStarRating(40000)).toBe(5);
      expect(getStarRating(50000)).toBe(5);
      expect(getStarRating(100000)).toBe(5);
    });
  });

  describe('Constants', () => {
    it('should define HASH_SCORE as 5,000', () => {
      expect(HASH_SCORE).toBe(5000);
    });

    it('should define MINT_SCORE as 25,000', () => {
      expect(MINT_SCORE).toBe(25000);
    });
  });
});
