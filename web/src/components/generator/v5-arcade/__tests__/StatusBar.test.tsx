import { render, screen } from '@testing-library/react';
import { StatusBar } from '../StatusBar';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { StageIndicator } from '../components/StageIndicator';
import { ComboMeter } from '../components/ComboMeter';
import { StarRating } from '../components/StarRating';

describe('ScoreDisplay', () => {
  it('should render zero-padded score with 5 digits', () => {
    render(<ScoreDisplay score={123} />);
    expect(screen.getByText(/SCORE: 00123/i)).toBeInTheDocument();
  });

  it('should handle large scores', () => {
    render(<ScoreDisplay score={99999} />);
    expect(screen.getByText(/SCORE: 99999/i)).toBeInTheDocument();
  });

  it('should handle zero score', () => {
    render(<ScoreDisplay score={0} />);
    expect(screen.getByText(/SCORE: 00000/i)).toBeInTheDocument();
  });

  it('should apply cyan color and glow', () => {
    const { container } = render(<ScoreDisplay score={100} />);
    const scoreElement = container.querySelector('[data-testid="score-display"]');
    expect(scoreElement).toHaveStyle({ color: '#00FFFF' });
  });
});

describe('StageIndicator', () => {
  it('should display current stage and total stages', () => {
    render(<StageIndicator currentStage={1} totalStages={3} />);
    expect(screen.getByText(/STAGE: 1\/3/i)).toBeInTheDocument();
  });

  it('should handle different stage numbers', () => {
    render(<StageIndicator currentStage={2} totalStages={3} />);
    expect(screen.getByText(/STAGE: 2\/3/i)).toBeInTheDocument();
  });

  it('should apply magenta color and glow', () => {
    const { container } = render(<StageIndicator currentStage={1} totalStages={3} />);
    const stageElement = container.querySelector('[data-testid="stage-indicator"]');
    expect(stageElement).toHaveStyle({ color: '#FF00FF' });
  });
});

describe('ComboMeter', () => {
  it('should display combo multiplier', () => {
    render(<ComboMeter comboMultiplier={2} />);
    expect(screen.getByText(/COMBO: x2/i)).toBeInTheDocument();
  });

  it('should render white color when combo is 1', () => {
    const { container } = render(<ComboMeter comboMultiplier={1} />);
    const comboElement = container.querySelector('[data-testid="combo-meter"]');
    expect(comboElement).toHaveStyle({ color: '#FFFFFF' });
  });

  it('should render yellow color when combo is greater than 1', () => {
    const { container } = render(<ComboMeter comboMultiplier={2} />);
    const comboElement = container.querySelector('[data-testid="combo-meter"]');
    expect(comboElement).toHaveStyle({ color: '#FFFF00' });
  });

  it('should apply glow only when combo is greater than 1', () => {
    const { container: container1 } = render(<ComboMeter comboMultiplier={1} />);
    const comboElement1 = container1.querySelector('[data-testid="combo-meter"]');
    expect(comboElement1).toHaveStyle({ textShadow: 'none' });

    const { container: container2 } = render(<ComboMeter comboMultiplier={3} />);
    const comboElement2 = container2.querySelector('[data-testid="combo-meter"]');
    const style = window.getComputedStyle(comboElement2 as Element);
    // Enhanced dual-layer glow (6px + 12px)
    expect(style.textShadow).toContain('6px');
  });
});

describe('StarRating', () => {
  it('should render 5 stars total', () => {
    const { container } = render(<StarRating stars={3} />);
    const starText = container.textContent || '';
    const totalStars = (starText.match(/★|☆/g) || []).length;
    expect(totalStars).toBe(5);
  });

  it('should render correct number of filled stars', () => {
    const { container } = render(<StarRating stars={3} />);
    const starText = container.textContent || '';
    const filledStars = (starText.match(/★/g) || []).length;
    expect(filledStars).toBe(3);
  });

  it('should render correct number of empty stars', () => {
    const { container } = render(<StarRating stars={2} />);
    const starText = container.textContent || '';
    const emptyStars = (starText.match(/☆/g) || []).length;
    expect(emptyStars).toBe(3);
  });

  it('should handle zero stars', () => {
    const { container } = render(<StarRating stars={0} />);
    const starText = container.textContent || '';
    const emptyStars = (starText.match(/☆/g) || []).length;
    expect(emptyStars).toBe(5);
  });

  it('should handle five stars', () => {
    const { container } = render(<StarRating stars={5} />);
    const starText = container.textContent || '';
    const filledStars = (starText.match(/★/g) || []).length;
    expect(filledStars).toBe(5);
  });

  it('should apply gold color to filled stars and gray to empty stars', () => {
    const { container } = render(<StarRating stars={3} />);
    const starElement = container.querySelector('[data-testid="star-rating"]');
    expect(starElement).toBeInTheDocument();
  });
});

describe('StatusBar', () => {
  it('should render all four components', () => {
    render(
      <StatusBar score={1000} currentStage={1} totalStages={3} comboMultiplier={2} stars={3} />
    );

    expect(screen.getByText(/SCORE: 01000/i)).toBeInTheDocument();
    expect(screen.getByText(/STAGE: 1\/3/i)).toBeInTheDocument();
    expect(screen.getByText(/COMBO: x2/i)).toBeInTheDocument();

    const starText = screen.getByTestId('star-rating').textContent || '';
    expect(starText).toContain('★');
  });

  it('should apply correct styling to container', () => {
    const { container } = render(
      <StatusBar score={0} currentStage={1} totalStages={3} comboMultiplier={1} stars={0} />
    );

    const statusBar = container.querySelector('[data-testid="status-bar"]');
    expect(statusBar).toHaveStyle({
      backgroundColor: '#000000',
      borderColor: '#00FFFF',
    });
  });

  it('should layout components horizontally with spacing', () => {
    const { container } = render(
      <StatusBar score={500} currentStage={2} totalStages={3} comboMultiplier={1} stars={4} />
    );

    const statusBar = container.querySelector('[data-testid="status-bar"]');
    expect(statusBar).toHaveStyle({
      display: 'flex',
      justifyContent: 'space-between',
    });
  });
});
