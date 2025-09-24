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
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
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
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_favorite_list: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_favorite_list?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_favorite_list?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          magic_item_id: string
          sort_order: number
          added_at: string
        }
        Insert: {
          id?: string
          list_id: string
          magic_item_id: string
          sort_order?: number
          added_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          magic_item_id?: string
          sort_order?: number
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
      roll_tables: {
        Row: {
          id: string
          user_id: string | null
          source_list_id: string | null
          name: string
          die_size: number
          share_token: string
          is_public: boolean
          table_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          source_list_id?: string | null
          name: string
          die_size: number
          share_token: string
          is_public?: boolean
          table_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          source_list_id?: string | null
          name?: string
          die_size?: number
          share_token?: string
          is_public?: boolean
          table_data?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roll_tables_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roll_tables_source_list_id_fkey"
            columns: ["source_list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          magic_item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          magic_item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          magic_item_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      magic_items: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          traits: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          slug: string
          description: string
          traits?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          traits?: Json
          created_at?: string
          updated_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}