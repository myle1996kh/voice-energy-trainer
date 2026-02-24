import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      return;
    }

    // Ensure profile exists for anonymous/no-login flow
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          display_name: null,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (!insertError && inserted) {
      setProfile(inserted);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Subscribe to changes (sign-in/out, token refresh). We intentionally
    // do NOT mark loading as finished here to avoid a race where the initial
    // callback fires before getSession() resolves.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(() => fetchProfile(nextSession.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    (async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      let nextSession = initialSession;
      if (!nextSession) {
        const { data } = await supabase.auth.signInAnonymously();
        nextSession = data.session ?? null;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        await fetchProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const updateProfile = async (updates: { display_name?: string }) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          ...updates,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { data, error };
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session?.user,
    updateProfile,
    fetchProfile,
  };
}
