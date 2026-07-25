import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  // 1. Generate a secure random nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // 2. Add the nonce to the request headers so Next.js can read it and automatically
  // apply it to injected scripts.
  request.headers.set('x-nonce', nonce);

  // 3. Let Supabase process the authentication session using the modified request.
  const response = await updateSession(request);

  // 4. Construct the strict Content-Security-Policy
  const isDev = process.env.NODE_ENV !== 'production';
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com;
    frame-src 'self' https://*.supabase.co https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `;

  // Clean up formatting
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 5. Apply the CSP header to the final response
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
