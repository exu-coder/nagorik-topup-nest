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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      category_settings: {
        Row: {
          active: boolean
          custom_max: number | null
          custom_min: number | null
          custom_price_per_step: number | null
          custom_step: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          custom_max?: number | null
          custom_min?: number | null
          custom_price_per_step?: number | null
          custom_step?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          custom_max?: number | null
          custom_min?: number | null
          custom_price_per_step?: number | null
          custom_step?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          blocked: boolean
          created_at: string
          email: string
          name: string
          note: string
          phone: string
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          email: string
          name?: string
          note?: string
          phone?: string
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          email?: string
          name?: string
          note?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_note: string
          amount: number
          category_slug: string
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          item_label: string
          paid_at: string | null
          payment_method: string | null
          phone: string
          selection: Json
          status: Database["public"]["Enums"]["order_status"]
          target_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string
          amount: number
          category_slug: string
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          item_label: string
          paid_at?: string | null
          payment_method?: string | null
          phone?: string
          selection?: Json
          status?: Database["public"]["Enums"]["order_status"]
          target_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string
          amount?: number
          category_slug?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          item_label?: string
          paid_at?: string | null
          payment_method?: string | null
          phone?: string
          selection?: Json
          status?: Database["public"]["Enums"]["order_status"]
          target_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_packages: {
        Row: {
          active: boolean
          category_slug: string
          created_at: string
          detail: string
          id: string
          price: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_slug: string
          created_at?: string
          detail?: string
          id: string
          price: number
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_slug?: string
          created_at?: string
          detail?: string
          id?: string
          price?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_customer_summary: {
        Args: never
        Returns: {
          blocked: boolean
          created_at: string
          email: string
          last_order_at: string
          name: string
          note: string
          order_count: number
          paid_total: number
          phone: string
        }[]
      }
      admin_dashboard_stats: { Args: never; Returns: Json }
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "delivered"
        | "failed"
        | "cancelled"
        | "refunded"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "delivered",
        "failed",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
