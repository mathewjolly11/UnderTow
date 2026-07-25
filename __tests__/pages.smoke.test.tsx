import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../app/page';

// Mock Next.js navigation & auth
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
  }),
}));

describe('Page Smoke Tests', () => {
  it('renders LandingPage without crashing', () => {
    render(<LandingPage />);
    expect(screen.getByText(/Introducing Undertow AI Recovery Companion/i)).toBeDefined();
  });
});
