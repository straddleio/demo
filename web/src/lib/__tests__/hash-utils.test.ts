import { describe, it, expect, vi } from 'vitest';
import {
  generateDemoHash,
  randomHexChar,
  randomHexStream,
} from '../hash-utils';

describe('generateDemoHash', () => {
  it('should return 64 hex characters', () => {
    const hash = generateDemoHash('test input');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should be deterministic for same input', () => {
    const input = 'John Doe|1234|021000021';
    const hash1 = generateDemoHash(input);
    const hash2 = generateDemoHash(input);
    const hash3 = generateDemoHash(input);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = generateDemoHash('input1');
    const hash2 = generateDemoHash('input2');
    const hash3 = generateDemoHash('input3');

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  it('should handle empty string input', () => {
    const hash = generateDemoHash('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle single character input', () => {
    const hash = generateDemoHash('a');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle long input strings', () => {
    const longInput = 'a'.repeat(10000);
    const hash = generateDemoHash(longInput);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle special characters', () => {
    const hash = generateDemoHash('!@#$%^&*()_+-={}[]|\\:";\'<>?,./');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle Unicode characters', () => {
    const hash = generateDemoHash('Hello 世界 🌍');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should handle newlines and whitespace', () => {
    const hash = generateDemoHash('line1\nline2\ttab  spaces');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should be case sensitive', () => {
    const hash1 = generateDemoHash('Test');
    const hash2 = generateDemoHash('test');

    expect(hash1).not.toBe(hash2);
  });

  it('should produce different hashes for inputs differing only in whitespace', () => {
    const hash1 = generateDemoHash('test');
    const hash2 = generateDemoHash('test ');
    const hash3 = generateDemoHash(' test');

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  it('should use lowercase hex characters in output', () => {
    // Verify output contains valid hex chars (but not necessarily all 16)
    const hash = generateDemoHash('test input');
    expect(hash).toMatch(/^[0-9a-f]+$/);

    // Generate a few more and verify they're all valid hex
    for (let i = 0; i < 10; i++) {
      const h = generateDemoHash(`input${i}`);
      expect(h).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('should be consistent across multiple calls', () => {
    const input = 'customer_id|account_number|routing_number';
    const results = [];

    for (let i = 0; i < 10; i++) {
      results.push(generateDemoHash(input));
    }

    // All results should be identical
    const firstHash = results[0];
    results.forEach((hash) => {
      expect(hash).toBe(firstHash);
    });
  });

  it('should handle typical paykey input format', () => {
    const input = 'Alberta Bobbeth Charleson|123456789|021000021';
    const hash = generateDemoHash(input);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(generateDemoHash(input)).toBe(hash); // Deterministic
  });

  it('should produce different hashes for similar inputs', () => {
    const hash1 = generateDemoHash('test1');
    const hash2 = generateDemoHash('test2');

    // Different inputs should produce different hashes
    expect(hash1).not.toBe(hash2);

    // Verify both are valid
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    expect(hash2).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should not contain uppercase letters', () => {
    const hash = generateDemoHash('Test Input');
    expect(hash).not.toMatch(/[A-F]/);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('should handle numerical input strings', () => {
    const hash = generateDemoHash('123456789');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should produce valid hex output consistently', () => {
    // Generate many hashes and verify they're all valid
    const hashes = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const hash = generateDemoHash(`input-${i}`);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
      expect(hash).toHaveLength(64);
      hashes.add(hash);
    }

    // Simple hash will have some collisions, but should have at least 50% unique
    expect(hashes.size).toBeGreaterThan(50);
  });
});

describe('randomHexChar', () => {
  it('should return single hex character', () => {
    const char = randomHexChar();
    expect(char).toHaveLength(1);
    expect(char).toMatch(/^[0-9a-f]$/);
  });

  it('should return different values on multiple calls', () => {
    const chars = new Set();
    for (let i = 0; i < 100; i++) {
      chars.add(randomHexChar());
    }

    // Should have gotten multiple different characters
    expect(chars.size).toBeGreaterThan(1);
  });

  it('should return all hex characters eventually', () => {
    const chars = new Set();
    const hexChars = '0123456789abcdef';

    // Generate many chars
    for (let i = 0; i < 1000; i++) {
      chars.add(randomHexChar());
    }

    // Should have seen all 16 hex chars
    expect(chars.size).toBe(16);

    // Verify all expected chars are present
    for (const char of hexChars) {
      expect(chars.has(char)).toBe(true);
    }
  });

  it('should use Math.random', () => {
    const spy = vi.spyOn(Math, 'random');
    randomHexChar();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should not return uppercase letters', () => {
    for (let i = 0; i < 100; i++) {
      const char = randomHexChar();
      expect(char).not.toMatch(/[A-F]/);
    }
  });

  it('should have roughly uniform distribution', () => {
    const counts: Record<string, number> = {};
    const hexChars = '0123456789abcdef';

    for (const char of hexChars) {
      counts[char] = 0;
    }

    // Generate 10000 random chars
    for (let i = 0; i < 10000; i++) {
      const char = randomHexChar();
      counts[char]++;
    }

    // Each char should appear roughly 10000/16 = 625 times
    // Allow 30% variance due to randomness
    const expected = 10000 / 16;
    const tolerance = expected * 0.3;

    Object.values(counts).forEach((count) => {
      expect(count).toBeGreaterThan(expected - tolerance);
      expect(count).toBeLessThan(expected + tolerance);
    });
  });
});

describe('randomHexStream', () => {
  it('should return string of specified length', () => {
    expect(randomHexStream(10)).toHaveLength(10);
    expect(randomHexStream(64)).toHaveLength(64);
    expect(randomHexStream(256)).toHaveLength(256);
  });

  it('should return only hex characters', () => {
    const stream = randomHexStream(100);
    expect(stream).toMatch(/^[0-9a-f]+$/);
  });

  it('should return empty string for length 0', () => {
    expect(randomHexStream(0)).toBe('');
  });

  it('should handle length 1', () => {
    const stream = randomHexStream(1);
    expect(stream).toHaveLength(1);
    expect(stream).toMatch(/^[0-9a-f]$/);
  });

  it('should return different values on multiple calls', () => {
    const stream1 = randomHexStream(64);
    const stream2 = randomHexStream(64);
    const stream3 = randomHexStream(64);

    // Very unlikely to be equal (but not impossible due to randomness)
    // At least 2 should be different
    const allSame = stream1 === stream2 && stream2 === stream3;
    expect(allSame).toBe(false);
  });

  it('should handle large lengths', () => {
    const stream = randomHexStream(10000);
    expect(stream).toHaveLength(10000);
    expect(stream).toMatch(/^[0-9a-f]+$/);
  });

  it('should not return uppercase letters', () => {
    const stream = randomHexStream(1000);
    expect(stream).not.toMatch(/[A-F]/);
  });

  it('should use all hex characters', () => {
    const stream = randomHexStream(1000);
    const hexChars = '0123456789abcdef';

    for (const char of hexChars) {
      expect(stream).toContain(char);
    }
  });

  it('should be non-deterministic', () => {
    // Generate multiple streams and verify they differ
    const streams = new Set();
    for (let i = 0; i < 10; i++) {
      streams.add(randomHexStream(32));
    }

    // Should have at least 9 unique streams (extremely unlikely to have collisions)
    expect(streams.size).toBeGreaterThanOrEqual(9);
  });

  it('should use randomHexChar internally', () => {
    const spy = vi.spyOn(Math, 'random');
    const length = 5;
    randomHexStream(length);

    // Should call Math.random at least `length` times
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(length);
    spy.mockRestore();
  });

  it('should have uniform character distribution', () => {
    const stream = randomHexStream(10000);
    const counts: Record<string, number> = {};
    const hexChars = '0123456789abcdef';

    for (const char of hexChars) {
      counts[char] = 0;
    }

    for (const char of stream) {
      counts[char]++;
    }

    // Each char should appear roughly 10000/16 = 625 times
    const expected = 10000 / 16;
    const tolerance = expected * 0.3;

    Object.values(counts).forEach((count) => {
      expect(count).toBeGreaterThan(expected - tolerance);
      expect(count).toBeLessThan(expected + tolerance);
    });
  });

  it('should work for typical animation lengths', () => {
    // Typical lengths used in paykey generation animations
    const lengths = [4, 8, 16, 32, 64];

    lengths.forEach((length) => {
      const stream = randomHexStream(length);
      expect(stream).toHaveLength(length);
      expect(stream).toMatch(/^[0-9a-f]+$/);
    });
  });
});

describe('Hash utility integration', () => {
  it('should work together for paykey generation demo', () => {
    // Simulate paykey generation flow
    const customerName = 'Alberta Bobbeth Charleson';
    const accountNumber = '123456789';
    const routingNumber = '021000021';

    const input = `${customerName}|${accountNumber}|${routingNumber}`;
    const finalHash = generateDemoHash(input);

    // Verify final hash
    expect(finalHash).toHaveLength(64);
    expect(finalHash).toMatch(/^[0-9a-f]{64}$/);

    // Generate streaming preview
    const streamingHash = randomHexStream(64);
    expect(streamingHash).toHaveLength(64);
    expect(streamingHash).toMatch(/^[0-9a-f]{64}$/);

    // Streaming hash should differ from final (random vs deterministic)
    expect(streamingHash).not.toBe(finalHash);
  });

  it('should demonstrate deterministic vs random behavior', () => {
    const input = 'test';

    // Deterministic hash
    const hash1 = generateDemoHash(input);
    const hash2 = generateDemoHash(input);
    expect(hash1).toBe(hash2);

    // Random stream
    const stream1 = randomHexStream(64);
    const stream2 = randomHexStream(64);
    expect(stream1).not.toBe(stream2);
  });
});
