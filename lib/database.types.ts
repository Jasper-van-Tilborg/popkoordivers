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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activiteit: {
        Row: {
          actie: string
          id: number
          item_id: string | null
          item_naam: string | null
          soort: string
          wanneer: string
          wie: string | null
          wie_naam: string | null
        }
        Insert: {
          actie: string
          id?: never
          item_id?: string | null
          item_naam?: string | null
          soort: string
          wanneer?: string
          wie?: string | null
          wie_naam?: string | null
        }
        Update: {
          actie?: string
          id?: never
          item_id?: string | null
          item_naam?: string | null
          soort?: string
          wanneer?: string
          wie?: string | null
          wie_naam?: string | null
        }
        Relationships: []
      }
      agenda: {
        Row: {
          beschrijving: string | null
          created_at: string
          datum: string
          datum_sorteer: string | null
          fotos_url: string | null
          gepubliceerd: boolean
          id: number
          link: string | null
          locatie: string | null
          tijd: string | null
          titel: string
        }
        Insert: {
          beschrijving?: string | null
          created_at?: string
          datum: string
          datum_sorteer?: string | null
          fotos_url?: string | null
          gepubliceerd?: boolean
          id?: never
          link?: string | null
          locatie?: string | null
          tijd?: string | null
          titel: string
        }
        Update: {
          beschrijving?: string | null
          created_at?: string
          datum?: string
          datum_sorteer?: string | null
          fotos_url?: string | null
          gepubliceerd?: boolean
          id?: never
          link?: string | null
          locatie?: string | null
          tijd?: string | null
          titel?: string
        }
        Relationships: []
      }
      albums: {
        Row: {
          created_at: string | null
          datum: string
          id: string
          slug: string
          titel: string
          volgorde: number | null
        }
        Insert: {
          created_at?: string | null
          datum: string
          id?: string
          slug: string
          titel: string
          volgorde?: number | null
        }
        Update: {
          created_at?: string | null
          datum?: string
          id?: string
          slug?: string
          titel?: string
          volgorde?: number | null
        }
        Relationships: []
      }
      berichten: {
        Row: {
          afbeelding: string
          categorie: string
          created_at: string
          datum: string
          gepubliceerd: boolean
          id: number
          inhoud: string
          intro: string
          slug: string
          titel: string
        }
        Insert: {
          afbeelding: string
          categorie?: string
          created_at?: string
          datum: string
          gepubliceerd?: boolean
          id?: never
          inhoud: string
          intro: string
          slug: string
          titel: string
        }
        Update: {
          afbeelding?: string
          categorie?: string
          created_at?: string
          datum?: string
          gepubliceerd?: boolean
          id?: never
          inhoud?: string
          intro?: string
          slug?: string
          titel?: string
        }
        Relationships: []
      }
      bestanden: {
        Row: {
          categorie: string
          created_at: string
          id: number
          naam: string
          r2_key: string
          stemgroep: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Insert: {
          categorie: string
          created_at?: string
          id?: never
          naam: string
          r2_key: string
          stemgroep?: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Update: {
          categorie?: string
          created_at?: string
          id?: never
          naam?: string
          r2_key?: string
          stemgroep?: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Relationships: []
      }
      fotos: {
        Row: {
          album_id: string
          created_at: string | null
          id: string
          impressies: boolean | null
          r2_key: string
          volgorde: number | null
        }
        Insert: {
          album_id: string
          created_at?: string | null
          id?: string
          impressies?: boolean | null
          r2_key: string
          volgorde?: number | null
        }
        Update: {
          album_id?: string
          created_at?: string | null
          id?: string
          impressies?: boolean | null
          r2_key?: string
          volgorde?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fotos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bestuursfunctie: string | null
          created_at: string
          email: string | null
          id: string
          in_smoelenboek: boolean
          naam: string | null
          rol: Database["public"]["Enums"]["user_rol"]
          stemgroep: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Insert: {
          bestuursfunctie?: string | null
          created_at?: string
          email?: string | null
          id: string
          in_smoelenboek?: boolean
          naam?: string | null
          rol?: Database["public"]["Enums"]["user_rol"]
          stemgroep?: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Update: {
          bestuursfunctie?: string | null
          created_at?: string
          email?: string | null
          id?: string
          in_smoelenboek?: boolean
          naam?: string | null
          rol?: Database["public"]["Enums"]["user_rol"]
          stemgroep?: Database["public"]["Enums"]["stemgroep_type"] | null
        }
        Relationships: []
      }
      website_instellingen: {
        Row: {
          email: string
          facebook: string
          id: number
          instagram: string
          repetitie_adres: string
          repetitie_dag: string
          repetitie_locatie: string
          repetitie_tijd: string
          sponsorkliks: string
          updated_at: string
          youtube: string
        }
        Insert: {
          email?: string
          facebook?: string
          id?: number
          instagram?: string
          repetitie_adres?: string
          repetitie_dag?: string
          repetitie_locatie?: string
          repetitie_tijd?: string
          sponsorkliks?: string
          updated_at?: string
          youtube?: string
        }
        Update: {
          email?: string
          facebook?: string
          id?: number
          instagram?: string
          repetitie_adres?: string
          repetitie_dag?: string
          repetitie_locatie?: string
          repetitie_tijd?: string
          sponsorkliks?: string
          updated_at?: string
          youtube?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rol: {
        Args: never
        Returns: Database["public"]["Enums"]["user_rol"]
      }
      mag_beheren: { Args: never; Returns: boolean }
      sitestatus: { Args: never; Returns: Json }
    }
    Enums: {
      stemgroep_type: "Alt" | "Mezzo" | "Sopraan" | "Tenor" | "Bas"
      user_rol: "lid" | "redacteur" | "admin"
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
      stemgroep_type: ["Alt", "Mezzo", "Sopraan", "Tenor", "Bas"],
      user_rol: ["lid", "redacteur", "admin"],
    },
  },
} as const
