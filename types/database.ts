/**
 * Database Type Definitions
 * 
 * Generated from Supabase migrations for strict TypeScript typing.
 * Manually created based on schema in supabase/migrations/*.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          phone_number: string | null
          avatar_url: string | null
          total_points: number
          correct_predictions: number
          role: 'user' | 'admin'
          email_notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          total_points?: number
          correct_predictions?: number
          role?: 'user' | 'admin'
          email_notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          phone_number?: string | null
          avatar_url?: string | null
          total_points?: number
          correct_predictions?: number
          role?: 'user' | 'admin'
          email_notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          external_id: number
          home_team: string
          away_team: string
          home_team_logo: string | null
          away_team_logo: string | null
          home_score: number | null
          away_score: number | null
          status: 'upcoming' | 'live' | 'finished'
          kickoff_time: string
          competition_round: string
          group_name: string | null
          venue: string | null
          winner_announced: boolean
          api_last_polled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: number
          home_team: string
          away_team: string
          home_team_logo?: string | null
          away_team_logo?: string | null
          home_score?: number | null
          away_score?: number | null
          status: 'upcoming' | 'live' | 'finished'
          kickoff_time: string
          competition_round: string
          group_name?: string | null
          venue?: string | null
          winner_announced?: boolean
          api_last_polled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_id?: number
          home_team?: string
          away_team?: string
          home_team_logo?: string | null
          away_team_logo?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: 'upcoming' | 'live' | 'finished'
          kickoff_time?: string
          competition_round?: string
          group_name?: string | null
          venue?: string | null
          winner_announced?: boolean
          api_last_polled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          predicted_penalty_winner: string | null
          points_breakdown: Json | null
          total_points: number | null
          points_awarded: number | null
          scored_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          predicted_home: number
          predicted_away: number
          predicted_penalty_winner?: string | null
          points_breakdown?: Json | null
          total_points?: number | null
          points_awarded?: number | null
          scored_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          predicted_home?: number
          predicted_away?: number
          predicted_penalty_winner?: string | null
          points_breakdown?: Json | null
          total_points?: number | null
          points_awarded?: number | null
          scored_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          total_points: number
          correct_predictions: number
          scored_count: number
          rank: number
        }
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Functions: {
      refresh_leaderboard: {
        Args: Record<string, never>
        Returns: void
      }
      score_prediction_with_audit: {
        Args: {
          p_prediction_id: string
          p_match_id: string
          p_actual_home: number
          p_actual_away: number
          p_actual_penalty_winner: string | null
          p_scored_by: string | null
        }
        Returns: Json
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
