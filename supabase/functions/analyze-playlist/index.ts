import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PlaylistTrack {
  name: string;
  artist: string;
  album?: string;
  genre?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { playlistName, tracks } = await req.json()

    if (!playlistName || !tracks || !Array.isArray(tracks)) {
      throw new Error('Invalid playlist data')
    }

    // Simple genre detection based on artist names and track titles
    const genreKeywords = {
      'Rock': ['rock', 'metal', 'punk', 'grunge', 'alternative'],
      'Pop': ['pop', 'mainstream', 'chart', 'hit'],
      'Hip Hop': ['rap', 'hip hop', 'trap', 'drill'],
      'Electronic': ['electronic', 'edm', 'techno', 'house', 'synth'],
      'Jazz': ['jazz', 'blues', 'swing', 'bebop'],
      'Classical': ['classical', 'symphony', 'orchestra', 'concerto'],
      'Country': ['country', 'folk', 'americana', 'bluegrass'],
      'R&B': ['r&b', 'soul', 'motown', 'funk'],
      'Indie': ['indie', 'independent', 'underground'],
      'Alternative': ['alternative', 'alt', 'experimental']
    }

    const moodKeywords = {
      'Energetic': ['energy', 'pump', 'power', 'dynamic', 'electric'],
      'Melancholic': ['sad', 'melancholy', 'blue', 'tears', 'lonely'],
      'Romantic': ['love', 'heart', 'romance', 'kiss', 'together'],
      'Rebellious': ['rebel', 'fight', 'revolution', 'break', 'wild'],
      'Peaceful': ['peace', 'calm', 'quiet', 'gentle', 'soft'],
      'Nostalgic': ['memory', 'remember', 'past', 'yesterday', 'time']
    }

    // Analyze genres
    const genreCounts: { [key: string]: number } = {}
    const detectedMoods: Set<string> = new Set()

    for (const track of tracks) {
      const searchText = `${track.name} ${track.artist}`.toLowerCase()
      
      // Detect genres
      for (const [genre, keywords] of Object.entries(genreKeywords)) {
        if (keywords.some(keyword => searchText.includes(keyword))) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1
        }
      }

      // Detect moods
      for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(keyword => searchText.includes(keyword))) {
          detectedMoods.add(mood)
        }
      }
    }

    // If no genres detected, add some generic ones based on common patterns
    if (Object.keys(genreCounts).length === 0) {
      genreCounts['Pop'] = Math.floor(tracks.length * 0.4)
      genreCounts['Rock'] = Math.floor(tracks.length * 0.3)
      genreCounts['Alternative'] = Math.floor(tracks.length * 0.3)
    }

    // Generate book recommendations based on genres and moods
    const bookRecommendations = generateBookRecommendations(genreCounts, Array.from(detectedMoods))

    const analysis = {
      genres: genreCounts,
      moods: Array.from(detectedMoods),
      bookRecommendations
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Playlist analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateBookRecommendations(genres: { [key: string]: number }, moods: string[]) {
  const recommendations = []

  // Book recommendations based on dominant genres
  const topGenres = Object.entries(genres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genre)

  const genreToBooks: { [key: string]: any[] } = {
    'Rock': [
      {
        title: "High Fidelity",
        author: "Nick Hornby",
        reason: "A perfect match for rock music lovers - follows a record store owner obsessed with music and relationships.",
        genre: "Contemporary Fiction"
      },
      {
        title: "Just Kids",
        author: "Patti Smith",
        reason: "A memoir about the punk rock scene and artistic rebellion in New York.",
        genre: "Memoir"
      }
    ],
    'Pop': [
      {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        reason: "Glamorous, dramatic, and captivating - just like pop music's biggest hits.",
        genre: "Contemporary Fiction"
      },
      {
        title: "Daisy Jones & The Six",
        author: "Taylor Jenkins Reid",
        reason: "About a fictional 70s rock band - captures the drama and passion of the music world.",
        genre: "Historical Fiction"
      }
    ],
    'Hip Hop': [
      {
        title: "The Hate U Give",
        author: "Angie Thomas",
        reason: "Powerful storytelling that addresses social issues, matching hip hop's lyrical depth.",
        genre: "Young Adult"
      },
      {
        title: "Born a Crime",
        author: "Trevor Noah",
        reason: "Sharp wit and social commentary, similar to the best hip hop narratives.",
        genre: "Memoir"
      }
    ],
    'Electronic': [
      {
        title: "Neuromancer",
        author: "William Gibson",
        reason: "Cyberpunk classic that matches the futuristic, synthetic feel of electronic music.",
        genre: "Science Fiction"
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        reason: "Explores AI and technology with the same precision as electronic music production.",
        genre: "Literary Fiction"
      }
    ],
    'Jazz': [
      {
        title: "Jazz",
        author: "Toni Morrison",
        reason: "A novel that captures the rhythm and improvisation of jazz music in its narrative style.",
        genre: "Literary Fiction"
      },
      {
        title: "The Paris Wife",
        author: "Paula McLain",
        reason: "Set in 1920s Paris during the jazz age, following Hemingway's first wife.",
        genre: "Historical Fiction"
      }
    ],
    'Classical': [
      {
        title: "The Goldfinch",
        author: "Donna Tartt",
        reason: "Epic, complex, and beautifully composed - like a classical symphony in novel form.",
        genre: "Literary Fiction"
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        reason: "Timeless, elegant storytelling that matches classical music's enduring beauty.",
        genre: "Historical Fiction"
      }
    ],
    'Alternative': [
      {
        title: "Norwegian Wood",
        author: "Haruki Murakami",
        reason: "Unconventional narrative style that matches alternative music's experimental nature.",
        genre: "Literary Fiction"
      },
      {
        title: "The Perks of Being a Wallflower",
        author: "Stephen Chbosky",
        reason: "Coming-of-age story with the same introspective quality as alternative music.",
        genre: "Young Adult"
      }
    ]
  }

  // Add recommendations based on top genres
  for (const genre of topGenres) {
    if (genreToBooks[genre]) {
      recommendations.push(...genreToBooks[genre].slice(0, 2))
    }
  }

  // If we don't have enough recommendations, add some general ones
  if (recommendations.length < 3) {
    recommendations.push(
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        reason: "A philosophical novel about life's possibilities - perfect for any music lover seeking meaning.",
        genre: "Contemporary Fiction"
      },
      {
        title: "Circe",
        author: "Madeline Miller",
        reason: "Lyrical and powerful storytelling that resonates like your favorite songs.",
        genre: "Mythology"
      }
    )
  }

  return recommendations.slice(0, 4)
}