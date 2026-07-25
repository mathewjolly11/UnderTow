import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StressMeter } from '@/components/StressMeter';

describe('StressMeter Component', () => {
  const mockMetrics = {
    speechRate: 140,
    volume: 55,
    pauseCount: 2,
    duration: 30,
    stressState: 'Calm' as const,
    stressScore: 15,
  };

  it('renders without crashing', () => {
    render(<StressMeter metrics={mockMetrics} />);
    expect(screen.getByText('Vocal Stress Evaluation')).toBeInTheDocument();
  });

  it('displays the correct stress state and score', () => {
    render(<StressMeter metrics={mockMetrics} />);
    expect(screen.getByText(/Calm Stress State/)).toBeInTheDocument();
    expect(screen.getByText('Score: 15/100')).toBeInTheDocument();
  });

  it('renders all four acoustic metrics', () => {
    render(<StressMeter metrics={mockMetrics} />);
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('has accessible ARIA attributes for the progress bar', () => {
    render(<StressMeter metrics={mockMetrics} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '15');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies correct styling for Acute state', () => {
    const acuteMetrics = { ...mockMetrics, stressState: 'Acute' as const, stressScore: 90 };
    render(<StressMeter metrics={acuteMetrics} />);
    expect(screen.getByText(/Acute Stress State/)).toHaveClass('text-red-400');
  });
});
