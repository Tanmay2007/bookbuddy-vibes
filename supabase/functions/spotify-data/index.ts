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

    // Get user's Spotify token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('user_spotify_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Spotify not connected')
    }

    let accessToken = tokenData.access_token

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
        
        accessToken = refreshData.access_token
      } else {
        throw new Error('Failed to refresh Spotify token')
      }
    }

    if (action === 'get_playlists') {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch playlists')
      }

      const playlistsData = await response.json()
      
      // Store playlists in database
      for (const playlist of playlistsData.items) {
        await supabaseClient
          .from('user_playlists')
          .upsert({
            user_id: user.id,
            spotify_playlist_id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            track_count: playlist.tracks.total,
            image_url: playlist.images?.[0]?.url,
            spotify_data: playlist
          })
      }

      return new Response(
        JSON.stringify({ playlists: playlistsData.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_top_tracks') {
      const { time_range = 'medium_term' } = await req.json()
      
      const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch top tracks')
      }

      const topTracks = await response.json()

      return new Response(
        JSON.stringify({ tracks: topTracks.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_top_artists') {
      const { time_range = 'medium_term' } = await req.json()
      
      const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch top artists')
      }

      const topArtists = await response.json()

      return new Response(
        JSON.stringify({ artists: topArtists.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_recently_played') {
      const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recently played')
      }

      const recentlyPlayed = await response.json()

      return new Response(
        JSON.stringify({ tracks: recentlyPlayed.items }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Spotify data error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})