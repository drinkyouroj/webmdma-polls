// This file will be replaced with generated types from Supabase
// For now, we'll define a basic structure to work with

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
        };
      };
      polls: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_by: string;
          is_public: boolean;
          allow_comments: boolean;
          closes_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_by: string;
          is_public?: boolean;
          allow_comments?: boolean;
          closes_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_public?: boolean;
          allow_comments?: boolean;
          closes_at?: string | null;
        };
      };
      options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
        };
        Update: {
          id?: string;
          text?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
        };
        Update: {
          option_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
    };
  };
};