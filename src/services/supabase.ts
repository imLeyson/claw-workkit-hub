import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const enableSupabase = import.meta.env.VITE_ENABLE_SUPABASE === 'true'

export const isSupabaseConfigured = Boolean(enableSupabase && url && key)

function createNoopQuery() {
  const result = { data: null, error: null }
  const query: any = {
    select: () => query,
    insert: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    then: (onFulfilled?: (value: typeof result) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
    catch: (onRejected?: (reason: unknown) => unknown) => Promise.resolve(result).catch(onRejected),
  }
  return query
}

const noopSupabase = {
  from: () => createNoopQuery(),
  auth: {
    signUp: async () => ({ data: null, error: new Error('Supabase 未配置，当前为本地 Demo 模式') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase 未配置，当前为本地 Demo 模式') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
}

export const supabase = isSupabaseConfigured ? createClient(url, key) : noopSupabase
