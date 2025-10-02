import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { config } from '@/config/environment'

const supabase = createClient(config.supabase.url, config.supabase.anonKey)

export interface Profile {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function getProfile() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw userError
        }

        if (!user) {
          if (mounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (mounted) {
          setProfile(profileData)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getProfile()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        getProfile()
      } else if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      }
    })

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProfile(payload.new as Profile)
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      subscription.unsubscribe()
      profileSubscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}

export default useProfile
