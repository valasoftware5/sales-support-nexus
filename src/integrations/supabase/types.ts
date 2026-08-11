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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          id: string
          meta_json: Json | null
          module: string
          role: Database["public"]["Enums"]["app_role"] | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          meta_json?: Json | null
          module: string
          role?: Database["public"]["Enums"]["app_role"] | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          meta_json?: Json | null
          module?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_text: string
          condition_text: string | null
          created_at: string
          id: string
          is_enabled: boolean
          last_run_at: string | null
          name: string
          runs_count: number
          scope: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          action_text: string
          condition_text?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name: string
          runs_count?: number
          scope?: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          action_text?: string
          condition_text?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          name?: string
          runs_count?: number
          scope?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      blackbox_events: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          geo_location: string | null
          id: string
          ip_address: string | null
          is_sealed: boolean
          metadata: Json | null
          module_name: string
          risk_score: number | null
          role_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          geo_location?: string | null
          id?: string
          ip_address?: string | null
          is_sealed?: boolean
          metadata?: Json | null
          module_name: string
          risk_score?: number | null
          role_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          geo_location?: string | null
          id?: string
          ip_address?: string | null
          is_sealed?: boolean
          metadata?: Json | null
          module_name?: string
          risk_score?: number | null
          role_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bot_conversation_logs: {
        Row: {
          bot_id: string | null
          confidence: number | null
          created_at: string
          id: string
          intent: string | null
          language: string
          message_count: number
          outcome: string
          session_id: string | null
        }
        Insert: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          language?: string
          message_count?: number
          outcome?: string
          session_id?: string | null
        }
        Update: {
          bot_id?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          intent?: string | null
          language?: string
          message_count?: number
          outcome?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_conversation_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_conversation_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_languages: {
        Row: {
          code: string
          conversations: number
          coverage: number
          created_at: string
          id: string
          is_enabled: boolean
          name: string
        }
        Insert: {
          code: string
          conversations?: number
          coverage?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          name: string
        }
        Update: {
          code?: string
          conversations?: number
          coverage?: number
          created_at?: string
          id?: string
          is_enabled?: boolean
          name?: string
        }
        Relationships: []
      }
      bot_training_documents: {
        Row: {
          accuracy: number
          bot_id: string | null
          chunks: number
          created_at: string
          id: string
          last_trained_at: string | null
          source_type: string
          status: string
          title: string
        }
        Insert: {
          accuracy?: number
          bot_id?: string | null
          chunks?: number
          created_at?: string
          id?: string
          last_trained_at?: string | null
          source_type?: string
          status?: string
          title: string
        }
        Update: {
          accuracy?: number
          bot_id?: string | null
          chunks?: number
          created_at?: string
          id?: string
          last_trained_at?: string | null
          source_type?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_training_documents_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string | null
          caller_name: string
          created_at: string
          customer_id: string | null
          direction: string
          duration_seconds: number
          id: string
          notes: string | null
          phone: string
          started_at: string
          status: string
          wait_seconds: number
        }
        Insert: {
          agent_id?: string | null
          caller_name: string
          created_at?: string
          customer_id?: string | null
          direction?: string
          duration_seconds?: number
          id?: string
          notes?: string | null
          phone: string
          started_at?: string
          status?: string
          wait_seconds?: number
        }
        Update: {
          agent_id?: string | null
          caller_name?: string
          created_at?: string
          customer_id?: string | null
          direction?: string
          duration_seconds?: number
          id?: string
          notes?: string | null
          phone?: string
          started_at?: string
          status?: string
          wait_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      canned_responses: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          shortcut: string | null
          title: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          shortcut?: string | null
          title: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          shortcut?: string | null
          title?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_name: string | null
          sender_type: string
          session_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_type?: string
          session_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_name?: string | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          agent_id: string | null
          channel: string
          created_at: string
          ended_at: string | null
          handled_by: string
          id: string
          language: string
          sentiment: string
          started_at: string
          status: string
          unread_count: number
          visitor_email: string | null
          visitor_name: string
        }
        Insert: {
          agent_id?: string | null
          channel?: string
          created_at?: string
          ended_at?: string | null
          handled_by?: string
          id?: string
          language?: string
          sentiment?: string
          started_at?: string
          status?: string
          unread_count?: number
          visitor_email?: string | null
          visitor_name: string
        }
        Update: {
          agent_id?: string | null
          channel?: string
          created_at?: string
          ended_at?: string | null
          handled_by?: string
          id?: string
          language?: string
          sentiment?: string
          started_at?: string
          status?: string
          unread_count?: number
          visitor_email?: string | null
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          channel: string
          conversations: number
          created_at: string
          escalation_rate: number
          id: string
          language: string
          name: string
          purpose: string | null
          resolution_rate: number
          status: string
          updated_at: string
        }
        Insert: {
          channel?: string
          conversations?: number
          created_at?: string
          escalation_rate?: number
          id?: string
          language?: string
          name: string
          purpose?: string | null
          resolution_rate?: number
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          conversations?: number
          created_at?: string
          escalation_rate?: number
          id?: string
          language?: string
          name?: string
          purpose?: string | null
          resolution_rate?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_customers: {
        Row: {
          company_name: string
          contact_name: string
          country: string | null
          created_at: string
          email: string
          health_score: number
          id: string
          industry: string | null
          last_contact_at: string | null
          lifetime_value: number
          open_tickets: number
          owner_id: string | null
          phone: string | null
          plan: string
          status: string
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_name: string
          country?: string | null
          created_at?: string
          email: string
          health_score?: number
          id?: string
          industry?: string | null
          last_contact_at?: string | null
          lifetime_value?: number
          open_tickets?: number
          owner_id?: string | null
          phone?: string | null
          plan?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          country?: string | null
          created_at?: string
          email?: string
          health_score?: number
          id?: string
          industry?: string | null
          last_contact_at?: string | null
          lifetime_value?: number
          open_tickets?: number
          owner_id?: string | null
          phone?: string | null
          plan?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_customers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          created_at: string
          customer_id: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          owner_id: string | null
          priority: string
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          preview: string | null
          priority: string
          received_at: string
          status: string
          subject: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          preview?: string | null
          priority?: string
          received_at?: string
          status?: string
          subject: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          preview?: string | null
          priority?: string
          received_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_support_requests: {
        Row: {
          ai_suggested_solution: string | null
          assigned_to: string | null
          attachments: Json | null
          created_at: string
          description: string
          id: string
          priority: string | null
          request_type: string | null
          resolution_notes: string | null
          resolved_at: string | null
          response_time_minutes: number | null
          status: string | null
          subject: string
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          ai_suggested_solution?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          request_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          status?: string | null
          subject: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          ai_suggested_solution?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          request_type?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          response_time_minutes?: number | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      safe_assist_ai_logs: {
        Row: {
          action_recommended: string | null
          action_taken: string | null
          ai_analysis: Json | null
          auto_handled: boolean | null
          event_type: string
          id: string
          risk_level: string | null
          session_id: string | null
          timestamp: string
        }
        Insert: {
          action_recommended?: string | null
          action_taken?: string | null
          ai_analysis?: Json | null
          auto_handled?: boolean | null
          event_type: string
          id?: string
          risk_level?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          action_recommended?: string | null
          action_taken?: string | null
          ai_analysis?: Json | null
          auto_handled?: boolean | null
          event_type?: string
          id?: string
          risk_level?: string | null
          session_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "safe_assist_ai_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "safe_assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_assist_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          recipients: string[]
          session_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          recipients?: string[]
          session_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          recipients?: string[]
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safe_assist_alerts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "safe_assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_assist_events: {
        Row: {
          actor_type: string
          event_data: Json
          event_type: string
          id: string
          session_id: string
          timestamp: string
        }
        Insert: {
          actor_type: string
          event_data?: Json
          event_type: string
          id?: string
          session_id: string
          timestamp?: string
        }
        Update: {
          actor_type?: string
          event_data?: Json
          event_type?: string
          id?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "safe_assist_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "safe_assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_assist_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          notification_type: string
          read_at: string | null
          session_id: string | null
          severity: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          notification_type: string
          read_at?: string | null
          session_id?: string | null
          severity?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          notification_type?: string
          read_at?: string | null
          session_id?: string | null
          severity?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safe_assist_notifications_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "safe_assist_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_assist_sessions: {
        Row: {
          agent_device_fingerprint: string | null
          agent_entered_user_code: string | null
          agent_ip_address: string | null
          agent_masked_id: string | null
          agent_verification_code: string | null
          agent_watermark_text: string | null
          ai_flags: Json | null
          ai_monitoring_enabled: boolean | null
          ai_risk_score: number | null
          client_notified_at: string | null
          created_at: string
          dual_verified: boolean | null
          end_reason: string | null
          ended_at: string | null
          ended_by: string | null
          expires_at: string
          id: string
          is_recording_enabled: boolean
          max_duration_minutes: number
          mode: Database["public"]["Enums"]["remote_assist_mode"]
          recording_url: string | null
          session_code: string
          started_at: string | null
          status: Database["public"]["Enums"]["remote_assist_status"]
          support_agent_id: string | null
          support_agent_role: Database["public"]["Enums"]["app_role"] | null
          user_consent_at: string | null
          user_consent_given: boolean
          user_device_fingerprint: string | null
          user_entered_agent_code: string | null
          user_id: string
          user_ip_address: string | null
          user_role: Database["public"]["Enums"]["app_role"] | null
          user_verification_code: string | null
        }
        Insert: {
          agent_device_fingerprint?: string | null
          agent_entered_user_code?: string | null
          agent_ip_address?: string | null
          agent_masked_id?: string | null
          agent_verification_code?: string | null
          agent_watermark_text?: string | null
          ai_flags?: Json | null
          ai_monitoring_enabled?: boolean | null
          ai_risk_score?: number | null
          client_notified_at?: string | null
          created_at?: string
          dual_verified?: boolean | null
          end_reason?: string | null
          ended_at?: string | null
          ended_by?: string | null
          expires_at?: string
          id?: string
          is_recording_enabled?: boolean
          max_duration_minutes?: number
          mode?: Database["public"]["Enums"]["remote_assist_mode"]
          recording_url?: string | null
          session_code: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["remote_assist_status"]
          support_agent_id?: string | null
          support_agent_role?: Database["public"]["Enums"]["app_role"] | null
          user_consent_at?: string | null
          user_consent_given?: boolean
          user_device_fingerprint?: string | null
          user_entered_agent_code?: string | null
          user_id: string
          user_ip_address?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
          user_verification_code?: string | null
        }
        Update: {
          agent_device_fingerprint?: string | null
          agent_entered_user_code?: string | null
          agent_ip_address?: string | null
          agent_masked_id?: string | null
          agent_verification_code?: string | null
          agent_watermark_text?: string | null
          ai_flags?: Json | null
          ai_monitoring_enabled?: boolean | null
          ai_risk_score?: number | null
          client_notified_at?: string | null
          created_at?: string
          dual_verified?: boolean | null
          end_reason?: string | null
          ended_at?: string | null
          ended_by?: string | null
          expires_at?: string
          id?: string
          is_recording_enabled?: boolean
          max_duration_minutes?: number
          mode?: Database["public"]["Enums"]["remote_assist_mode"]
          recording_url?: string | null
          session_code?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["remote_assist_status"]
          support_agent_id?: string | null
          support_agent_role?: Database["public"]["Enums"]["app_role"] | null
          user_consent_at?: string | null
          user_consent_given?: boolean
          user_device_fingerprint?: string | null
          user_entered_agent_code?: string | null
          user_id?: string
          user_ip_address?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
          user_verification_code?: string | null
        }
        Relationships: []
      }
      sales_commissions: {
        Row: {
          commission_rate: number
          created_at: string
          deals_closed: number
          earned: number
          id: string
          member_id: string | null
          paid: number
          period: string
          revenue: number
          status: string
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          deals_closed?: number
          earned?: number
          id?: string
          member_id?: string | null
          paid?: number
          period: string
          revenue?: number
          status?: string
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          deals_closed?: number
          earned?: number
          id?: string
          member_id?: string | null
          paid?: number
          period?: string
          revenue?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_commissions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_deals: {
        Row: {
          created_at: string
          customer_id: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          owner_id: string | null
          probability: number
          reference: string
          stage: string
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          probability?: number
          reference: string
          stage?: string
          title: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          owner_id?: string | null
          probability?: number
          reference?: string
          stage?: string
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_deals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "sales_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_leads: {
        Row: {
          ai_win_probability: number
          assigned_to: string | null
          category: string | null
          company: string
          contact_name: string
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          qualified: boolean
          reference: string
          source: string
          stage: string
          updated_at: string
          urgency: string
          value: number
        }
        Insert: {
          ai_win_probability?: number
          assigned_to?: string | null
          category?: string | null
          company: string
          contact_name: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          qualified?: boolean
          reference: string
          source?: string
          stage?: string
          updated_at?: string
          urgency?: string
          value?: number
        }
        Update: {
          ai_win_probability?: number
          assigned_to?: string | null
          category?: string | null
          company?: string
          contact_name?: string
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          qualified?: boolean
          reference?: string
          source?: string
          stage?: string
          updated_at?: string
          urgency?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      support_escalations: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          level: number
          raised_by: string | null
          reason: string
          reference: string
          resolution_notes: string | null
          status: string
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          level?: number
          raised_by?: string | null
          reason: string
          reference: string
          resolution_notes?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          level?: number
          raised_by?: string | null
          reason?: string
          reference?: string
          resolution_notes?: string | null
          status?: string
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_escalations_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_escalations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          channel: string
          created_at: string
          csat: number | null
          customer_id: string | null
          customer_name: string
          description: string | null
          first_response_at: string | null
          id: string
          priority: string
          reference: string
          resolved_at: string | null
          sla_breached: boolean
          sla_minutes_remaining: number
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          channel?: string
          created_at?: string
          csat?: number | null
          customer_id?: string | null
          customer_name: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          reference: string
          resolved_at?: string | null
          sla_breached?: boolean
          sla_minutes_remaining?: number
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          channel?: string
          created_at?: string
          csat?: number | null
          customer_id?: string | null
          customer_name?: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string
          reference?: string
          resolved_at?: string | null
          sla_breached?: boolean
          sla_minutes_remaining?: number
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "crm_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          achieved_amount: number
          avatar_initials: string | null
          avg_response_minutes: number
          created_at: string
          csat: number
          department: string
          email: string
          full_name: string
          id: string
          leads_handled: number
          role_title: string
          shift: string
          status: string
          target_amount: number
          tickets_handled: number
          updated_at: string
        }
        Insert: {
          achieved_amount?: number
          avatar_initials?: string | null
          avg_response_minutes?: number
          created_at?: string
          csat?: number
          department?: string
          email: string
          full_name: string
          id?: string
          leads_handled?: number
          role_title?: string
          shift?: string
          status?: string
          target_amount?: number
          tickets_handled?: number
          updated_at?: string
        }
        Update: {
          achieved_amount?: number
          avatar_initials?: string | null
          avg_response_minutes?: number
          created_at?: string
          csat?: number
          department?: string
          email?: string
          full_name?: string
          id?: string
          leads_handled?: number
          role_title?: string
          shift?: string
          status?: string
          target_amount?: number
          tickets_handled?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          dismissed_at: string | null
          event_type: string | null
          id: string
          is_buzzer: boolean | null
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          read_at: string | null
          role_target: string[] | null
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          dismissed_at?: string | null
          event_type?: string | null
          id?: string
          is_buzzer?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          read_at?: string | null
          role_target?: string[] | null
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          dismissed_at?: string | null
          event_type?: string | null
          id?: string
          is_buzzer?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          role_target?: string[] | null
          type?: string
          user_id?: string
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
      wiki_articles: {
        Row: {
          body: string | null
          category: string
          created_at: string
          helpful_count: number
          id: string
          status: string
          summary: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_remote_assist_session: { Args: never; Returns: Json }
      end_remote_assist_session: {
        Args: { p_reason?: string; p_session_id: string }
        Returns: Json
      }
      generate_session_code: { Args: never; Returns: string }
      generate_verification_code: { Args: never; Returns: string }
      give_remote_assist_consent: {
        Args: { p_session_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_support_staff: { Args: { _user_id: string }; Returns: boolean }
      join_remote_assist_session: {
        Args: { p_session_code: string }
        Returns: Json
      }
      log_safe_assist_ai_event: {
        Args: {
          p_analysis: Json
          p_auto_handle?: boolean
          p_event_type: string
          p_recommended_action: string
          p_risk_level: string
          p_session_id: string
        }
        Returns: string
      }
      verify_safe_assist_connection: {
        Args: {
          p_agent_code: string
          p_is_agent: boolean
          p_session_id: string
          p_user_code: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "boss_owner"
        | "super_admin"
        | "admin"
        | "sales_support_manager"
        | "sales"
        | "support"
        | "client"
        | "customer"
      remote_assist_mode: "view_only" | "guided_cursor"
      remote_assist_status:
        | "pending"
        | "connected"
        | "active"
        | "ended"
        | "expired"
        | "cancelled"
        | "terminated"
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
    Enums: {
      app_role: [
        "boss_owner",
        "super_admin",
        "admin",
        "sales_support_manager",
        "sales",
        "support",
        "client",
        "customer",
      ],
      remote_assist_mode: ["view_only", "guided_cursor"],
      remote_assist_status: [
        "pending",
        "connected",
        "active",
        "ended",
        "expired",
        "cancelled",
        "terminated",
      ],
    },
  },
} as const
