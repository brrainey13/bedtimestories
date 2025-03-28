// src/components/providers/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client' // Use the browser client
import type { SupabaseClient, Session } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient | null
  session: Session | null
  isLoading: boolean
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient() // Initialize browser client instance
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth State Change:', event, session); // Debug log
      setSession(session)
      setIsLoading(false)
    })

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial Session Check:', session); // Debug log
      setSession(session);
      setIsLoading(false);
    });


    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase]) // Add supabase as dependency

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoading }}>
      {/* Render children only after loading is complete to avoid flashes */}
      {!isLoading ? children : null /* Or a loading spinner */}
    </SupabaseContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  // Make supabase client easily available if needed in components
  return context
}