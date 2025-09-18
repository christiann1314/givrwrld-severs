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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          post_install_script: string | null
          price_monthly: number
          pterodactyl_env: Json | null
          pterodactyl_limits_patch: Json | null
          slug: string
          stripe_price_id_monthly: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          post_install_script?: string | null
          price_monthly: number
          pterodactyl_env?: Json | null
          pterodactyl_limits_patch?: Json | null
          slug: string
          stripe_price_id_monthly?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          post_install_script?: string | null
          price_monthly?: number
          pterodactyl_env?: Json | null
          pterodactyl_limits_patch?: Json | null
          slug?: string
          stripe_price_id_monthly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          operation: string
          row_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          operation: string
          row_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          operation?: string
          row_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bundles: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          name: string
          price_monthly: number
          pterodactyl_env: Json | null
          pterodactyl_limits_patch: Json | null
          slug: string
          stripe_price_id_annual: string | null
          stripe_price_id_biannual: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_quarterly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name: string
          price_monthly: number
          pterodactyl_env?: Json | null
          pterodactyl_limits_patch?: Json | null
          slug: string
          stripe_price_id_annual?: string | null
          stripe_price_id_biannual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_quarterly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name?: string
          price_monthly?: number
          pterodactyl_env?: Json | null
          pterodactyl_limits_patch?: Json | null
          slug?: string
          stripe_price_id_annual?: string | null
          stripe_price_id_biannual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_quarterly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      financial_audit: {
        Row: {
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          row_id: string
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          row_id: string
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          row_id?: string
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          operation_count: number | null
          operation_type: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          operation_count?: number | null
          operation_type: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          operation_count?: number | null
          operation_type?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          docker_image: string
          egg_id: number | null
          icon_url: string | null
          id: string
          name: string
          slug: string
          startup_command: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          docker_image: string
          egg_id?: number | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          startup_command?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          docker_image?: string
          egg_id?: number | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          startup_command?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modpacks: {
        Row: {
          created_at: string
          description: string | null
          download_url: string | null
          game_id: string | null
          id: string
          modpack_id: string | null
          name: string
          price_monthly: number | null
          pterodactyl_env: Json | null
          slug: string
          stripe_price_id_monthly: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_url?: string | null
          game_id?: string | null
          id?: string
          modpack_id?: string | null
          name: string
          price_monthly?: number | null
          pterodactyl_env?: Json | null
          slug: string
          stripe_price_id_monthly?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          download_url?: string | null
          game_id?: string | null
          id?: string
          modpack_id?: string | null
          name?: string
          price_monthly?: number | null
          pterodactyl_env?: Json | null
          slug?: string
          stripe_price_id_monthly?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modpacks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          order_payload: Json
          server_id: string | null
          status: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          order_payload: Json
          server_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          order_payload?: Json
          server_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          bandwidth_tb: number | null
          cpu_cores: number
          created_at: string
          description: string | null
          disk_gb: number
          game_id: string | null
          id: string
          max_players: number | null
          name: string
          price_monthly: number
          pterodactyl_env: Json | null
          pterodactyl_limits: Json | null
          ram_gb: number
          slug: string
          stripe_price_id_annual: string | null
          stripe_price_id_biannual: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_quarterly: string | null
          updated_at: string
        }
        Insert: {
          bandwidth_tb?: number | null
          cpu_cores: number
          created_at?: string
          description?: string | null
          disk_gb: number
          game_id?: string | null
          id?: string
          max_players?: number | null
          name: string
          price_monthly: number
          pterodactyl_env?: Json | null
          pterodactyl_limits?: Json | null
          ram_gb: number
          slug: string
          stripe_price_id_annual?: string | null
          stripe_price_id_biannual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_quarterly?: string | null
          updated_at?: string
        }
        Update: {
          bandwidth_tb?: number | null
          cpu_cores?: number
          created_at?: string
          description?: string | null
          disk_gb?: number
          game_id?: string | null
          id?: string
          max_players?: number | null
          name?: string
          price_monthly?: number
          pterodactyl_env?: Json | null
          pterodactyl_limits?: Json | null
          ram_gb?: number
          slug?: string
          stripe_price_id_annual?: string | null
          stripe_price_id_biannual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_quarterly?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          pterodactyl_password_encrypted: string | null
          pterodactyl_user_id: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          pterodactyl_password_encrypted?: string | null
          pterodactyl_user_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          pterodactyl_password_encrypted?: string | null
          pterodactyl_user_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          plan_name: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          plan_name: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          plan_name?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_servers: {
        Row: {
          addon_ids: string[] | null
          billing_term: string | null
          bundle_id: string | null
          cpu: string
          created_at: string
          disk: string
          env_vars: Json | null
          game_type: string
          id: string
          ip: string | null
          live_stats: Json | null
          location: string
          modpack_id: string | null
          order_payload: Json | null
          plan_id: string | null
          port: string | null
          pterodactyl_server_id: string | null
          pterodactyl_url: string | null
          ram: string
          server_limits: Json | null
          server_name: string
          status: string
          stripe_session_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          addon_ids?: string[] | null
          billing_term?: string | null
          bundle_id?: string | null
          cpu: string
          created_at?: string
          disk: string
          env_vars?: Json | null
          game_type: string
          id?: string
          ip?: string | null
          live_stats?: Json | null
          location: string
          modpack_id?: string | null
          order_payload?: Json | null
          plan_id?: string | null
          port?: string | null
          pterodactyl_server_id?: string | null
          pterodactyl_url?: string | null
          ram: string
          server_limits?: Json | null
          server_name: string
          status?: string
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          addon_ids?: string[] | null
          billing_term?: string | null
          bundle_id?: string | null
          cpu?: string
          created_at?: string
          disk?: string
          env_vars?: Json | null
          game_type?: string
          id?: string
          ip?: string | null
          live_stats?: Json | null
          location?: string
          modpack_id?: string | null
          order_payload?: Json | null
          plan_id?: string | null
          port?: string | null
          pterodactyl_server_id?: string | null
          pterodactyl_url?: string | null
          ram?: string
          server_limits?: Json | null
          server_name?: string
          status?: string
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_servers_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_servers_modpack_id_fkey"
            columns: ["modpack_id"]
            isOneToOne: false
            referencedRelation: "modpacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_servers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          active_servers: number | null
          created_at: string
          id: string
          referrals: number | null
          support_tickets: number | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active_servers?: number | null
          created_at?: string
          id?: string
          referrals?: number | null
          support_tickets?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active_servers?: number | null
          created_at?: string
          id?: string
          referrals?: number | null
          support_tickets?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      my_financial_overview: {
        Row: {
          avg_order_value: number | null
          last_purchase_date: string | null
          total_orders: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      orders_secure: {
        Row: {
          access_level: string | null
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string | null
          order_summary: Json | null
          server_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_level?: never
          amount?: never
          created_at?: string | null
          currency?: never
          id?: string | null
          order_summary?: never
          server_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: never
          amount?: never
          created_at?: string | null
          currency?: never
          id?: string | null
          order_summary?: never
          server_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "user_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: never
          id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_my_rate_limit: {
        Args: { max_ops?: number; operation_name: string }
        Returns: boolean
      }
      cleanup_user_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      create_user_profile: {
        Args: {
          new_display_name?: string
          new_email: string
          new_user_id: string
        }
        Returns: string
      }
      create_user_stats: {
        Args: { user_id_param: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      get_my_financial_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_order_value: number
          last_purchase_date: string
          total_orders: number
          total_spent: number
        }[]
      }
      get_safe_financial_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_avg_order: number
          user_last_purchase: string
          user_total_orders: number
          user_total_spent: number
        }[]
      }
      hash_data: {
        Args: { data: string }
        Returns: string
      }
      initialize_user_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      log_user_action: {
        Args: { action_name: string; details?: Json }
        Returns: boolean
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
