export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sentences: {
        Row: {
          category: string;
          created_at: string;
          difficulty: number | null;
          english: string;
          id: string;
          vietnamese: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          difficulty?: number | null;
          english: string;
          id?: string;
          vietnamese: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          difficulty?: number | null;
          english?: string;
          id?: string;
          vietnamese?: string;
        };
        Relationships: [];
      };
      metric_settings: {
        Row: {
          id: string;
          ideal_threshold: number;
          max_threshold: number;
          method: string | null;
          metric_id: string;
          min_threshold: number;
          updated_at: string;
          weight: number;
        };
        Insert: {
          id?: string;
          ideal_threshold: number;
          max_threshold: number;
          method?: string | null;
          metric_id: string;
          min_threshold: number;
          updated_at?: string;
          weight?: number;
        };
        Update: {
          id?: string;
          ideal_threshold?: number;
          max_threshold?: number;
          method?: string | null;
          metric_id?: string;
          min_threshold?: number;
          updated_at?: string;
          weight?: number;
        };
        Relationships: [];
      };
      display_settings: {
        Row: {
          good_threshold: number;
          id: string;
          powerful_threshold: number;
          quiet_threshold: number;
          sensitivity: number;
          setting_key: string;
          updated_at: string;
        };
        Insert: {
          good_threshold?: number;
          id?: string;
          powerful_threshold?: number;
          quiet_threshold?: number;
          sensitivity?: number;
          setting_key: string;
          updated_at?: string;
        };
        Update: {
          good_threshold?: number;
          id?: string;
          powerful_threshold?: number;
          quiet_threshold?: number;
          sensitivity?: number;
          setting_key?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      practice_results: {
        Row: {
          acceleration_score: number | null;
          blink_rate: number | null;
          clarity_score: number | null;
          created_at: string;
          device_id: string | null;
          device_label: string | null;
          duration_seconds: number;
          display_name: string | null;
          energy_score: number | null;
          eye_contact_score: number | null;
          hand_movement_score: number | null;
          id: string;
          pace_score: number | null;
          response_time_ms: number | null;
          response_time_score: number | null;
          score: number;
          session_id: string;
          sentence_id: string | null;
          speech_ratio: number | null;
          volume_avg: number | null;
          words_per_minute: number | null;
        };
        Insert: {
          acceleration_score?: number | null;
          blink_rate?: number | null;
          clarity_score?: number | null;
          created_at?: string;
          device_id?: string | null;
          device_label?: string | null;
          duration_seconds: number;
          display_name?: string | null;
          energy_score?: number | null;
          eye_contact_score?: number | null;
          hand_movement_score?: number | null;
          id?: string;
          pace_score?: number | null;
          response_time_ms?: number | null;
          response_time_score?: number | null;
          score: number;
          session_id?: string;
          sentence_id?: string | null;
          speech_ratio?: number | null;
          volume_avg?: number | null;
          words_per_minute?: number | null;
        };
        Update: {
          acceleration_score?: number | null;
          blink_rate?: number | null;
          clarity_score?: number | null;
          created_at?: string;
          device_id?: string | null;
          device_label?: string | null;
          duration_seconds?: number;
          display_name?: string | null;
          energy_score?: number | null;
          eye_contact_score?: number | null;
          hand_movement_score?: number | null;
          id?: string;
          pace_score?: number | null;
          response_time_ms?: number | null;
          response_time_score?: number | null;
          score?: number;
          session_id?: string;
          sentence_id?: string | null;
          speech_ratio?: number | null;
          volume_avg?: number | null;
          words_per_minute?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'practice_results_sentence_id_fkey';
            columns: ['sentence_id'];
            isOneToOne: false;
            referencedRelation: 'sentences';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
