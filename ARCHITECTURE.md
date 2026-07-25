# Undertow AI Recovery Platform

## Architecture Overview

Undertow is a Next.js (App Router) based application designed for addiction recovery support using AI. It relies heavily on serverless paradigms, secure authentication, and edge AI processing.

### Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **State Management**: React Context, React Hook Form
- **Data & Auth**: Supabase (PostgreSQL, RLS, Auth)
- **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash)
- **Testing**: Vitest (Unit/Integration), Playwright (E2E), React Testing Library

### Directory Structure

- `/app`: Next.js App Router endpoints, server actions, and layout components.
- `/components`: Reusable UI components (e.g., `StressMeter`, `CrisisOverlay`).
- `/hooks`: Custom React hooks for browser APIs (audio, speech).
- `/lib`: Shared utilities, rate-limiting, and Supabase client initializers.
- `/services`: Core business logic wrapping the Gemini API.
- `/supabase`: SQL schema and configurations.
- `/__tests__`: Comprehensive test suites.

### Security Model

- **Authentication**: Managed via `@supabase/auth-helpers-nextjs` using cookies.
- **Data Protection**: Supabase Row Level Security (RLS) policies restrict all sensitive tables (e.g., `voice_sessions`, `user_memory`) to the authenticated user.
- **Rate Limiting**: Database-backed rate limiting ensures that users cannot spam the Gemini API endpoints, preventing abuse and quota exhaustion.
- **CSP**: Content Security Policy is strictly enforced via `middleware.ts`.
