import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Handle Spotify OAuth callback (GET request with code and state parameters)
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      // Redirect to frontend with error
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/auth?error=${encodeURIComponent(error)}`
        }
      })
    }

    if (code && state) {
      // Redirect to frontend with code and state for processing
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/auth?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
        }
      })
    }

    // If no code or error, redirect to auth page
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.origin}/auth`
      }
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action } = await req.json()

    if (action === 'get_auth_url') {
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
      const redirectUri = `https://vqnnievbbegnztbiztlc.supabase.co/functions/v1/spotify-auth`
      
      const scope = [
        'user-read-private',
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-top-read',
        'user-read-recently-played'
      ].join(' ')

      const state = crypto.randomUUID()
      
      const authUrl = new URL('https://accounts.spotify.com/authorize')
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('scope', scope)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('state', state)

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString(), state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange_code') {
      const { code, state } = await req.json()
      
      const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
      const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
      const redirectUri = `https://vqnnievbbegnztbiztlc.supabase.co/functions/v1/spotify-auth`

      // Exchange code for tokens
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenResponse.ok) {
        throw new Error(`Spotify token exchange failed: ${tokenData.error}`)
      }

      // Get user profile from Spotify
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      const spotifyProfile = await profileResponse.json()

      // Store tokens in database
      const { error: tokenError } = await supabaseClient
        .from('user_spotify_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          spotify_user_id: spotifyProfile.id
        })

      if (tokenError) {
        console.error('Token storage error:', tokenError)
        throw new Error('Failed to store Spotify tokens')
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          profile: spotifyProfile
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_profile') {
      // Get stored token
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('user_spotify_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if token needs refresh
      const now = new Date()
      const expiresAt = new Date(tokenData.expires_at)
      
      if (now >= expiresAt) {
        // Refresh token
        const refreshResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${Deno.env.get('SPOTIFY_CLIENT_ID')}:${Deno.env.get('SPOTIFY_CLIENT_SECRET')}`)}`
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenData.refresh_token
          })
        })

        const refreshData = await refreshResponse.json()
        
        if (refreshResponse.ok) {
          // Update stored token
          await supabaseClient
            .from('user_spotify_tokens')
            .update({
              access_token: refreshData.access_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
            })
            .eq('user_id', user.id)
          
          tokenData.access_token = refreshData.access_token
        }
      }

      // Get current Spotify profile
      const profileResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      if (!profileResponse.ok) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const spotifyProfile = await profileResponse.json()

      return new Response(
        JSON.stringify({ 
          connected: true,
          profile: spotifyProfile
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'disconnect') {
      const { error } = await supabaseClient
        .from('user_spotify_tokens')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        throw new Error('Failed to disconnect Spotify')
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Spotify auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})