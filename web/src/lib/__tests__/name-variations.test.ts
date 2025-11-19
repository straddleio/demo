/**
 * Tests for name variation utilities
 */

import { normalizeNameString, generateNameVariations } from '../name-variations';

describe('normalizeNameString', () => {
  it('should convert to lowercase', () => {
    expect(normalizeNameString('Jonathan Smith')).toBe('jonathan smith');
  });

  it('should remove punctuation', () => {
    expect(normalizeNameString("Jonathan O'Brien Jr.")).toBe('jonathan obrien jr');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeNameString('Jonathan   Smith')).toBe('jonathan smith');
  });

  it('should trim whitespace', () => {
    expect(normalizeNameString('  Jonathan Smith  ')).toBe('jonathan smith');
  });

  it('should handle complex names', () => {
    expect(normalizeNameString("Mary-Jane O'Connor, Jr.")).toBe('maryjane oconnor jr');
  });
});

describe('generateNameVariations', () => {
  it('should return original for single name', () => {
    const variations = generateNameVariations('jonathan');
    expect(variations).toContain('jonathan');
    expect(variations).toHaveLength(1);
  });

  it('should generate variations for two-part name', () => {
    const variations = generateNameVariations('jonathan smith');

    // Should include original
    expect(variations).toContain('jonathan smith');

    // Should include last-first reordering
    expect(variations).toContain('smith jonathan');

    // Should include initial variations
    expect(variations).toContain('j smith');
    expect(variations).toContain('jonathan s');
    expect(variations).toContain('j s');

    // Should not exceed 8 variations
    expect(variations.length).toBeLessThanOrEqual(8);
  });

  it('should generate variations for three-part name', () => {
    const variations = generateNameVariations('jonathan robert smith');

    // Should include original
    expect(variations).toContain('jonathan robert smith');

    // Should include reordered
    expect(variations).toContain('smith jonathan robert');

    // Should include middle-name-optional variations
    expect(variations).toContain('jonathan smith');
    expect(variations).toContain('smith jonathan');

    // Should include initial variations
    expect(variations).toContain('j robert smith');

    // Should not exceed 8 variations
    expect(variations.length).toBeLessThanOrEqual(8);
  });

  it('should deduplicate variations', () => {
    const variations = generateNameVariations('john smith');
    const unique = new Set(variations);
    expect(variations.length).toBe(unique.size);
  });

  it('should handle empty string', () => {
    const variations = generateNameVariations('');
    expect(variations).toHaveLength(1);
    expect(variations[0]).toBe('');
  });
});
