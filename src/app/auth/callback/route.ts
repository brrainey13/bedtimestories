// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr' // Use createServerClient
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies() // Await the promise here
    // Initialize server client for route handler
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { 
          // Pass cookie methods directly using the awaited cookieStore
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { 
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          }
        } 
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // Redirect to the dashboard or a protected route after successful OAuth
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`) 
}