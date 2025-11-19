import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MintingStage } from '../MintingStage';

describe('MintingStage', () => {
  let stage: MintingStage;
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
    stage = new MintingStage();
  });

  it('should initialize', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { paykeyToken: 'TOKEN' },
      playSound: vi.fn(),
    };

    stage.start(context);
    expect(stage.name).toBe('MINTING');
    expect(stage.isComplete).toBe(false);
  });

  it('should render coin during minting phase', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { paykeyToken: 'TOKEN' },
      playSound: vi.fn(),
    };

    stage.start(context);
    stage.update(1.5, 1.5);
    stage.render(mockCtx);

    expect(mockSpriteEngine.drawCircle).toHaveBeenCalled();
  });
});
