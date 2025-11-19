/**
 * Paykey Generator Types
 *
 * Type definitions for the paykey generator visualization modal.
 */

/**
 * Generator stage progression
 */
export type GeneratorStage = 'waldo' | 'blake3' | 'minting' | 'complete';

/**
 * Data required for paykey generator visualization
 * Re-exported from state.ts to avoid duplication
 */
export type { GeneratorData } from '../../lib/state';
