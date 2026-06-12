/**
 * One-time Initial Match Sync Script
 * 
 * This script bypasses the "urgent matches" check to perform an initial
 * population of the matches table. Run this once to seed the database.
 * 
 * Usage:
 *   npx tsx scripts/initial-sync.ts
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { fetchMatches } from '@/lib/football-api'
import { parseMatches } from '@/lib/parsers/match-parser'

async function initialSync() {
  console.log('🚀 Starting initial match sync...')
  
  try {
    // Fetch matches from API
    console.log('📡 Fetching matches from football-data.org API...')
    const apiResponse = await fetchMatches('2026')
    console.log(`✅ Fetched ${apiResponse.matches.length} matches`)

    // Parse matches
    console.log('🔄 Parsing matches...')
    const parsedMatches = parseMatches(apiResponse.matches)
    console.log(`✅ Parsed ${parsedMatches.length} valid matches`)

    if (parsedMatches.length === 0) {
      console.error('❌ No valid matches to sync')
      process.exit(1)
    }

    // Insert into database
    console.log('💾 Inserting matches into database...')
    const serviceSupabase = createServiceRoleClient()
    const now = new Date().toISOString()

    const { error, count } = await (serviceSupabase
      .from('matches') as any)
      .upsert(
        parsedMatches.map(match => ({
          ...match,
          api_last_polled_at: now,
          updated_at: now,
        })),
        {
          onConflict: 'external_id',
          ignoreDuplicates: false,
        }
      )

    if (error) {
      console.error('❌ Error inserting matches:', error)
      process.exit(1)
    }

    console.log(`✅ Successfully synced ${parsedMatches.length} matches!`)
    console.log('\n🎉 Initial sync complete!')
    console.log('You can now view matches at: http://localhost:3000/public-matches')
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    process.exit(1)
  }
}

// Run the sync
initialSync()
