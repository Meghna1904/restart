export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type BrainCategory = 'ideas' | 'learn' | 'social' | 'remember' | 'buy' | 'people' | 'random'
export type NudgeType = 'move' | 'study' | 'brain' | 'checkin'
export type NudgeResponse = 'yeah' | 'later' | 'not_today'
export type DistractionReason = 'tired' | 'distracted' | 'avoiding' | 'entertainment' | 'unknown'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Relationships: [],
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      brain_items: {
        Relationships: [],
        Row: {
          id: string
          user_id: string
          content: string
          category: BrainCategory
          is_idea: boolean
          archived: boolean
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          category?: BrainCategory
          archived?: boolean
          source?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['brain_items']['Insert']>
      }
      nudge_responses: {
        Relationships: [],
        Row: {
          id: string
          user_id: string
          nudge_type: NudgeType
          nudge_message: string | null
          response: NudgeResponse
          responded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nudge_type: NudgeType
          nudge_message?: string | null
          response: NudgeResponse
          responded_at?: string
        }
        Update: Partial<Database['public']['Tables']['nudge_responses']['Insert']>
      }
      reality_checks: {
        Relationships: [],
        Row: {
          id: string
          user_id: string
          intended_task: string | null
          was_on_task: boolean | null
          distraction_reason: DistractionReason | null
          restarted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          intended_task?: string | null
          was_on_task?: boolean | null
          distraction_reason?: DistractionReason | null
          restarted?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['reality_checks']['Insert']>
      }
      comebacks: {
        Relationships: [],
        Row: {
          id: string
          user_id: string
          returned_on: string
          gap_days: number | null
          restart_action: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          returned_on?: string
          gap_days?: number | null
          restart_action?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['comebacks']['Insert']>
      }
      scroll_logs: {
        Relationships: [],
        Row: {
          id: string
          user_id: string
          log_date: string
          app: string
          minutes: number
          time_of_day: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          app: string
          minutes: number
          time_of_day?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['scroll_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
