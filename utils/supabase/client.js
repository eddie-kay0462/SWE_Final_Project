/**
 * Supabase Browser Client
 * 
 * <p>Creates and configures a Supabase client for client-side operations
 * in browser environments.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}