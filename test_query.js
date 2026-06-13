import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

loadEnvConfig(process.cwd())

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPoints() {
  console.log('Fetching predictions for finished matches where points are NULL...')
  
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select(`
      id,
      predicted_home,
      predicted_away,
      points_awarded,
      matches!inner (
        home_team,
        away_team,
        home_score,
        away_score,
        status
      ),
      profiles (
        username
      )
    `)
    .is('points_awarded', null)
    .eq('matches.status', 'finished')

  if (error) {
    console.error('Error fetching predictions:', error)
    return
  }

  if (!predictions || predictions.length === 0) {
    console.log('No unscored predictions found for finished matches. All finished matches are properly scored!')
    return
  }

  console.log(`Found ${predictions.length} unscored prediction(s) for finished matches:\n`)

  predictions.forEach((pred, index) => {
    const match = pred.matches || {}
    const profile = pred.profiles || {}
    
    console.log(`[${index + 1}] User: ${profile.username || 'Unknown'}`)
    console.log(`    Match: ${match.home_team} vs ${match.away_team} (Status: ${match.status})`)
    console.log(`    Actual Score: ${match.home_score} - ${match.away_score}`)
    console.log(`    Predicted Score: ${pred.predicted_home} - ${pred.predicted_away}`)
    console.log(`    Points Awarded: ${pred.points_awarded}`)
    console.log('----------------------------------------------------')
  })
}

checkPoints()
