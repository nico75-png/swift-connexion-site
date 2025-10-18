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
      profiles: {
        Row: {
          created_at: string
          display_name: string
          first_name: string
          last_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: never
          first_name: string
          last_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: never
          first_name?: string
          last_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      client_profiles: {
        Row: {
          company: string
          contact_name: string
          created_at: string
          default_delivery_address: string | null
          default_pickup_address: string | null
          id: string
          sector: Database["public"]["Enums"]["sector_type"]
          siret: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company: string
          contact_name: string
          created_at?: string
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          id?: string
          sector: Database["public"]["Enums"]["sector_type"]
          siret: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company?: string
          contact_name?: string
          created_at?: string
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          id?: string
          sector?: Database["public"]["Enums"]["sector_type"]
          siret?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          customer_company: string
          customer_id: string
          delivery_address: string
          driver_assigned_at: string | null
          driver_id: string | null
          driver_instructions: string | null
          id: string
          package_note: string | null
          package_type: Database["public"]["Enums"]["package_type"]
          pickup_address: string
          quote_id: string | null
          schedule_end: string
          schedule_start: string
          sector: Database["public"]["Enums"]["sector_type"]
          status: string
          updated_at: string
          volume_m3: number
          weight_kg: number
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_company: string
          customer_id: string
          delivery_address: string
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id: string
          package_note?: string | null
          package_type: Database["public"]["Enums"]["package_type"]
          pickup_address: string
          quote_id?: string | null
          schedule_end: string
          schedule_start: string
          sector: Database["public"]["Enums"]["sector_type"]
          status?: string
          updated_at?: string
          volume_m3: number
          weight_kg: number
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_company?: string
          customer_id?: string
          delivery_address?: string
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id?: string
          package_note?: string | null
          package_type?: Database["public"]["Enums"]["package_type"]
          pickup_address?: string
          quote_id?: string | null
          schedule_end?: string
          schedule_start?: string
          sector?: Database["public"]["Enums"]["sector_type"]
          status?: string
          updated_at?: string
          volume_m3?: number
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      package_type:
        | "DM_CONSOMMABLES"
        | "UN3373"
        | "MEDICAMENTS_AMBIANT"
        | "MEDICAMENTS_2_8"
        | "DOCS_CONFIDENTIELS"
        | "VERRES_FRAGILES"
        | "MONTURES_FRAGILES"
        | "LENTILLES_LIQUIDE"
        | "PLV_REASSORT"
        | "SAV_ATELIER"
        | "DOSSIERS_CONFIDENTIELS"
        | "DEPOTS_GREFFE_NOMINATIF"
        | "JEUX_SIGNATURE_NOMINATIF"
        | "DOCS_SCELLES"
        | "PROTOTYPE"
        | "PIECE_DEPANNAGE"
        | "IT_ELECTRONIQUE"
        | "DOCS_SENSIBLES"
        | "PLV_SIGNAL"
        | "GOODIES_WELCOME"
        | "REGIE_MATERIEL"
        | "DOCS_PROD_CONF"
        | "AUTRE"
      sector_type: "MEDICAL" | "OPTIQUE" | "JURIDIQUE" | "B2B" | "EVENT"
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
    Enums: {
      package_type: [
        "DM_CONSOMMABLES",
        "UN3373",
        "MEDICAMENTS_AMBIANT",
        "MEDICAMENTS_2_8",
        "DOCS_CONFIDENTIELS",
        "VERRES_FRAGILES",
        "MONTURES_FRAGILES",
        "LENTILLES_LIQUIDE",
        "PLV_REASSORT",
        "SAV_ATELIER",
        "DOSSIERS_CONFIDENTIELS",
        "DEPOTS_GREFFE_NOMINATIF",
        "JEUX_SIGNATURE_NOMINATIF",
        "DOCS_SCELLES",
        "PROTOTYPE",
        "PIECE_DEPANNAGE",
        "IT_ELECTRONIQUE",
        "DOCS_SENSIBLES",
        "PLV_SIGNAL",
        "GOODIES_WELCOME",
        "REGIE_MATERIEL",
        "DOCS_PROD_CONF",
        "AUTRE",
      ],
      sector_type: ["MEDICAL", "OPTIQUE", "JURIDIQUE", "B2B", "EVENT"],
    },
  },
} as const
