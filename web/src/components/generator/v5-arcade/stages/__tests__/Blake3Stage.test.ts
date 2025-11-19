import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Blake3Stage } from '../Blake3Stage';

describe('Blake3Stage', () => {
  let stage: Blake3Stage;
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
    stage = new Blake3Stage();
  });

  it('should initialize', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: {
        customerName: 'TEST',
        accountLast4: '1234',
      },
      playSound: vi.fn(),
    };

    stage.start(context);
    expect(stage.name).toBe('BLAKE3');
    expect(stage.isComplete).toBe(false);
  });

  it('should render hex stream during middle phase', () => {
    const context = {
      spriteEngine: mockSpriteEngine,
      width: 640,
      height: 480,
      data: { customerName: 'TEST' },
      playSound: vi.fn(),
    };

    stage.start(context);
    stage.update(2.5, 2.5);
    stage.render(mockCtx);

    expect(mockSpriteEngine.drawText).toHaveBeenCalled();
  });
});
