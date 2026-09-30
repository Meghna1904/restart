import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  /^https?:\/\/.+/i.test(supabaseUrl),
)

// main.tsx prevents requests until configuration is complete.
export const supabase = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl! : 'http://localhost',
  isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key',
)
