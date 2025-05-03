'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/utils/supabase/client'; // Use client-side Supabase client
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function ProfilePage() {
    const { session } = useAuth();
    const [profile, setProfile] = useState<{ username: string; age: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) {
                setLoading(false);
                setError("You must be logged in to view your profile.");
                return;
            }

            setLoading(true);
            setError(null);
            const supabase = createClient();

            try {
                const { data, error: fetchError } = await supabase
                    .from('profiles') // Assuming a 'profiles' table exists
                    .select('username, age')
                    .eq('id', session.user.id)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                setProfile(data);
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                setError(err.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">View your personal information below.</p>

            {loading && (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            )}

            {error && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error Loading Profile</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!loading && !error && profile && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Welcome, {profile.username}!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">Age: {profile.age}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}