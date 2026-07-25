'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #333', borderRadius: '1rem', backgroundColor: '#111' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff4444' }}>Critical Error</h2>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>A fatal error occurred.</p>
            <button 
              onClick={() => reset()}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6366F1', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Recover Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
