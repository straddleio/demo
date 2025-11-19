/**
 * Hash Utilities
 *
 * Utilities for generating demo hashes for visualization purposes.
 * Real paykey generation uses actual BLAKE3, but we mock it for visualization.
 */

/**
 * Generates a cryptographically random-looking hash for demo purposes
 *
 * Uses a simple deterministic hash based on input string so same input
 * produces same output (for consistency in demos).
 *
 * @param input - Input string to hash
 * @returns 64 hex characters (256-bit equivalent)
 *
 * @example
 * ```typescript
 * const hash = generateDemoHash('John Doe|1234|021000021');
 * // Returns: "a7f2d9e4c8b1f5a2c6e39d7b4f1a8e2d6c5b9f3e7a1d8c4b2f6e9a5d3c7b1f4e8"
 * ```
 */
export function generateDemoHash(input: string): string {
  // Simple hash function for deterministic output
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate 64 hex characters from the hash seed
  const hexChars = '0123456789abcdef';
  let result = '';

  // Use hash as seed for pseudo-random hex generation
  let seed = Math.abs(hash);

  for (let i = 0; i < 64; i++) {
    // Simple LCG (Linear Congruential Generator) for pseudo-random numbers
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const index = seed % 16;
    result += hexChars[index];
  }

  return result;
}

/**
 * Generates a random hex character for streaming animations
 *
 * @returns Single random hex character (0-9, a-f)
 */
export function randomHexChar(): string {
  const hexChars = '0123456789abcdef';
  return hexChars[Math.floor(Math.random() * 16)];
}

/**
 * Generates a stream of random hex characters
 *
 * @param length - Number of hex characters to generate
 * @returns String of random hex characters
 */
export function randomHexStream(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomHexChar();
  }
  return result;
}
