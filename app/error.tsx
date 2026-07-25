'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, this would be logged to Sentry/Datadog
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl border border-[#27272A] text-center max-w-md w-full space-y-6">
        <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
          <p className="text-zinc-400 text-sm">
            We&apos;ve encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 bg-[#18181B] border border-[#27272A] hover:bg-[#27272A] text-zinc-300 rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
