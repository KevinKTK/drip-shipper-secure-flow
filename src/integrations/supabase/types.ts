export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      insurance_policies: {
        Row: {
          created_at: string | null
          data_source: string | null
          delay_threshold_hours: number
          id: string
          is_active: boolean | null
          nft_token_id: string | null
          order_id: string
          payout_amount_ink: number
          policy_name: string
          premium_ink: number
          trigger_condition: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours: number
          id?: string
          is_active?: boolean | null
          nft_token_id?: string | null
          order_id: string
          payout_amount_ink: number
          policy_name: string
          premium_ink: number
          trigger_condition: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours?: number
          id?: string
          is_active?: boolean | null
          nft_token_id?: string | null
          order_id?: string
          payout_amount_ink?: number
          policy_name?: string
          premium_ink?: number
          trigger_condition?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_matches: {
        Row: {
          cargo_order_id: string
          created_at: string | null
          id: string
          match_price_ink: number
          status: string | null
          updated_at: string | null
          vessel_order_id: string
        }
        Insert: {
          cargo_order_id: string
          created_at?: string | null
          id?: string
          match_price_ink: number
          status?: string | null
          updated_at?: string | null
          vessel_order_id: string
        }
        Update: {
          cargo_order_id?: string
          created_at?: string | null
          id?: string
          match_price_ink?: number
          status?: string | null
          updated_at?: string | null
          vessel_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_matches_cargo_order_id_fkey"
            columns: ["cargo_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_matches_vessel_order_id_fkey"
            columns: ["vessel_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          arrival_date: string | null
          cargo_type: Database["public"]["Enums"]["cargo_type"] | null
          created_at: string | null
          departure_date: string
          description: string | null
          destination_port: string
          id: string
          is_insured: boolean | null
          nft_token_id: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          price_ink: number
          status: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at: string | null
          user_id: string | null
          vessel_type: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm: number | null
          weight_tons: number | null
        }
        Insert: {
          arrival_date?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          created_at?: string | null
          departure_date: string
          description?: string | null
          destination_port: string
          id?: string
          is_insured?: boolean | null
          nft_token_id?: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          price_ink: number
          status?: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm?: number | null
          weight_tons?: number | null
        }
        Update: {
          arrival_date?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          created_at?: string | null
          departure_date?: string
          description?: string | null
          destination_port?: string
          id?: string
          is_insured?: boolean | null
          nft_token_id?: string | null
          order_type?: Database["public"]["Enums"]["order_type"]
          origin_port?: string
          price_ink?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm?: number | null
          weight_tons?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          wallet_address?: string | null
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
      cargo_type:
        | "dry_bulk"
        | "liquid_bulk"
        | "container"
        | "breakbulk"
        | "project_cargo"
      order_status: "pending" | "active" | "matched" | "completed" | "cancelled"
      order_type: "cargo" | "vessel"
      vessel_type:
        | "bulk_carrier"
        | "tanker"
        | "container_ship"
        | "general_cargo"
        | "ro_ro"
        | "lng_carrier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cargo_type: [
        "dry_bulk",
        "liquid_bulk",
        "container",
        "breakbulk",
        "project_cargo",
      ],
      order_status: ["pending", "active", "matched", "completed", "cancelled"],
      order_type: ["cargo", "vessel"],
      vessel_type: [
        "bulk_carrier",
        "tanker",
        "container_ship",
        "general_cargo",
        "ro_ro",
        "lng_carrier",
      ],
    },
  },
} as const
