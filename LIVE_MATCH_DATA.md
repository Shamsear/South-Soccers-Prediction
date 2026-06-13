# Live Match Data Documentation

## Current Capabilities

### ✅ What the System Can Track

The application uses the **football-data.org API** which provides:

1. **Match Status**
   - `SCHEDULED` / `TIMED` - Match not started yet
   - `LIVE` / `IN_PLAY` / `PAUSED` - Match in progress
   - `FINISHED` - Match completed

2. **Live Scores**
   - Current score when match is LIVE
   - Half-time score
   - Full-time score
   - Extra time score (if applicable)
   - Penalty shootout score (if applicable)

3. **Match Updates**
   - Scores update when API is polled
   - Last updated timestamp
   - Winner indication

### ❌ What the System Cannot Track

The free tier of football-data.org API does **NOT** provide:

1. **Match Minute** ❌
   - No current minute (e.g., "70'")
   - No time remaining
   - No stoppage time information

2. **Live Events** ❌
   - No goal scorers
   - No yellow/red cards
   - No substitutions
   - No play-by-play commentary

3. **Advanced Stats** ❌
   - No possession percentage
   - No shots on target
   - No corners/fouls
   - No player statistics

## How Live Matches Are Currently Displayed

### Match Status Display

**File**: `components/match-fixture-card.tsx`, `components/live-match-banner.tsx`

```typescript
// Status shown to users:
if (match.status === 'live') {
  return <span className="...">🔴 LIVE</span>
}
```

**Current display:**
```
🔴 LIVE
Argentina 2 - 1 Brazil
```

**NOT available:**
```
🔴 LIVE (70')  ← Minute not available
Argentina 2 - 1 Brazil
```

### Score Updates

Scores are updated when:
1. Admin manually syncs matches
2. Auto-sync runs (if enabled)
3. Force sync button is clicked

**Update frequency**: Configurable, typically every 5-10 minutes during live matches

## API Polling Strategy

**File**: `app/api/sync-matches/route.ts`

```typescript
// Sync matches endpoint
// Called by:
// 1. Admin manual sync
// 2. Auto-sync component (sessionStorage check)
// 3. Force sync button
```

### Current Polling Approach

1. **Session-based sync**: Prevents over-polling within same session
2. **Manual trigger**: Admin can force sync anytime
3. **Rate limit aware**: Respects API rate limits

### Recommended Polling During Live Matches

For World Cup matches (free tier limits):
- **Before match**: Once per hour
- **During match**: Every 5-10 minutes
- **After match**: Once to get final score

## Workarounds for Match Minute Display

If you want to show approximate match minute, you have 3 options:

### Option 1: Client-Side Estimation (Simple)

Calculate estimated minute based on kickoff time:

```typescript
function estimateMatchMinute(kickoffTime: string, status: string): string | null {
  if (status !== 'live' && status !== 'IN_PLAY') return null
  
  const kickoff = new Date(kickoffTime)
  const now = new Date()
  const elapsed = Math.floor((now.getTime() - kickoff.getTime()) / 1000 / 60)
  
  if (elapsed < 0) return null
  if (elapsed > 120) return '90+' // Over 90 mins
  if (elapsed > 90) return '90+' // Injury time
  if (elapsed > 45 && elapsed <= 60) return 'HT' // Half-time (approx)
  
  return `${Math.min(elapsed, 90)}'`
}
```

**Pros:**
- No API changes needed
- Works immediately
- No additional costs

**Cons:**
- Not accurate (doesn't account for stoppage time, delays, half-time)
- Shows estimated time, not actual
- Can be confusing to users

### Option 2: Upgrade API Plan (Expensive)

Switch to a premium API that provides live minute data:

**Options:**
- **football-data.org Premium** ($80-200/month) - Includes live events
- **API-FOOTBALL** (RapidAPI) - Real-time data with minute tracking
- **LiveScore API** - Comprehensive live data
- **SofaScore API** - Detailed live statistics

**Pros:**
- Accurate match minute
- Live events (goals, cards, etc.)
- Better user experience

**Cons:**
- Monthly subscription cost
- API integration work required
- Higher rate limit needs

### Option 3: Manual Admin Input (Hybrid)

Add a field for admins to manually update match minute:

```sql
ALTER TABLE matches ADD COLUMN current_minute INTEGER;
```

Admin form:
```typescript
<input 
  type="number" 
  placeholder="Current minute" 
  min="0" 
  max="120"
/>
```

**Pros:**
- No API cost
- Admin has control
- Can be accurate if updated

**Cons:**
- Requires manual work
- Only as accurate as admin updates
- Not practical for multiple simultaneous matches

## Recommendation

For a **prediction league application**, the current approach is **sufficient** because:

1. ✅ **Predictions close at kickoff** - Minute doesn't matter for prediction locking
2. ✅ **Users check final scores** - Exact minute during match isn't critical
3. ✅ **Live scores are provided** - Users can see score updates
4. ✅ **Cost-effective** - Free API tier is adequate

### When Match Minute Matters

You would need match minute if:
- Showing live commentary/events
- In-play betting features
- Real-time push notifications
- Detailed match statistics
- Live play-by-play updates

**For a World Cup prediction league**: Current implementation is appropriate and cost-effective.

## Current Live Match Features

### ✅ Working Features

1. **Live Score Updates**
   - Scores update when matches are synced
   - Visual "LIVE" indicator on match cards
   - Real-time score display

2. **Match Status Tracking**
   - Shows upcoming, live, and finished states
   - Half-time scores preserved
   - Extra time and penalties handled

3. **Automatic Sync**
   - Auto-sync component checks for stale data
   - Force sync button for admins
   - Session-based rate limiting

### 🎯 Recommendation

**Keep the current implementation** unless you have a specific business need for minute-by-minute data that justifies the premium API cost.

For most prediction leagues, knowing the live score is sufficient - the exact minute is not critical for the user experience.

## Alternative: Show "LIVE" Status Only

Best practice for prediction leagues:

```typescript
// Instead of showing minute (which we don't have)
{match.status === 'live' ? (
  <span className="...">🔴 LIVE - {homeScore} : {awayScore}</span>
) : (
  <span className="...">Final - {homeScore} : {awayScore}</span>
)}
```

This approach:
- ✅ Clear indication match is in progress
- ✅ Shows current score
- ✅ No misleading information
- ✅ Cost-effective
- ✅ Meets user expectations for a prediction platform

## Summary

| Feature | Available | API Tier |
|---------|-----------|----------|
| Live scores | ✅ Yes | Free |
| Match status (LIVE/FINISHED) | ✅ Yes | Free |
| Half-time scores | ✅ Yes | Free |
| Full-time scores | ✅ Yes | Free |
| Extra time/penalties | ✅ Yes | Free |
| **Match minute** | ❌ No | Premium ($$$) |
| Goal scorers | ❌ No | Premium ($$$) |
| Cards/Events | ❌ No | Premium ($$$) |
| Live commentary | ❌ No | Premium ($$$) |

**Conclusion**: The application provides appropriate live match data for a prediction league without requiring expensive premium API subscriptions.
