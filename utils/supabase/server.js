/**
 * Supabase Server Client
 * 
 * <p>Creates and configures a Supabase client for server-side operations
 * using server components.</p>
 *
 * @author Nana Amoako
 * @version 1.0.0
 */
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side operations
 * 
 * @param {Object} reqCookies - Optional cookies object for API routes
 * @param {string} customKey - Optional custom key for admin operations
 * @returns {Object} Supabase client instance configured for server-side use
 */
export async function createClient(reqCookies = null, customKey = null) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    if (reqCookies) {
                        // For API routes
                        return reqCookies[name]
                    }
                    // For Server Components
                    const cookieStore = cookies()
                    return cookieStore.get(name)?.value
                },
                set(name, value, options) {
                    if (reqCookies) {
                        // For API routes
                        reqCookies[name] = value
                        return
                    }
                    // For Server Components
                    const cookieStore = cookies()
                    cookieStore.set(name, value, options)
                },
                remove(name, options) {
                    if (reqCookies) {
                        // For API routes
                        delete reqCookies[name]
                        return
                    }
                    // For Server Components
                    const cookieStore = cookies()
                    cookieStore.delete(name, options)
                },
            },
        }
    )
}