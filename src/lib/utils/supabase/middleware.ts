// src/lib/utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // The response is already created, just modify its cookies
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // The response is already created, just modify its cookies
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}