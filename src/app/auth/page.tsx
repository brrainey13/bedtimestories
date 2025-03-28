// src/app/auth/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // Assuming you have Input component
import { Label } from '@/components/ui/label'   // Assuming you have Label component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/AuthProvider' // Use the new hook

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const { supabase } = useAuth() // Get supabase client from context
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return; // Guard clause

    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Optional: email redirect URL after confirmation
         emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the confirmation link!')
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return; // Guard clause

    setError(null)
    setMessage(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // Redirect to dashboard or home on successful sign in
      router.push('/dashboard') // Or '/' or '/create' etc.
      router.refresh(); // Force refresh to ensure server components update
    }
    setLoading(false)
  }

   const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Need a callback route
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Supabase handles the redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login / Sign Up</CardTitle>
          <CardDescription>
            Enter your email and password below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}
          <form className="grid gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                  />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                  <Button onClick={handleSignIn} className="w-full" disabled={loading || !email || password.length < 6}>
                      {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                  <Button onClick={handleSignUp} variant="outline" className="w-full" disabled={loading || !email || password.length < 6}>
                      {loading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
              </div>
           </form>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
            >
                {/* Add Google Icon if you have one */}
                Google
            </Button>
        </CardContent>
        {/* <CardFooter>
          Optional footer content
        </CardFooter> */}
      </Card>
    </div>
  )
}