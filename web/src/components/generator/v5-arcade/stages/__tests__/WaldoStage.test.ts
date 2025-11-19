import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaldoStage } from '../WaldoStage';

describe('WaldoStage', () => {
  let stage: WaldoStage;
  let mockSpriteEngine: any;
  let mockCtx: any;

  beforeEach(() => {
    mockSpriteEngine = {
      drawText: vi.fn(),
      drawRect: vi.fn(),
      drawCircle: vi.fn(),
      drawLine: vi.fn(),
    };

    mockCtx = {};

    stage = new WaldoStage();
  });

  it('should initialize with customer name', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { customerName: 'TEST USER' },
      playSound: vi.fn(),
    };

    stage.start(context);

    expect(stage.name).toBe('WALDO');
    expect(stage.isComplete).toBe(false);
  });

  it('should render name during typewriter phase', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { customerName: 'TEST USER' },
      playSound: vi.fn(),
    };

    stage.start(context);

    // Update a bit to type some letters
    stage.update(0.5, 0.5);

    stage.render(mockCtx);

    expect(mockSpriteEngine.drawText).toHaveBeenCalled();
    const args = mockSpriteEngine.drawText.mock.calls[0];
    // Should verify it's drawing part of the name
    expect(args[0].length).toBeGreaterThan(0);
  });

  it('should complete after duration', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { customerName: 'TEST USER' },
      playSound: vi.fn(),
    };

    stage.start(context);

    // Update past duration (4s)
    stage.update(5.0, 5.0);

    expect(stage.isComplete).toBe(true);
  });
});
