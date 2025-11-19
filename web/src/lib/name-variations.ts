/**
 * Name Variation Utilities
 *
 * Generates realistic name variations for WALDO identity matching.
 * Based on common financial institution name normalization and matching logic.
 */

/**
 * Normalizes a name string for comparison
 * - Converts to lowercase
 * - Removes punctuation (periods, apostrophes, hyphens, commas)
 * - Collapses multiple spaces to single space
 * - Trims whitespace
 */
export function normalizeNameString(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,''-]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Generates realistic name variations for identity matching
 *
 * Returns 6-8 variations including:
 * - Original normalized form
 * - Last name first reordering
 * - First initial variations
 * - Last initial variations
 * - Middle name optional variations (if 3+ parts)
 */
export function generateNameVariations(normalizedName: string): string[] {
  const parts = normalizedName.split(' ').filter((p) => p.length > 0);

  if (parts.length === 0) {
    return [normalizedName];
  }

  const variations: string[] = [];

  // Original form
  variations.push(normalizedName);

  if (parts.length === 1) {
    // Single name - only return the original
    return variations;
  }

  if (parts.length === 2) {
    const [first, last] = parts;

    // Last, First reordering
    variations.push(`${last} ${first}`);

    // First initial + last
    variations.push(`${first[0]} ${last}`);

    // First + last initial
    variations.push(`${first} ${last[0]}`);

    // Both initials
    variations.push(`${first[0]} ${last[0]}`);

    // Last initial + first initial (reversed)
    variations.push(`${last[0]} ${first[0]}`);
  } else if (parts.length >= 3) {
    // 3+ parts: treat as First Middle Last (or First Middle... Last)
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, -1).join(' ');

    // Last, First Middle reordering
    variations.push(`${last} ${first} ${middle}`);

    // First Middle Last (original already added)

    // First initial + middle + last
    variations.push(`${first[0]} ${middle} ${last}`);

    // First + middle + last initial
    variations.push(`${first} ${middle} ${last[0]}`);

    // First + last (middle name optional)
    variations.push(`${first} ${last}`);

    // Last, First (middle omitted)
    variations.push(`${last} ${first}`);

    // First initial + last (middle omitted)
    variations.push(`${first[0]} ${last}`);

    // All initials
    variations.push(
      `${first[0]} ${middle
        .split(' ')
        .map((m) => m[0])
        .join(' ')} ${last[0]}`
    );
  }

  // Deduplicate and limit to 8 variations
  return [...new Set(variations)].slice(0, 8);
}

/**
 * Common nickname mappings (optional, nice-to-have)
 * Maps formal names to common nicknames and vice versa
 */
export const nicknameMap: Record<string, string[]> = {
  jonathan: ['jon', 'john'],
  john: ['jon', 'jonathan'],
  jon: ['john', 'jonathan'],
  michael: ['mike', 'mick'],
  mike: ['michael'],
  william: ['will', 'bill', 'billy'],
  will: ['william'],
  bill: ['william'],
  robert: ['rob', 'bob', 'bobby'],
  rob: ['robert'],
  bob: ['robert'],
  richard: ['rick', 'dick', 'rich'],
  rick: ['richard'],
  james: ['jim', 'jimmy'],
  jim: ['james'],
  thomas: ['tom', 'tommy'],
  tom: ['thomas'],
  christopher: ['chris'],
  chris: ['christopher'],
  matthew: ['matt'],
  matt: ['matthew'],
  daniel: ['dan', 'danny'],
  dan: ['daniel'],
  joseph: ['joe', 'joey'],
  joe: ['joseph'],
  anthony: ['tony'],
  tony: ['anthony'],
  david: ['dave'],
  dave: ['david'],
  elizabeth: ['liz', 'beth', 'betty'],
  liz: ['elizabeth'],
  beth: ['elizabeth'],
  jennifer: ['jen', 'jenny'],
  jen: ['jennifer'],
  katherine: ['kate', 'kathy', 'katie'],
  kate: ['katherine'],
  kathy: ['katherine'],
  margaret: ['meg', 'peggy', 'maggie'],
  meg: ['margaret'],
  peggy: ['margaret'],
  susan: ['sue', 'susie'],
  sue: ['susan'],
  patricia: ['pat', 'patty', 'tricia'],
  pat: ['patricia'],
  barbara: ['barb', 'babs'],
  barb: ['barbara'],
};

/**
 * Generates variations including nickname substitutions (optional enhancement)
 * Not used in initial implementation but available for future enhancement
 */
export function generateVariationsWithNicknames(normalizedName: string): string[] {
  const baseVariations = generateNameVariations(normalizedName);
  const parts = normalizedName.split(' ').filter((p) => p.length > 0);

  if (parts.length === 0) {
    return baseVariations;
  }

  const nicknameVariations: string[] = [];

  // Check if first name has nicknames
  const firstName = parts[0];
  const nicknames = nicknameMap[firstName] || [];

  for (const nickname of nicknames) {
    const substitutedParts = [nickname, ...parts.slice(1)];
    const substitutedName = substitutedParts.join(' ');
    const variations = generateNameVariations(substitutedName);
    nicknameVariations.push(...variations);
  }

  // Combine and deduplicate, limit to 12 total
  return [...new Set([...baseVariations, ...nicknameVariations])].slice(0, 12);
}
