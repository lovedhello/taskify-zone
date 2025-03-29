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
      amenities: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          listing_type: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          listing_type?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          listing_type?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          listing_id: string | null
          listing_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          listing_id?: string | null
          listing_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          listing_id?: string | null
          listing_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_experience_amenities: {
        Row: {
          amenity_id: string
          created_at: string | null
          experience_id: string
          id: string
        }
        Insert: {
          amenity_id: string
          created_at?: string | null
          experience_id: string
          id?: string
        }
        Update: {
          amenity_id?: string
          created_at?: string | null
          experience_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_experience_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_experience_amenities_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      food_experience_availability: {
        Row: {
          available_spots: number
          created_at: string | null
          date: string
          end_time: string
          experience_id: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          available_spots: number
          created_at?: string | null
          date: string
          end_time: string
          experience_id: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          available_spots?: number
          created_at?: string | null
          date?: string
          end_time?: string
          experience_id?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_experience_availability_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      food_experience_bookings: {
        Row: {
          availability_id: string
          created_at: string | null
          experience_id: string
          guest_count: number
          id: string
          status: string
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_id: string
          created_at?: string | null
          experience_id: string
          guest_count: number
          id?: string
          status?: string
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_id?: string
          created_at?: string | null
          experience_id?: string
          guest_count?: number
          id?: string
          status?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_experience_bookings_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "food_experience_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_experience_bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_experience_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_experience_images: {
        Row: {
          created_at: string | null
          display_order: number
          experience_id: string
          id: string
          image_path: string
          is_primary: boolean | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          experience_id: string
          id?: string
          image_path: string
          is_primary?: boolean | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          experience_id?: string
          id?: string
          image_path?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "food_experience_images_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "food_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      food_experiences: {
        Row: {
          address: string
          city: string
          created_at: string | null
          cuisine_type: string
          description: string
          duration: string | null
          host_id: string
          id: string
          is_featured: boolean | null
          language: string | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number | null
          menu_description: string
          price_per_person: number
          rating: number | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          cuisine_type: string
          description: string
          duration?: string | null
          host_id: string
          id?: string
          is_featured?: boolean | null
          language?: string | null
          latitude: number
          location_name: string
          longitude: number
          max_guests?: number | null
          menu_description: string
          price_per_person: number
          rating?: number | null
          state: string
          status?: string | null
          title: string
          updated_at?: string | null
          zipcode: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          cuisine_type?: string
          description?: string
          duration?: string | null
          host_id?: string
          id?: string
          is_featured?: boolean | null
          language?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          max_guests?: number | null
          menu_description?: string
          price_per_person?: number
          rating?: number | null
          state?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          zipcode?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_experiences_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: number
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: number
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: number
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          is_host: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          is_admin?: boolean | null
          is_host?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          is_host?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          comment: string | null
          content: string
          created_at: string | null
          id: string
          rating: number
          target_id: string
          target_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_id: string
          comment?: string | null
          content: string
          created_at?: string | null
          id?: string
          rating: number
          target_id: string
          target_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string
          comment?: string | null
          content?: string
          created_at?: string | null
          id?: string
          rating?: number
          target_id?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_amenities: {
        Row: {
          amenity_id: string
          created_at: string | null
          id: string
          stay_id: string
        }
        Insert: {
          amenity_id: string
          created_at?: string | null
          id?: string
          stay_id: string
        }
        Update: {
          amenity_id?: string
          created_at?: string | null
          id?: string
          stay_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_amenities_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_available: boolean | null
          price_override: number | null
          stay_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          stay_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          stay_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stay_availability_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string | null
          guest_count: number
          id: string
          status: string
          stay_id: string
          total_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string | null
          guest_count: number
          id?: string
          status?: string
          stay_id: string
          total_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string | null
          guest_count?: number
          id?: string
          status?: string
          stay_id?: string
          total_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_bookings_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_images: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          image_path: string
          is_primary: boolean | null
          stay_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_path: string
          is_primary?: boolean | null
          stay_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_path?: string
          is_primary?: boolean | null
          stay_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_images_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          stay_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          stay_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          stay_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_reviews_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
      stays: {
        Row: {
          address: string | null
          amenities: string | null
          bathrooms: number
          bedrooms: number
          beds: number | null
          city: string | null
          created_at: string | null
          description: string
          host_id: string
          id: string
          is_featured: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number
          price_per_night: number
          property_type: string | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }
        Insert: {
          address?: string | null
          amenities?: string | null
          bathrooms: number
          bedrooms: number
          beds?: number | null
          city?: string | null
          created_at?: string | null
          description: string
          host_id: string
          id?: string
          is_featured?: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number
          price_per_night: number
          property_type?: string | null
          state: string
          status?: string | null
          title: string
          updated_at?: string | null
          zipcode: string
        }
        Update: {
          address?: string | null
          amenities?: string | null
          bathrooms?: number
          bedrooms?: number
          beds?: number | null
          city?: string | null
          created_at?: string | null
          description?: string
          host_id?: string
          id?: string
          is_featured?: boolean | null
          latitude?: number
          location_name?: string
          longitude?: number
          max_guests?: number
          price_per_night?: number
          property_type?: string | null
          state?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          zipcode?: string
        }
        Relationships: [
          {
            foreignKeyName: "stays_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          stay_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          stay_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          stay_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      calculate_stay_booking_price: {
        Args: {
          stay_id: string
          check_in: string
          check_out: string
        }
        Returns: number
      }
      check_food_experience_availability: {
        Args: {
          experience_id: string
          requested_date: string
          guests?: number
        }
        Returns: {
          availability_id: string
          start_time: string
          end_time: string
          available_spots: number
        }[]
      }
      check_stay_availability: {
        Args: {
          stay_id: string
          check_in: string
          check_out: string
        }
        Returns: boolean
      }
      current_user_is_in_conversation: {
        Args: {
          p_conversation_id: string
        }
        Returns: boolean
      }
      get_conversation_by_id: {
        Args: {
          conversation_id_param: string
        }
        Returns: Json
      }
      get_host_food_experiences: {
        Args: {
          host_id: string
        }
        Returns: {
          address: string
          city: string
          created_at: string | null
          cuisine_type: string
          description: string
          duration: string | null
          host_id: string
          id: string
          is_featured: boolean | null
          language: string | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number | null
          menu_description: string
          price_per_person: number
          rating: number | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }[]
      }
      get_host_stays: {
        Args: {
          host_id: string
        }
        Returns: {
          address: string | null
          amenities: string | null
          bathrooms: number
          bedrooms: number
          beds: number | null
          city: string | null
          created_at: string | null
          description: string
          host_id: string
          id: string
          is_featured: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number
          price_per_night: number
          property_type: string | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }[]
      }
      get_messages_with_senders: {
        Args: {
          conversation_id_param: string
          limit_param?: number
          offset_param?: number
        }
        Returns: Json
      }
      get_user_conversations_with_details: {
        Args: {
          user_id_param: string
        }
        Returns: Json
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      nearby_food_experiences: {
        Args: {
          lat: number
          lng: number
          radius_km?: number
          max_results?: number
        }
        Returns: {
          address: string
          city: string
          created_at: string | null
          cuisine_type: string
          description: string
          duration: string | null
          host_id: string
          id: string
          is_featured: boolean | null
          language: string | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number | null
          menu_description: string
          price_per_person: number
          rating: number | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }[]
      }
      nearby_stays: {
        Args: {
          lat: number
          lng: number
          radius_km?: number
          max_results?: number
        }
        Returns: {
          address: string | null
          amenities: string | null
          bathrooms: number
          bedrooms: number
          beds: number | null
          city: string | null
          created_at: string | null
          description: string
          host_id: string
          id: string
          is_featured: boolean | null
          latitude: number
          location_name: string
          longitude: number
          max_guests: number
          price_per_night: number
          property_type: string | null
          state: string
          status: string | null
          title: string
          updated_at: string | null
          zipcode: string
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
