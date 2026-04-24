import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error(
      'getSupabaseBrowserClient 는 브라우저(Client Component)에서만 호출 가능합니다. 서버 경계에서는 lib/supabase/server.ts 의 createSupabaseServerClient 를 쓰세요.',
    );
  }
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return cached;
}
