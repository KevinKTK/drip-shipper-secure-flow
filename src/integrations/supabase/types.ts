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
      carrier_routes: {
        Row: {
          arrival_date: string | null
          available_capacity_kg: number | null
          carrier_wallet_address: string | null
          created_at: string | null
          departure_date: string
          destination_port: string
          id: string
          journey_nft_contract_address: string | null
          nft_transaction_hash: string | null
          origin_port: string
          price_eth: number | null
          updated_at: string | null
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          arrival_date?: string | null
          available_capacity_kg?: number | null
          carrier_wallet_address?: string | null
          created_at?: string | null
          departure_date: string
          destination_port: string
          id?: string
          journey_nft_contract_address?: string | null
          nft_transaction_hash?: string | null
          origin_port: string
          price_eth?: number | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          arrival_date?: string | null
          available_capacity_kg?: number | null
          carrier_wallet_address?: string | null
          created_at?: string | null
          departure_date?: string
          destination_port?: string
          id?: string
          journey_nft_contract_address?: string | null
          nft_transaction_hash?: string | null
          origin_port?: string
          price_eth?: number | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_carrier_routes_vessel_id"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          created_at: string | null
          data_source: string | null
          delay_threshold_hours: number
          id: string
          insurance_manager_contract_address: string | null
          is_active: boolean | null
          nft_token_id: string | null
          order_id: string
          payout_amount_eth: number
          policy_name: string
          premium_eth: number
          trigger_condition: string
          updated_at: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours: number
          id?: string
          insurance_manager_contract_address?: string | null
          is_active?: boolean | null
          nft_token_id?: string | null
          order_id: string
          payout_amount_eth: number
          policy_name: string
          premium_eth: number
          trigger_condition: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours?: number
          id?: string
          insurance_manager_contract_address?: string | null
          is_active?: boolean | null
          nft_token_id?: string | null
          order_id?: string
          payout_amount_eth?: number
          policy_name?: string
          premium_eth?: number
          trigger_condition?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string | null
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
      insurance_templates: {
        Row: {
          created_at: string | null
          data_source: string | null
          delay_threshold_hours: number | null
          description: string | null
          id: string
          is_active: boolean | null
          payout_amount_eth: number
          policy_name: string
          policy_type: Database["public"]["Enums"]["insurance_policy_type"]
          premium_eth: number
          trigger_condition: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          payout_amount_eth: number
          policy_name: string
          policy_type: Database["public"]["Enums"]["insurance_policy_type"]
          premium_eth: number
          trigger_condition: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          payout_amount_eth?: number
          policy_name?: string
          policy_type?: Database["public"]["Enums"]["insurance_policy_type"]
          premium_eth?: number
          trigger_condition?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_matches: {
        Row: {
          brokerage_contract_address: string | null
          cargo_order_id: string
          created_at: string | null
          id: string
          journey_manager_contract_address: string | null
          match_price_eth: number
          status: string | null
          updated_at: string | null
          vessel_order_id: string
        }
        Insert: {
          brokerage_contract_address?: string | null
          cargo_order_id: string
          created_at?: string | null
          id?: string
          journey_manager_contract_address?: string | null
          match_price_eth: number
          status?: string | null
          updated_at?: string | null
          vessel_order_id: string
        }
        Update: {
          brokerage_contract_address?: string | null
          cargo_order_id?: string
          created_at?: string | null
          id?: string
          journey_manager_contract_address?: string | null
          match_price_eth?: number
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
          actual_delivery_timestamp: string | null
          arrival_date: string | null
          brokerage_contract_address: string | null
          cargo_nft_contract_address: string | null
          cargo_type: Database["public"]["Enums"]["cargo_type"] | null
          created_at: string | null
          departure_date: string
          description: string | null
          destination_port: string
          expected_delivery_timestamp: string | null
          id: string
          insurance_manager_contract_address: string | null
          is_insured: boolean | null
          is_penalty_applied: boolean | null
          journey_manager_contract_address: string | null
          max_penalty_percentage: number | null
          nft_contract_address: string | null
          nft_token_id: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          penalty_amount_eth: number | null
          penalty_rate_per_day: number | null
          price_eth: number
          selected_insurance_policy_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at: string | null
          user_id: string | null
          user_insurance_policy_id: string | null
          vessel_nft_contract_address: string | null
          vessel_type: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm: number | null
          wallet_address: string | null
          weight_tons: number | null
        }
        Insert: {
          actual_delivery_timestamp?: string | null
          arrival_date?: string | null
          brokerage_contract_address?: string | null
          cargo_nft_contract_address?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          created_at?: string | null
          departure_date: string
          description?: string | null
          destination_port: string
          expected_delivery_timestamp?: string | null
          id?: string
          insurance_manager_contract_address?: string | null
          is_insured?: boolean | null
          is_penalty_applied?: boolean | null
          journey_manager_contract_address?: string | null
          max_penalty_percentage?: number | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          penalty_amount_eth?: number | null
          penalty_rate_per_day?: number | null
          price_eth: number
          selected_insurance_policy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          user_insurance_policy_id?: string | null
          vessel_nft_contract_address?: string | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm?: number | null
          wallet_address?: string | null
          weight_tons?: number | null
        }
        Update: {
          actual_delivery_timestamp?: string | null
          arrival_date?: string | null
          brokerage_contract_address?: string | null
          cargo_nft_contract_address?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          created_at?: string | null
          departure_date?: string
          description?: string | null
          destination_port?: string
          expected_delivery_timestamp?: string | null
          id?: string
          insurance_manager_contract_address?: string | null
          is_insured?: boolean | null
          is_penalty_applied?: boolean | null
          journey_manager_contract_address?: string | null
          max_penalty_percentage?: number | null
          nft_contract_address?: string | null
          nft_token_id?: string | null
          order_type?: Database["public"]["Enums"]["order_type"]
          origin_port?: string
          penalty_amount_eth?: number | null
          penalty_rate_per_day?: number | null
          price_eth?: number
          selected_insurance_policy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          user_insurance_policy_id?: string | null
          vessel_nft_contract_address?: string | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
          volume_cbm?: number | null
          wallet_address?: string | null
          weight_tons?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_insurance_policy"
            columns: ["selected_insurance_policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_insurance_policy_id_fkey"
            columns: ["user_insurance_policy_id"]
            isOneToOne: false
            referencedRelation: "user_insurance_policies"
            referencedColumns: ["id"]
          },
        ]
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
      smart_contracts: {
        Row: {
          abi_hash: string | null
          contract_address: string
          contract_name: string
          created_at: string | null
          deployed_at: string | null
          id: string
          is_active: boolean | null
          network: string
          updated_at: string | null
        }
        Insert: {
          abi_hash?: string | null
          contract_address: string
          contract_name: string
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          is_active?: boolean | null
          network?: string
          updated_at?: string | null
        }
        Update: {
          abi_hash?: string | null
          contract_address?: string
          contract_name?: string
          created_at?: string | null
          deployed_at?: string | null
          id?: string
          is_active?: boolean | null
          network?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_insurance_policies: {
        Row: {
          cargo_damage_threshold_percentage: number | null
          created_at: string | null
          data_source: string | null
          delay_threshold_hours: number
          description: string | null
          id: string
          is_active: boolean | null
          payout_amount_eth: number
          policy_name: string
          policy_type: string | null
          premium_eth: number
          trigger_condition: string
          updated_at: string | null
          user_id: string | null
          wallet_address: string
        }
        Insert: {
          cargo_damage_threshold_percentage?: number | null
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          payout_amount_eth: number
          policy_name: string
          policy_type?: string | null
          premium_eth: number
          trigger_condition?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address: string
        }
        Update: {
          cargo_damage_threshold_percentage?: number | null
          created_at?: string | null
          data_source?: string | null
          delay_threshold_hours?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          payout_amount_eth?: number
          policy_name?: string
          policy_type?: string | null
          premium_eth?: number
          trigger_condition?: string
          updated_at?: string | null
          user_id?: string | null
          wallet_address?: string
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
        | "container"
        | "dry_bulk"
        | "liquid_bulk"
        | "breakbulk"
        | "project_cargo"
        | "reefer"
      insurance_policy_type: "shipper" | "carrier"
      order_status: "pending" | "active" | "matched" | "completed" | "cancelled"
      order_type: "cargo" | "vessel"
      vessel_type:
        | "container_ship"
        | "bulk_carrier"
        | "tanker"
        | "ro_ro"
        | "general_cargo"
        | "lng_carrier"
        | "lpg_carrier"
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
        "container",
        "dry_bulk",
        "liquid_bulk",
        "breakbulk",
        "project_cargo",
        "reefer",
      ],
      insurance_policy_type: ["shipper", "carrier"],
      order_status: ["pending", "active", "matched", "completed", "cancelled"],
      order_type: ["cargo", "vessel"],
      vessel_type: [
        "container_ship",
        "bulk_carrier",
        "tanker",
        "ro_ro",
        "general_cargo",
        "lng_carrier",
        "lpg_carrier",
      ],
    },
  },
} as const
