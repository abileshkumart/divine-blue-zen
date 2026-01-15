export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_reflections: {
        Row: {
          created_at: string | null
          day_summary: string | null
          id: string
          key_takeaway: string | null
          mood: string | null
          reflection_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_summary?: string | null
          id?: string
          key_takeaway?: string | null
          mood?: string | null
          reflection_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_summary?: string | null
          id?: string
          key_takeaway?: string | null
          mood?: string | null
          reflection_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moon_phases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          phase_date: string
          phase_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          phase_date: string
          phase_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          phase_date?: string
          phase_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          streak_count: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          streak_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          streak_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_profiles: {
        Row: {
          id: string
          user_id: string
          gut_type: 'balanced' | 'fiery' | 'airy' | 'slow' | 'inflamed' | 'lowFermenter'
          quiz_completed_at: string | null
          quiz_scores: Record<string, number> | null
          dietary_preferences: {
            isVegetarian?: boolean
            isVegan?: boolean
            allergens?: string[]
          } | null
          goals: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          gut_type: 'balanced' | 'fiery' | 'airy' | 'slow' | 'inflamed' | 'lowFermenter'
          quiz_completed_at?: string | null
          quiz_scores?: Record<string, number> | null
          dietary_preferences?: {
            isVegetarian?: boolean
            isVegan?: boolean
            allergens?: string[]
          } | null
          goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          gut_type?: 'balanced' | 'fiery' | 'airy' | 'slow' | 'inflamed' | 'lowFermenter'
          quiz_completed_at?: string | null
          quiz_scores?: Record<string, number> | null
          dietary_preferences?: {
            isVegetarian?: boolean
            isVegan?: boolean
            allergens?: string[]
          } | null
          goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_checkins: {
        Row: {
          id: string
          user_id: string
          checkin_date: string
          overall_feeling: number | null
          energy_level: number | null
          stress_level: number | null
          bowel_movement: 'none' | 'constipated' | 'normal' | 'loose' | 'mixed' | null
          bowel_frequency: number | null
          bloating: 'none' | 'mild' | 'moderate' | 'severe' | null
          symptoms: string[] | null
          water_intake: number | null
          sleep_quality: number | null
          exercise_done: boolean | null
          notes: string | null
          triggers: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          checkin_date?: string
          overall_feeling?: number | null
          energy_level?: number | null
          stress_level?: number | null
          bowel_movement?: 'none' | 'constipated' | 'normal' | 'loose' | 'mixed' | null
          bowel_frequency?: number | null
          bloating?: 'none' | 'mild' | 'moderate' | 'severe' | null
          symptoms?: string[] | null
          water_intake?: number | null
          sleep_quality?: number | null
          exercise_done?: boolean | null
          notes?: string | null
          triggers?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          checkin_date?: string
          overall_feeling?: number | null
          energy_level?: number | null
          stress_level?: number | null
          bowel_movement?: 'none' | 'constipated' | 'normal' | 'loose' | 'mixed' | null
          bowel_frequency?: number | null
          bloating?: 'none' | 'mild' | 'moderate' | 'severe' | null
          symptoms?: string[] | null
          water_intake?: number | null
          sleep_quality?: number | null
          exercise_done?: boolean | null
          notes?: string | null
          triggers?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_meal_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
          meal_time: string | null
          recipe_id: string | null
          meal_description: string | null
          foods: string[] | null
          portion_size: 'small' | 'medium' | 'large' | 'very_large' | null
          satisfaction: number | null
          post_meal_feeling: 'great' | 'good' | 'okay' | 'uncomfortable' | 'bad' | null
          post_meal_symptoms: string[] | null
          photo_url: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          log_date?: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
          meal_time?: string | null
          recipe_id?: string | null
          meal_description?: string | null
          foods?: string[] | null
          portion_size?: 'small' | 'medium' | 'large' | 'very_large' | null
          satisfaction?: number | null
          post_meal_feeling?: 'great' | 'good' | 'okay' | 'uncomfortable' | 'bad' | null
          post_meal_symptoms?: string[] | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
          meal_time?: string | null
          recipe_id?: string | null
          meal_description?: string | null
          foods?: string[] | null
          portion_size?: 'small' | 'medium' | 'large' | 'very_large' | null
          satisfaction?: number | null
          post_meal_feeling?: 'great' | 'good' | 'okay' | 'uncomfortable' | 'bad' | null
          post_meal_symptoms?: string[] | null
          photo_url?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_saved_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          is_favorite: boolean | null
          times_cooked: number | null
          last_cooked_at: string | null
          personal_notes: string | null
          rating: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          is_favorite?: boolean | null
          times_cooked?: number | null
          last_cooked_at?: string | null
          personal_notes?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          is_favorite?: boolean | null
          times_cooked?: number | null
          last_cooked_at?: string | null
          personal_notes?: string | null
          rating?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          gut_type: string
          plan_data: {
            day: string
            meals: {
              breakfast?: string
              lunch?: string
              dinner?: string
              snack?: string
            }
          }[]
          preferences: {
            isVegetarian?: boolean
            isVegan?: boolean
            avoidAllergens?: string[]
          } | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          gut_type: string
          plan_data: {
            day: string
            meals: {
              breakfast?: string
              lunch?: string
              dinner?: string
              snack?: string
            }
          }[]
          preferences?: {
            isVegetarian?: boolean
            isVegan?: boolean
            avoidAllergens?: string[]
          } | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          gut_type?: string
          plan_data?: {
            day: string
            meals: {
              breakfast?: string
              lunch?: string
              dinner?: string
              snack?: string
            }
          }[]
          preferences?: {
            isVegetarian?: boolean
            isVegan?: boolean
            avoidAllergens?: string[]
          } | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gut_food_diary: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          entry_time: string | null
          food_item: string
          food_category: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'legume' | 'fermented' | 'spice' | 'drink' | 'sweet' | 'other' | null
          is_recommended: boolean | null
          reaction: 'good' | 'neutral' | 'bad' | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          entry_time?: string | null
          food_item: string
          food_category?: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'legume' | 'fermented' | 'spice' | 'drink' | 'sweet' | 'other' | null
          is_recommended?: boolean | null
          reaction?: 'good' | 'neutral' | 'bad' | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          entry_time?: string | null
          food_item?: string
          food_category?: 'grain' | 'protein' | 'dairy' | 'vegetable' | 'fruit' | 'legume' | 'fermented' | 'spice' | 'drink' | 'sweet' | 'other' | null
          is_recommended?: boolean | null
          reaction?: 'good' | 'neutral' | 'bad' | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      gut_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: 'pattern' | 'trigger' | 'improvement' | 'recommendation' | 'streak' | 'weekly_summary'
          title: string
          content: string
          severity: 'info' | 'success' | 'warning' | 'alert' | null
          is_read: boolean | null
          is_dismissed: boolean | null
          source_data: Record<string, unknown> | null
          valid_from: string | null
          valid_until: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: 'pattern' | 'trigger' | 'improvement' | 'recommendation' | 'streak' | 'weekly_summary'
          title: string
          content: string
          severity?: 'info' | 'success' | 'warning' | 'alert' | null
          is_read?: boolean | null
          is_dismissed?: boolean | null
          source_data?: Record<string, unknown> | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: 'pattern' | 'trigger' | 'improvement' | 'recommendation' | 'streak' | 'weekly_summary'
          title?: string
          content?: string
          severity?: 'info' | 'success' | 'warning' | 'alert' | null
          is_read?: boolean | null
          is_dismissed?: boolean | null
          source_data?: Record<string, unknown> | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          session_id: string | null
          session_title: string
          session_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          session_id?: string | null
          session_title: string
          session_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          session_id?: string | null
          session_title?: string
          session_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "yoga_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      yoga_sessions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          recurrence: string | null
          scheduled_time: string | null
          session_type: string
          time_of_day: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recurrence?: string | null
          scheduled_time?: string | null
          session_type: string
          time_of_day: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recurrence?: string | null
          scheduled_time?: string | null
          session_type?: string
          time_of_day?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      gut_health_trends: {
        Row: {
          user_id: string
          checkin_date: string
          overall_feeling: number | null
          energy_level: number | null
          stress_level: number | null
          bloating: string | null
          bowel_movement: string | null
          symptom_count: number | null
        }
      }
    }
    Functions: {
      get_gut_checkin_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_weekly_gut_summary: {
        Args: { p_user_id: string }
        Returns: {
          avg_feeling: number
          avg_energy: number
          total_checkins: number
          most_common_symptoms: string[]
          streak: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
