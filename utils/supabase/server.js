import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(reqCookies = null) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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