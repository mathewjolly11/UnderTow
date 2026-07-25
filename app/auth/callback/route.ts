import { redirect } from 'next/navigation';
import { createClientServer } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClientServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect('/dashboard');
}
