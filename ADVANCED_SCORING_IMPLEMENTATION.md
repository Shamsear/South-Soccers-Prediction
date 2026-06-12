# Advanced Scoring System - Implementation Guide

## Overview
This document outlines the new advanced scoring system with detailed point breakdowns and audit trails.

## New Scoring Rules

### Point System

| Rule | Description | Points |
|------|-------------|--------|
| **1. Exact Score (Base)** | Player predicted the exact final score | **5 points** |
| **2. Correct Result Only** | Player predicted the correct winner/draw but not exact score | **3 points** |
| **3. Goal Difference Bonus** | Extra point if the winning margin is correct (even if score is wrong) | **+1 point** |
| **4. Knockout Exact Score Bonus** | Extra points for exact score in Round of 32, R16, QF, SF, Final | **+2 points** |
| **5. Penalty Shootout Bonus** | Extra points if player correctly predicts penalty winner | **+2 points** |
| **6. Wrong Result** | Incorrect prediction | **0 points** |

### Examples

#### Example 1: Group Stage Exact Score
- **Prediction**: Brazil 2-1 Argentina
- **Actual**: Brazil 2-1 Argentina
- **Points**: 5 (exact score)
- **Breakdown**: Base 5pts

#### Example 2: Knockout Stage Exact Score
- **Prediction**: France 3-2 Germany (R16)
- **Actual**: France 3-2 Germany
- **Points**: 7 (exact score + knockout bonus)
- **Breakdown**: Base 5pts + Knockout 2pts

#### Example 3: Knockout with Penalty
- **Prediction**: England 1-1 Italy (penalty: England)
- **Actual**: England 1-1 Italy (penalty: England)
- **Points**: 9 (exact score + knockout + penalty)
- **Breakdown**: Base 5pts + Knockout 2pts + Penalty 2pts

#### Example 4: Correct Result + Goal Difference
- **Prediction**: Spain 3-1 Portugal
- **Actual**: Spain 2-0 Portugal
- **Points**: 4 (correct winner + 2-goal margin)
- **Breakdown**: Base 3pts + Goal Diff 1pt

#### Example 5: Correct Result Only
- **Prediction**: Netherlands 2-0 Belgium
- **Actual**: Netherlands 3-1 Belgium
- **Points**: 3 (correct winner, different margin)
- **Breakdown**: Base 3pts

#### Example 6: Wrong Result
- **Prediction**: Mexico 2-0 USA
- **Actual**: USA 1-0 Mexico
- **Points**: 0
- **Breakdown**: Wrong result

## Database Changes

### New Columns in `predictions` table:
- `predicted_penalty_winner` (TEXT): 'home', 'away', or NULL
- `points_breakdown` (JSONB): Detailed breakdown of points
- `total_points` (INTEGER): Total points earned (replaces `points_awarded`)

### New Table: `prediction_audit`
Audit trail for all scored predictions with:
- Full prediction and match details
- Point calculation breakdown
- Calculation notes
- Timestamp and scorer information

## Migration Steps

### 1. Run Database Migration
```bash
# Execute the migration
supabase migration up
# Or manually run:
psql -f supabase/migrations/009_advanced_scoring_system.sql
```

### 2. Verify Migration
```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'predictions' 
AND column_name IN ('predicted_penalty_winner', 'points_breakdown', 'total_points');

-- Check audit table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'prediction_audit';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_advanced_points', 'score_prediction_with_audit');
```

### 3. Update Application Code

#### Admin Scoring Page
Update `app/admin/matches/page.tsx` to:
- Add penalty winner input field
- Use new scoring function
- Display point breakdowns

#### User Pages
Update these pages to show new point breakdowns:
- `app/my-predictions/page.tsx` - Show detailed breakdown
- `app/matches/[id]/page.tsx` - Show points breakdown
- `app/admin/users/[id]/page.tsx` - Show audit information

#### Prediction Form
Update `components/prediction-form.tsx` to:
- Add optional penalty winner prediction for knockout matches
- Show user current scoring rules

### 4. Rescore Existing Predictions (Optional)
If you have existing predictions, you can rescore them:

```sql
-- Rescore all predictions with the new system
-- WARNING: This will update all existing predictions
DO $$
DECLARE
  pred RECORD;
  match RECORD;
  result JSONB;
BEGIN
  FOR pred IN 
    SELECT p.*, m.home_score, m.away_score, m.competition_round
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE m.status = 'finished' 
    AND m.home_score IS NOT NULL 
    AND m.away_score IS NOT NULL
  LOOP
    -- Score with new system (assuming no penalty for existing)
    SELECT * INTO result
    FROM score_prediction_with_audit(
      pred.id,
      pred.match_id,
      pred.home_score,
      pred.away_score,
      NULL, -- No penalty data for existing
      auth.uid() -- Current admin user
    );
    
    RAISE NOTICE 'Rescored prediction % - Points: %', 
      pred.id, 
      result->>'points_breakdown';
  END LOOP;
END;
$$;
```

## Audit Trail Features

### View User's Audit Records
```sql
-- Get audit trail for a specific user
SELECT 
  pa.home_team,
  pa.away_team,
  pa.predicted_home || '-' || pa.predicted_away as predicted_score,
  pa.actual_home || '-' || pa.actual_away as actual_score,
  pa.base_points,
  pa.goal_difference_bonus,
  pa.knockout_bonus,
  pa.penalty_bonus,
  pa.total_points,
  pa.calculation_notes,
  pa.scored_at
FROM prediction_audit pa
WHERE pa.user_id = '<user_id>'
ORDER BY pa.scored_at DESC;
```

### View Match Audit Records
```sql
-- Get all predictions for a specific match
SELECT 
  p.username,
  pa.predicted_home || '-' || pa.predicted_away as prediction,
  pa.total_points,
  pa.calculation_notes
FROM prediction_audit pa
JOIN profiles p ON pa.user_id = p.id
WHERE pa.match_id = '<match_id>'
ORDER BY pa.total_points DESC, p.username;
```

## UI Components to Create

### 1. Points Breakdown Badge Component
```typescript
// components/points-breakdown-badge.tsx
// Shows: 5pts (exact) + 2pts (knockout) = 7 total
```

### 2. Audit Trail Viewer Component
```typescript
// components/audit-trail-viewer.tsx
// Table showing full breakdown for user's predictions
```

### 3. Penalty Prediction Input
```typescript
// components/penalty-prediction-input.tsx
// Optional input for knockout matches
```

### 4. Scoring Rules Display
```typescript
// components/scoring-rules.tsx
// Shows users how points are calculated
```

## API Updates Needed

### 1. Score Match Action
Update `app/actions/admin.ts`:
```typescript
export async function scoreMatch(
  matchId: string,
  homeScore: number,
  awayScore: number,
  penaltyWinner?: 'home' | 'away' | null
)
```

### 2. Get Audit Trail
```typescript
export async function getUserAuditTrail(userId: string)
export async function getMatchAuditTrail(matchId: string)
```

## Testing Checklist

- [ ] Migration runs successfully
- [ ] New columns added to predictions table
- [ ] Audit table created
- [ ] Scoring functions work correctly
- [ ] Leaderboard updates with new points
- [ ] Users can view their audit trail
- [ ] Admins can score matches with penalties
- [ ] Points breakdown displays correctly
- [ ] Backward compatibility maintained

## Backward Compatibility

- `points_awarded` column still updated (kept for backward compatibility)
- Old queries using `points_awarded` still work
- New queries should use `total_points`
- Leaderboard updated to use `total_points`

## Performance Considerations

- Audit table will grow over time
- Consider archiving old audit records after 6-12 months
- Indexes on audit table for fast queries
- Materialized view refresh after batch scoring

## Support and Rollback

### Rollback Plan
If issues arise, you can rollback:
```sql
-- Drop new columns
ALTER TABLE predictions 
DROP COLUMN predicted_penalty_winner,
DROP COLUMN points_breakdown,
DROP COLUMN total_points;

-- Drop audit table
DROP TABLE prediction_audit CASCADE;

-- Drop functions
DROP FUNCTION calculate_advanced_points;
DROP FUNCTION score_prediction_with_audit;

-- Restore old leaderboard
-- (Re-run migration 004)
```

## Future Enhancements

1. **Streak Bonuses**: Bonus for consecutive correct predictions
2. **Early Bird Bonus**: Extra points for early predictions
3. **Confidence Levels**: Stake more points on confident predictions
4. **Head-to-Head Leagues**: Private leagues with custom rules
5. **Season-long Achievements**: Badges and milestones

## Status

- [x] Database migration created
- [x] Scoring utility created
- [x] Documentation complete
- [ ] Admin UI updates pending
- [ ] User UI updates pending
- [ ] Testing pending
- [ ] Deployment pending
