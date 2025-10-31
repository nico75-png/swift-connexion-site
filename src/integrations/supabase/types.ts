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
          address_type: Database["public"]["Enums"]["address_type"] | null
          city: string | null
          coordinates: Json | null
          country: string | null
          created_at: string | null
          id: string
          label: string | null
          postal_code: string | null
          street: string | null
          user_id: string | null
        }
        Insert: {
          address_type?: Database["public"]["Enums"]["address_type"] | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          postal_code?: string | null
          street?: string | null
          user_id?: string | null
        }
        Update: {
          address_type?: Database["public"]["Enums"]["address_type"] | null
          city?: string | null
          coordinates?: Json | null
          country?: string | null
          created_at?: string | null
          id?: string
          label?: string | null
          postal_code?: string | null
          street?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          context: Json | null
          id: number
          new_values: Json | null
          old_values: Json | null
          operation: string
          performed_at: string | null
          performed_by: string | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          context?: Json | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          context?: Json | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          performed_at?: string | null
          performed_by?: string | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          company: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          default_billing_address_id: string | null
          default_delivery_address: string | null
          default_pickup_address: string | null
          default_shipping_address_id: string | null
          id: string
          industry: string | null
          sector: string | null
          siret: string | null
          user_id: string | null
        }
        Insert: {
          company?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          default_shipping_address_id?: string | null
          id?: string
          industry?: string | null
          sector?: string | null
          siret?: string | null
          user_id?: string | null
        }
        Update: {
          company?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          default_billing_address_id?: string | null
          default_delivery_address?: string | null
          default_pickup_address?: string | null
          default_shipping_address_id?: string | null
          id?: string
          industry?: string | null
          sector?: string | null
          siret?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          availability: boolean | null
          created_at: string | null
          id: string
          phone: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Insert: {
          availability?: boolean | null
          created_at?: string | null
          id: string
          phone?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Update: {
          availability?: boolean | null
          created_at?: string | null
          id?: string
          phone?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          linked_order_id: string | null
          quantity: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          linked_order_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          linked_order_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          total_amount: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total_amount?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          id: string
          last_message_at: string | null
          participants: string[]
        }
        Insert: {
          id?: string
          last_message_at?: string | null
          participants: string[]
        }
        Update: {
          id?: string
          last_message_at?: string | null
          participants?: string[]
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          linked_order_id: string | null
          read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          thread_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          linked_order_id?: string | null
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          linked_order_id?: string | null
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_linked_order_id_fkey"
            columns: ["linked_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
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
          created_at: string | null
          id: string
          notification_type:
            | Database["public"]["Enums"]["notification_type"]
            | null
          read: boolean | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: number
          new_status: Database["public"]["Enums"]["order_status"] | null
          note: string | null
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_status?: Database["public"]["Enums"]["order_status"] | null
          note?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_status?: Database["public"]["Enums"]["order_status"] | null
          note?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string | null
          currency: string | null
          customer_company: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_address_id: string | null
          driver_assigned_at: string | null
          driver_id: string | null
          driver_instructions: string | null
          id: string
          package_note: string | null
          package_type: string | null
          parcel_info: Json | null
          pickup_address: string | null
          pickup_address_id: string | null
          quote_id: string | null
          schedule_end: string | null
          schedule_start: string | null
          scheduled_at: string | null
          sector: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number | null
          updated_at: string | null
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_company?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_address_id?: string | null
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id?: string
          package_note?: string | null
          package_type?: string | null
          parcel_info?: Json | null
          pickup_address?: string | null
          pickup_address_id?: string | null
          quote_id?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          scheduled_at?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          currency?: string | null
          customer_company?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_address_id?: string | null
          driver_assigned_at?: string | null
          driver_id?: string | null
          driver_instructions?: string | null
          id?: string
          package_note?: string | null
          package_type?: string | null
          parcel_info?: Json | null
          pickup_address?: string | null
          pickup_address_id?: string | null
          quote_id?: string | null
          schedule_end?: string | null
          schedule_start?: string | null
          scheduled_at?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pickup_address_id_fkey"
            columns: ["pickup_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string | null
          delivery_address_id: string | null
          estimated_amount: number | null
          id: string
          parcel_info: Json | null
          pickup_address_id: string | null
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          delivery_address_id?: string | null
          estimated_amount?: number | null
          id?: string
          parcel_info?: Json | null
          pickup_address_id?: string | null
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          delivery_address_id?: string | null
          estimated_amount?: number | null
          id?: string
          parcel_info?: Json | null
          pickup_address_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_pickup_address_id_fkey"
            columns: ["pickup_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: number
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
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
      address_type: "billing" | "shipping" | "other"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      notification_type: "info" | "alert" | "warning" | "success"
      order_status:
        | "pending"
        | "scheduled"
        | "in_transit"
        | "delivered"
        | "cancelled"
      user_role_type: "admin" | "client" | "driver" | "dispatch"
      vehicle_type: "bike" | "car" | "van" | "truck"
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
      address_type: ["billing", "shipping", "other"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      notification_type: ["info", "alert", "warning", "success"],
      order_status: [
        "pending",
        "scheduled",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      user_role_type: ["admin", "client", "driver", "dispatch"],
      vehicle_type: ["bike", "car", "van", "truck"],
    },
  },
} as const
