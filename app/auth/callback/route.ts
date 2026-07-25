import { redirect } from 'next/navigation';
import { createClientServer } from '@/lib/supabase/server';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (code) {
    const supabase = await createClientServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect('/dashboard');
}
