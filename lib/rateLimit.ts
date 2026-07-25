import { createClientServer } from '@/lib/supabase/server';

export async function checkRateLimit(endpoint: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const supabase = await createClientServer();
  const { data: { user } } = await supabase.auth.getUser();
  const identifier = user?.id || 'anonymous';

  // We query the rate_limits table for the user and endpoint.
  // If it doesn't exist, we insert it.
  // If it exists, we check the window_start.
  
  // Note: For a robust serverless setup, this should ideally be handled by Redis/KV
  // or a Supabase RPC to avoid race conditions. We're using a basic table approach here.

  const now = new Date();
  const { data: record, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', identifier)
    .eq('endpoint', endpoint)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Other error, just allow to avoid blocking legitimate users on DB issues
    console.error('Rate limit fetch error:', fetchError);
    return true;
  }

  if (!record) {
    // Insert new record
    await supabase.from('rate_limits').insert({
      user_id: identifier === 'anonymous' ? null : identifier, // Might need proper anonymous handling
      endpoint,
      request_count: 1,
      window_start: now.toISOString(),
    });
    return true;
  }

  const windowStart = new Date(record.window_start).getTime();
  if (now.getTime() - windowStart > windowMs) {
    // Reset window
    await supabase.from('rate_limits').update({
      request_count: 1,
      window_start: now.toISOString(),
    }).eq('id', record.id);
    return true;
  }

  if (record.request_count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment
  await supabase.from('rate_limits').update({
    request_count: record.request_count + 1,
  }).eq('id', record.id);

  return true;
}
