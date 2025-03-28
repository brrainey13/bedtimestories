// src/utils/supabase/middleware.ts (or wherever you placed it)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Define functions for reading, setting, and removing cookies
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is set, update the request and response cookies
            request.cookies.set({ name, value, ...options }) // Update request for current processing
            response = NextResponse.next({ // Create new response to attach updated cookies
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options }) // Set cookie on the response
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the request and response cookies
            request.cookies.set({ name, value: '', ...options }) // Update request for current processing
            response = NextResponse.next({ // Create new response to attach updated cookies
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value: '', ...options }) // Set expired cookie on the response
          },
        },
      }
    )

    // Refresh session if expired - REQUIRED FOR SERVER COMPONENTS
    const { data: { user } } = await supabase.auth.getUser()

    // --- Your Route Protection Logic (Example) ---
    const publicPaths = ['/auth', '/about', '/pricing']; // Add any other public paths
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path)) || request.nextUrl.pathname === '/';

    // If trying to access a protected route without a user, redirect to /auth
    if (!user && !isPublicPath && !request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/_next')) { // Adjust conditions as needed
       console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname} to /auth`);
       return NextResponse.redirect(new URL('/auth', request.url))
    }

    // If the user is logged in and tries to access the /auth page, redirect them to dashboard
    if (user && request.nextUrl.pathname.startsWith('/auth')) {
      console.log(`Redirecting authenticated user from /auth to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // --- End Route Protection Logic ---


    return response

  } catch (e) {
     console.error("Error in Supabase middleware:", e);
    // If a Supabase client fails to be created, continue without session refresh
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}