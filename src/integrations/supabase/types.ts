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
      addresses: {
        Row: {
          address_type: string
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string
          full_address: string
          id: string
          is_default: boolean | null
          label: string | null
          postal_code: string | null
          street: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_type: string
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          full_address: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_type?: string
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string
          full_address?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          company: string | null
          contact_name: string | null
          created_at: string
          default_delivery_address: string | null
          default_pickup_address: string | null
          id: string
          sector: string | null
          siret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          contact_name?: string | null
          created_at?: string
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          id?: string
          sector?: string | null
          siret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          contact_name?: string | null
          created_at?: string
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          id?: string
          sector?: string | null
          siret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          availability_status: string | null
          created_at: string
          current_location: Json | null
          id: string
          license_number: string | null
          phone: string | null
          updated_at: string
          user_id: string
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          availability_status?: string | null
          created_at?: string
          current_location?: Json | null
          id?: string
          license_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          availability_status?: string | null
          created_at?: string
          current_location?: Json | null
          id?: string
          license_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          order_id: string | null
          quantity: number | null
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          order_id?: string | null
          quantity?: number | null
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          order_id?: string | null
          quantity?: number | null
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_items_invoice"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          customer_id: string
          deleted_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          customer_id: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          customer_id?: string
          deleted_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participants: string[]
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants: string[]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participants?: string[]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          order_id: string | null
          recipient_id: string | null
          sender_id: string
          subject: string | null
          thread_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          order_id?: string | null
          recipient_id?: string | null
          sender_id: string
          subject?: string | null
          thread_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          order_id?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string | null
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_thread"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          customer_company: string | null
          customer_id: string
          deleted_at: string | null
          delivery_address: string
          driver_assigned_at: string | null
          driver_id: string | null
          driver_instructions: string | null
          id: string
          package_note: string | null
          package_type: string | null
          pickup_address: string
          quote_id: string | null
          schedule_end: string | null
          schedule_start: string
          sector: string | null
          status: string
          updated_at: string
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_company?: string | null
          customer_id: string
          deleted_at?: string | null
          delivery_address: string
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id: string
          package_note?: string | null
          package_type?: string | null
          pickup_address: string
          quote_id?: string | null
          schedule_end?: string | null
          schedule_start: string
          sector?: string | null
          status?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_company?: string | null
          customer_id?: string
          deleted_at?: string | null
          delivery_address?: string
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id?: string
          package_note?: string | null
          package_type?: string | null
          pickup_address?: string
          quote_id?: string | null
          schedule_end?: string | null
          schedule_start?: string
          sector?: string | null
          status?: string
          updated_at?: string
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_driver"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          delivery_objects: string[] | null
          delivery_other_note: string | null
          display_name: string | null
          expertise: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_step: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_objects?: string[] | null
          delivery_other_note?: string | null
          display_name?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_step?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_objects?: string[] | null
          delivery_other_note?: string | null
          display_name?: string | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_step?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          customer_id: string
          deleted_at: string | null
          delivery_address: string
          id: string
          package_note: string | null
          package_type: string | null
          pickup_address: string
          quote_number: string
          status: string | null
          updated_at: string
          valid_until: string | null
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id: string
          deleted_at?: string | null
          delivery_address: string
          id?: string
          package_note?: string | null
          package_type?: string | null
          pickup_address: string
          quote_number: string
          status?: string | null
          updated_at?: string
          valid_until?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string
          deleted_at?: string | null
          delivery_address?: string
          id?: string
          package_note?: string | null
          package_type?: string | null
          pickup_address?: string
          quote_number?: string
          status?: string | null
          updated_at?: string
          valid_until?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      assert_owner: { Args: { _owner_id: string }; Returns: undefined }
      current_app_user_id: { Args: never; Returns: string }
      ensure_status_transition: {
        Args: { _allowed: Json; _current: string; _next: string }
        Returns: boolean
      }
      generate_human_id: {
        Args: { _at?: string; _resource: string }
        Returns: string
      }
      grant_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      normalize_email: { Args: { _email: string }; Returns: string }
      owns_row: { Args: { _row_user_id: string }; Returns: boolean }
      revoke_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      soft_delete: { Args: { _id: string; _table: string }; Returns: undefined }
      valid_email: { Args: { _email: string }; Returns: boolean }
      write_audit_log: {
        Args: {
          _action: string
          _after?: Json
          _before?: Json
          _entity_id: string
          _entity_type: string
          _meta?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "client" | "driver" | "dispatch"
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
      app_role: ["admin", "client", "driver", "dispatch"],
    },
  },
} as const
