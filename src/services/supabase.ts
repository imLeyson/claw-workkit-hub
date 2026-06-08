// Supabase client — ready when API key is available
// Current mode: localStorage (via db.ts)
// To switch: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars

const SUPABASE_URL = 'https://ptzudoptwfldycersdax.supabase.co'
// Anon key needed — get from Supabase Dashboard → Settings → API
const SUPABASE_ANON_KEY = ''

export function isSupabaseReady(): boolean {
  return !!SUPABASE_ANON_KEY
}

export function getSupabaseConfig() {
  return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY }
}
