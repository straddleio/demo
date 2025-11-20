import { describe, it, expect } from 'vitest';
import {
  NerdIcons,
  getIcon,
  getRiskIcon,
  getStatusIcon,
  getDecisionIcon,
  getChargeStatusIconType,
} from '../nerd-icons';

describe('NerdIcons', () => {
  it('should export icon constants', () => {
    expect(NerdIcons.checkmark).toBe('✓');
    expect(NerdIcons.cross).toBe('✗');
    expect(NerdIcons.warning).toBe('⚠');
    expect(NerdIcons.circleFilled).toBe('●');
    expect(NerdIcons.circleHalf).toBe('◐');
    expect(NerdIcons.circleEmpty).toBe('○');
    expect(NerdIcons.active).toBe('◉');
    expect(NerdIcons.complete).toBe('✓');
    expect(NerdIcons.pending).toBe('○');
    expect(NerdIcons.terminal).toBe('❯');
    expect(NerdIcons.dollar).toBe('$');
  });

  it('should have all expected icon properties', () => {
    const expectedIcons = [
      'checkmark',
      'cross',
      'warning',
      'circleFilled',
      'circleHalf',
      'circleEmpty',
      'dotLarge',
      'dotSmall',
      'active',
      'complete',
      'pending',
      'arrowRight',
      'arrowLeft',
      'arrowUp',
      'arrowDown',
      'terminal',
      'prompt',
      'chevronRight',
      'square',
      'squareEmpty',
      'dollar',
      'coin',
      'pin',
      'globe',
      'mapPin',
      'shield',
      'calendar',
      'star',
      'starEmpty',
      'info',
      'question',
    ];

    expectedIcons.forEach((iconName) => {
      expect(NerdIcons).toHaveProperty(iconName);
      expect(typeof NerdIcons[iconName as keyof typeof NerdIcons]).toBe('string');
      expect(NerdIcons[iconName as keyof typeof NerdIcons].length).toBeGreaterThan(0);
    });
  });
});

describe('getIcon', () => {
  it('should return correct icon for valid name', () => {
    expect(getIcon('checkmark')).toBe('✓');
    expect(getIcon('cross')).toBe('✗');
    expect(getIcon('warning')).toBe('⚠');
    expect(getIcon('dollar')).toBe('$');
    expect(getIcon('terminal')).toBe('❯');
  });

  it('should return Unicode characters', () => {
    const icon = getIcon('checkmark');
    // eslint-disable-next-line no-control-regex
    expect(icon).toMatch(/^[\u0001-\uFFFF]+$/);
  });
});

describe('getRiskIcon', () => {
  it('should return empty circle for low risk (< 0.1)', () => {
    expect(getRiskIcon(0)).toBe('○');
    expect(getRiskIcon(0.05)).toBe('○');
    expect(getRiskIcon(0.09)).toBe('○');
  });

  it('should return half circle for medium risk (0.1 - 0.5)', () => {
    expect(getRiskIcon(0.1)).toBe('◐');
    expect(getRiskIcon(0.25)).toBe('◐');
    expect(getRiskIcon(0.49)).toBe('◐');
  });

  it('should return filled circle for high risk (>= 0.5)', () => {
    expect(getRiskIcon(0.5)).toBe('●');
    expect(getRiskIcon(0.75)).toBe('●');
    expect(getRiskIcon(1.0)).toBe('●');
  });

  it('should handle edge cases', () => {
    expect(getRiskIcon(0.0999)).toBe('○');
    expect(getRiskIcon(0.1000)).toBe('◐');
    expect(getRiskIcon(0.4999)).toBe('◐');
    expect(getRiskIcon(0.5000)).toBe('●');
  });

  it('should handle negative scores as low risk', () => {
    // Negative scores are treated as < 0.1, so they get low risk icon
    expect(getRiskIcon(-0.1)).toBe('○');
  });

  it('should handle scores above 1.0 as high risk', () => {
    expect(getRiskIcon(1.5)).toBe('●');
    expect(getRiskIcon(10.0)).toBe('●');
  });
});

describe('getStatusIcon', () => {
  it('should return checkmark for complete status', () => {
    expect(getStatusIcon('complete')).toBe('✓');
  });

  it('should return active icon for active status', () => {
    expect(getStatusIcon('active')).toBe('◉');
  });

  it('should return empty circle for pending status', () => {
    expect(getStatusIcon('pending')).toBe('○');
  });

  it('should return cross for failed status', () => {
    expect(getStatusIcon('failed')).toBe('✗');
  });

  it('should return consistent icons', () => {
    // Verify same input gives same output
    expect(getStatusIcon('complete')).toBe(getStatusIcon('complete'));
    expect(getStatusIcon('active')).toBe(getStatusIcon('active'));
    expect(getStatusIcon('pending')).toBe(getStatusIcon('pending'));
    expect(getStatusIcon('failed')).toBe(getStatusIcon('failed'));
  });
});

describe('getDecisionIcon', () => {
  it('should return checkmark for verified decision', () => {
    expect(getDecisionIcon('verified')).toBe('✓');
  });

  it('should return warning for review decision', () => {
    expect(getDecisionIcon('review')).toBe('⚠');
  });

  it('should return cross for rejected decision', () => {
    expect(getDecisionIcon('rejected')).toBe('✗');
  });

  it('should match customer verification statuses', () => {
    // These icons should map to typical customer verification flows
    const verifiedIcon = getDecisionIcon('verified');
    const reviewIcon = getDecisionIcon('review');
    const rejectedIcon = getDecisionIcon('rejected');

    expect(verifiedIcon).not.toBe(reviewIcon);
    expect(verifiedIcon).not.toBe(rejectedIcon);
    expect(reviewIcon).not.toBe(rejectedIcon);
  });
});

describe('getChargeStatusIconType', () => {
  it('should return plus for created status', () => {
    expect(getChargeStatusIconType('created')).toBe('plus');
  });

  it('should return calendar for scheduled status', () => {
    expect(getChargeStatusIconType('scheduled')).toBe('calendar');
  });

  it('should return hourglass for pending status', () => {
    expect(getChargeStatusIconType('pending')).toBe('hourglass');
  });

  it('should return dollar for paid status', () => {
    expect(getChargeStatusIconType('paid')).toBe('dollar');
  });

  it('should return cross for failed status', () => {
    expect(getChargeStatusIconType('failed')).toBe('cross');
  });

  it('should return cross for cancelled status', () => {
    expect(getChargeStatusIconType('cancelled')).toBe('cross');
  });

  it('should return hourglass for unknown status', () => {
    expect(getChargeStatusIconType('unknown')).toBe('hourglass');
    expect(getChargeStatusIconType('processing')).toBe('hourglass');
    expect(getChargeStatusIconType('')).toBe('hourglass');
  });

  it('should handle all charge lifecycle statuses', () => {
    const chargeStatuses = [
      'created',
      'scheduled',
      'pending',
      'paid',
      'failed',
      'cancelled',
    ];

    chargeStatuses.forEach((status) => {
      const iconType = getChargeStatusIconType(status);
      expect(['plus', 'calendar', 'hourglass', 'dollar', 'cross']).toContain(iconType);
    });
  });

  it('should map to react-icons compatible types', () => {
    // These types should correspond to actual react-icons
    const validTypes = ['plus', 'calendar', 'hourglass', 'dollar', 'cross'];

    const iconType = getChargeStatusIconType('paid');
    expect(validTypes).toContain(iconType);
  });
});

describe('Icon consistency', () => {
  it('should use same icon for complete and verified', () => {
    expect(getStatusIcon('complete')).toBe(getDecisionIcon('verified'));
  });

  it('should use same icon for failed and rejected', () => {
    expect(getStatusIcon('failed')).toBe(getDecisionIcon('rejected'));
  });

  it('should use same icon for pending status and low risk', () => {
    expect(getStatusIcon('pending')).toBe(getRiskIcon(0));
  });

  it('should use different icons for different risk levels', () => {
    const lowRisk = getRiskIcon(0);
    const mediumRisk = getRiskIcon(0.3);
    const highRisk = getRiskIcon(0.8);

    expect(lowRisk).not.toBe(mediumRisk);
    expect(lowRisk).not.toBe(highRisk);
    expect(mediumRisk).not.toBe(highRisk);
  });
});
