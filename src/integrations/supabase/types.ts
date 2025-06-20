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
      order_matches: {
        Row: {
          agreed_price: number | null
          cargo_order_id: string | null
          contract_terms: string | null
          id: string
          matched_at: string | null
          status: string | null
          vessel_order_id: string | null
        }
        Insert: {
          agreed_price?: number | null
          cargo_order_id?: string | null
          contract_terms?: string | null
          id?: string
          matched_at?: string | null
          status?: string | null
          vessel_order_id?: string | null
        }
        Update: {
          agreed_price?: number | null
          cargo_order_id?: string | null
          contract_terms?: string | null
          id?: string
          matched_at?: string | null
          status?: string | null
          vessel_order_id?: string | null
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
          cargo_volume: number | null
          cargo_weight: number | null
          created_at: string | null
          currency: string | null
          departure_date: string | null
          description: string | null
          destination_port: string
          id: string
          nft_contract_address: string | null
          nft_minted: boolean | null
          nft_token_id: string | null
          nft_transaction_hash: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          price: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at: string | null
          user_id: string
          vessel_beam: number | null
          vessel_dwt: number | null
          vessel_length: number | null
          vessel_type: Database["public"]["Enums"]["vessel_type"] | null
        }
        Insert: {
          arrival_date?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          cargo_volume?: number | null
          cargo_weight?: number | null
          created_at?: string | null
          currency?: string | null
          departure_date?: string | null
          description?: string | null
          destination_port: string
          id?: string
          nft_contract_address?: string | null
          nft_minted?: boolean | null
          nft_token_id?: string | null
          nft_transaction_hash?: string | null
          order_type: Database["public"]["Enums"]["order_type"]
          origin_port: string
          price?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
          vessel_beam?: number | null
          vessel_dwt?: number | null
          vessel_length?: number | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
        }
        Update: {
          arrival_date?: string | null
          cargo_type?: Database["public"]["Enums"]["cargo_type"] | null
          cargo_volume?: number | null
          cargo_weight?: number | null
          created_at?: string | null
          currency?: string | null
          departure_date?: string | null
          description?: string | null
          destination_port?: string
          id?: string
          nft_contract_address?: string | null
          nft_minted?: boolean | null
          nft_token_id?: string | null
          nft_transaction_hash?: string | null
          order_type?: Database["public"]["Enums"]["order_type"]
          origin_port?: string
          price?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          vessel_beam?: number | null
          vessel_dwt?: number | null
          vessel_length?: number | null
          vessel_type?: Database["public"]["Enums"]["vessel_type"] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
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
