# Testing Guide

This project maintains a robust testing pyramid to ensure high code quality and reliability.

## 1. Unit & Component Testing

We use **Vitest** and **React Testing Library** for fast, reliable unit and component tests.

- **Run Tests**: `npm run test`
- **Run Coverage**: `npm run test:coverage` (Target: 90%+)

**Guidelines:**
- Place component tests alongside the component or in `__tests__/components/`.
- Ensure all interactive elements have proper `aria-` attributes so they can be easily queried using `getByRole`.
- Mock external services (like Gemini or Supabase) using `vi.mock()`.

## 2. End-to-End Testing

We use **Playwright** for end-to-end user flows, primarily verifying authentication and navigation.

- **Run E2E Tests**: `npm run test:e2e`

**Guidelines:**
- Tests live in `__tests__/e2e/`.
- Use Playwright's network interception if you need to mock Supabase authentication in CI.
- Focus on critical paths: Login, Check-in, Roleplay.

## 3. Static Analysis

We enforce code quality through ESLint and TypeScript.

- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check`

Zero warnings are expected before merging into the main branch.
