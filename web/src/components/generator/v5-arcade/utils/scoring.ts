/**
 * Scoring System for V5 Arcade Generator
 *
 * Scoring Rules:
 * - WALDO match: +100 points per % confidence (up to 10,000 for 100%)
 * - Hash generation: +5,000 points (instant)
 * - Successful mint: +25,000 points (instant)
 * - Speed bonus: +1,000 per second under 12s
 * - Perfect run: 2x multiplier
 *
 * Star Rating:
 * - 1 star: <20,000
 * - 2 stars: 20,000-29,999
 * - 3 stars: 30,000-34,999
 * - 4 stars: 35,000-37,999
 * - 5 stars: 38,000+
 */

/**
 * Calculate WALDO correlation score
 * @param correlationScore - WALDO correlation score (0.0 to 1.0)
 * @returns Points earned (0 to 10,000)
 */
export function calculateWaldoScore(correlationScore: number): number {
  return Math.floor(correlationScore * 10000);
}

/**
 * Calculate speed bonus based on total completion time
 * @param totalTimeSeconds - Total time in seconds
 * @returns Bonus points (1,000 per second under 12s)
 */
export function calculateSpeedBonus(totalTimeSeconds: number): number {
  if (totalTimeSeconds >= 12) {
    return 0;
  }
  const secondsUnder12 = 12 - totalTimeSeconds;
  return Math.floor(secondsUnder12 * 1000);
}

/**
 * Calculate total score with optional perfect run multiplier
 * @param waldoScore - Points from WALDO correlation
 * @param hashScore - Points from hash generation
 * @param mintScore - Points from successful mint
 * @param speedBonus - Bonus points from speed
 * @param isPerfect - Whether this was a perfect run (no errors/retries)
 * @returns Total score
 */
export function calculateTotalScore(
  waldoScore: number,
  hashScore: number,
  mintScore: number,
  speedBonus: number,
  isPerfect: boolean
): number {
  const baseScore = waldoScore + hashScore + mintScore + speedBonus;
  return isPerfect ? baseScore * 2 : baseScore;
}

/**
 * Get star rating based on total score
 * @param totalScore - Total points earned
 * @returns Star rating (1-5)
 */
export function getStarRating(totalScore: number): number {
  if (totalScore >= 38000) {
    return 5;
  }
  if (totalScore >= 35000) {
    return 4;
  }
  if (totalScore >= 30000) {
    return 3;
  }
  if (totalScore >= 20000) {
    return 2;
  }
  return 1;
}

/**
 * Fixed score for hash generation
 */
export const HASH_SCORE = 5000;

/**
 * Fixed score for successful mint
 */
export const MINT_SCORE = 25000;
