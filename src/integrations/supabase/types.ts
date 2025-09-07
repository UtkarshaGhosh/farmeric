export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          language_preference: Database["public"]["Enums"]["language"]
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          language_preference?: Database["public"]["Enums"]["language"]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          language_preference?: Database["public"]["Enums"]["language"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      farms: {
        Row: {
          id: string
          farmer_id: string
          farm_name: string
          location: string | null
          livestock_type: Database["public"]["Enums"]["livestock_type"]
          herd_size: number
          biosecurity_level: Database["public"]["Enums"]["risk_level_enum"] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          farm_name: string
          location?: string | null
          livestock_type: Database["public"]["Enums"]["livestock_type"]
          herd_size: number
          biosecurity_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          farm_name?: string
          location?: string | null
          livestock_type?: Database["public"]["Enums"]["livestock_type"]
          herd_size?: number
          biosecurity_level?: Database["public"]["Enums"]["risk_level_enum"] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      risk_assessments: {
        Row: {
          id: string
          farm_id: string
          date: string
          score: number
          risk_level: Database["public"]["Enums"]["risk_level_enum"]
          assessment_details: Json
        }
        Insert: {
          id?: string
          farm_id: string
          date?: string
          score: number
          risk_level?: Database["public"]["Enums"]["risk_level_enum"]
          assessment_details?: Json
        }
        Update: {
          id?: string
          farm_id?: string
          date?: string
          score?: number
          risk_level?: Database["public"]["Enums"]["risk_level_enum"]
          assessment_details?: Json
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          }
        ]
      }
      training_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          type: Database["public"]["Enums"]["module_type"]
          link: string
          livestock_type: Database["public"]["Enums"]["livestock_type"]
          language: Database["public"]["Enums"]["language"]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: Database["public"]["Enums"]["module_type"]
          link: string
          livestock_type: Database["public"]["Enums"]["livestock_type"]
          language?: Database["public"]["Enums"]["language"]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: Database["public"]["Enums"]["module_type"]
          link?: string
          livestock_type?: Database["public"]["Enums"]["livestock_type"]
          language?: Database["public"]["Enums"]["language"]
          created_at?: string
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
          id: string
          farm_id: string
          document_type: string
          file_url: string
          status: Database["public"]["Enums"]["record_status"]
          submission_date: string
          submitted_by: string | null
        }
        Insert: {
          id?: string
          farm_id: string
          document_type: string
          file_url: string
          status?: Database["public"]["Enums"]["record_status"]
          submission_date?: string
          submitted_by: string
        }
        Update: {
          id?: string
          farm_id?: string
          document_type?: string
          file_url?: string
          status?: Database["public"]["Enums"]["record_status"]
          submission_date?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_records_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      alerts: {
        Row: {
          id: string
          disease_name: string
          description: string | null
          location: string
          severity: Database["public"]["Enums"]["alert_severity"]
          issued_by: string | null
          issued_date: string
        }
        Insert: {
          id?: string
          disease_name: string
          description?: string | null
          location: string
          severity: Database["public"]["Enums"]["alert_severity"]
          issued_by?: string | null
          issued_date?: string
        }
        Update: {
          id?: string
          disease_name?: string
          description?: string | null
          location?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          issued_by?: string | null
          issued_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          platform: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          platform?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          platform?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {
      calculate_risk_level: {
        Args: { p_score: number }
        Returns: Database["public"]["Enums"]["risk_level_enum"]
      }
      current_user_role: {
        Args: {}
        Returns: Database["public"]["Enums"]["user_role"] | null
      }
    }
    Enums: {
      user_role: 'farmer' | 'vet' | 'regulator'
      language: 'en' | 'hi'
      livestock_type: 'pig' | 'poultry'
      record_status: 'Pending' | 'Approved' | 'Rejected'
      module_type: 'video' | 'pdf' | 'quiz'
      risk_level_enum: 'low' | 'medium' | 'high'
      alert_severity: 'low' | 'medium' | 'high'
    }
    CompositeTypes: {}
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) [TableName] extends { Row: infer R } ? R : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"]) [DefaultSchemaTableNameOrOptions] extends { Row: infer R } ? R : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I } ? I : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I } ? I : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U } ? U : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U } ? U : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
