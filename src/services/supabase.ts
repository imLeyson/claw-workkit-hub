import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ptzudoptwfldycersdax.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0enVkb3B0d2ZsZHljZXJzZGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDk3ODcsImV4cCI6MjA5NjQ4NTc4N30.0jtLN4bkCm5rRc9Stx8ILWVXSaOIF4n3f-t8OO76UqM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
