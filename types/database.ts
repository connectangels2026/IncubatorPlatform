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
      applications: {
        Row: {
          admission_date: string | null
          admission_letter_url: string | null
          admission_status: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          application_type: string
          cohort_name: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          form_data: Json
          id: string
          mou_document_url: string | null
          mou_signed: boolean | null
          mou_signed_date: string | null
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_comments: string | null
          score: number | null
          startup_id: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          uploaded_documents: Json | null
        }
        Insert: {
          admission_date?: string | null
          admission_letter_url?: string | null
          admission_status?: string | null
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          application_type: string
          cohort_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          form_data: Json
          id?: string
          mou_document_url?: string | null
          mou_signed?: boolean | null
          mou_signed_date?: string | null
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          score?: number | null
          startup_id?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          uploaded_documents?: Json | null
        }
        Update: {
          admission_date?: string | null
          admission_letter_url?: string | null
          admission_status?: string | null
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          application_type?: string
          cohort_name?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          form_data?: Json
          id?: string
          mou_document_url?: string | null
          mou_signed?: boolean | null
          mou_signed_date?: string | null
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_comments?: string | null
          score?: number | null
          startup_id?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          uploaded_documents?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          invoice_url: string | null
          notes: string | null
          organization_id: string
          paid_date: string | null
          payment_method: string | null
          payment_status: string | null
          subscription_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_url?: string | null
          notes?: string | null
          organization_id: string
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_url?: string | null
          notes?: string | null
          organization_id?: string
          paid_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          allowed_users: Json | null
          application_id: string | null
          created_at: string | null
          deleted_at: string | null
          document_type: string | null
          expiry_date: string | null
          file_name: string
          file_size_kb: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          is_signed: boolean | null
          organization_id: string
          previous_version_id: string | null
          requires_signature: boolean | null
          signed_at: string | null
          signed_by: string | null
          startup_id: string | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
          version_number: number | null
        }
        Insert: {
          allowed_users?: Json | null
          application_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_name: string
          file_size_kb?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          is_signed?: boolean | null
          organization_id: string
          previous_version_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          startup_id?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version_number?: number | null
        }
        Update: {
          allowed_users?: Json | null
          application_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_name?: string
          file_size_kb?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          is_signed?: boolean | null
          organization_id?: string
          previous_version_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          startup_id?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_criteria: {
        Row: {
          application_type: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          evaluation_type: string | null
          id: string
          is_active: boolean | null
          max_score: number | null
          name: string
          organization_id: string
          scale_labels: Json | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          application_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evaluation_type?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name: string
          organization_id: string
          scale_labels?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          application_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          evaluation_type?: string | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          name?: string
          organization_id?: string
          scale_labels?: Json | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_criteria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          application_id: string
          comments: string | null
          created_at: string | null
          criteria_id: string
          evaluator_id: string
          id: string
          organization_id: string
          score: number
          updated_at: string | null
        }
        Insert: {
          application_id: string
          comments?: string | null
          created_at?: string | null
          criteria_id: string
          evaluator_id: string
          id?: string
          organization_id: string
          score: number
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          comments?: string | null
          created_at?: string | null
          criteria_id?: string
          evaluator_id?: string
          id?: string
          organization_id?: string
          score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "evaluation_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability_hours_per_month: number | null
          availability_json: Json | null
          bio: string | null
          calendar_url: string | null
          certifications: Json | null
          company_background: string | null
          created_at: string | null
          deleted_at: string | null
          expertise_areas: Json | null
          id: string
          industry_experience: string | null
          is_active: boolean | null
          is_available: boolean | null
          linkedin_url: string | null
          organization_id: string
          preferred_meeting_mode: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          years_of_experience: number | null
        }
        Insert: {
          availability_hours_per_month?: number | null
          availability_json?: Json | null
          bio?: string | null
          calendar_url?: string | null
          certifications?: Json | null
          company_background?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expertise_areas?: Json | null
          id?: string
          industry_experience?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          linkedin_url?: string | null
          organization_id: string
          preferred_meeting_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          years_of_experience?: number | null
        }
        Update: {
          availability_hours_per_month?: number | null
          availability_json?: Json | null
          bio?: string | null
          calendar_url?: string | null
          certifications?: Json | null
          company_background?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expertise_areas?: Json | null
          id?: string
          industry_experience?: string | null
          is_active?: boolean | null
          is_available?: boolean | null
          linkedin_url?: string | null
          organization_id?: string
          preferred_meeting_mode?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          action_points: Json | null
          agenda: string | null
          attended: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          meeting_link: string | null
          meeting_location: string | null
          meeting_mode: string | null
          mentor_feedback: string | null
          mentor_id: string
          organization_id: string
          scheduled_date: string
          session_notes: string | null
          session_title: string | null
          start_time: string
          startup_feedback: string | null
          startup_id: string
          startup_rating: number | null
          status: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          action_points?: Json | null
          agenda?: string | null
          attended?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          meeting_link?: string | null
          meeting_location?: string | null
          meeting_mode?: string | null
          mentor_feedback?: string | null
          mentor_id: string
          organization_id: string
          scheduled_date: string
          session_notes?: string | null
          session_title?: string | null
          start_time: string
          startup_feedback?: string | null
          startup_id: string
          startup_rating?: number | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          action_points?: Json | null
          agenda?: string | null
          attended?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          meeting_link?: string | null
          meeting_location?: string | null
          meeting_mode?: string | null
          mentor_feedback?: string | null
          mentor_id?: string
          organization_id?: string
          scheduled_date?: string
          session_notes?: string | null
          session_title?: string | null
          start_time?: string
          startup_feedback?: string | null
          startup_id?: string
          startup_rating?: number | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_sessions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string | null
          organization_id: string
          read_at: string | null
          recipient_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          send_email: boolean | null
          send_in_app: boolean | null
          send_sms: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          organization_id: string
          read_at?: string | null
          recipient_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          send_email?: boolean | null
          send_in_app?: boolean | null
          send_sms?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          organization_id?: string
          read_at?: string | null
          recipient_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          send_email?: boolean | null
          send_in_app?: boolean | null
          send_sms?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_activity_log: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string
          triggered_by: string | null
          triggered_by_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          triggered_by?: string | null
          triggered_by_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          triggered_by?: string | null
          triggered_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_activity_log_triggered_by_id_fkey"
            columns: ["triggered_by_id"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_subscriptions: {
        Row: {
          annual_cost: number | null
          billing_email: string | null
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          days_overdue: number | null
          features_enabled: Json | null
          id: string
          is_blocked: boolean | null
          last_payment_amount: number | null
          last_payment_date: string | null
          last_payment_transaction_id: string | null
          max_mentors: number | null
          max_startups: number | null
          max_users: number | null
          monthly_cost: number | null
          next_billing_date: string | null
          organization_id: string
          payment_method: string | null
          payment_method_id: string | null
          payment_status: string | null
          status: string | null
          tier: string | null
          trial_days_remaining: number | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          annual_cost?: number | null
          billing_email?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          days_overdue?: number | null
          features_enabled?: Json | null
          id?: string
          is_blocked?: boolean | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          last_payment_transaction_id?: string | null
          max_mentors?: number | null
          max_startups?: number | null
          max_users?: number | null
          monthly_cost?: number | null
          next_billing_date?: string | null
          organization_id: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          status?: string | null
          tier?: string | null
          trial_days_remaining?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          annual_cost?: number | null
          billing_email?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          days_overdue?: number | null
          features_enabled?: Json | null
          id?: string
          is_blocked?: boolean | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          last_payment_transaction_id?: string | null
          max_mentors?: number | null
          max_startups?: number | null
          max_users?: number | null
          monthly_cost?: number | null
          next_billing_date?: string | null
          organization_id?: string
          payment_method?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          status?: string | null
          tier?: string | null
          trial_days_remaining?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          billing_email: string | null
          city: string | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          founder_email: string | null
          founder_name: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          logo_color: string | null
          initials: string | null
          max_mentors_allowed: number | null
          max_startups_allowed: number | null
          name: string
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          state: string | null
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          founder_email?: string | null
          founder_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          logo_color?: string | null
          initials?: string | null
          max_mentors_allowed?: number | null
          max_startups_allowed?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          state?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          founder_email?: string | null
          founder_name?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          logo_color?: string | null
          initials?: string | null
          max_mentors_allowed?: number | null
          max_startups_allowed?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          state?: string | null
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          created_at: string | null
          days_before_due: number | null
          email_sent_to: string | null
          id: string
          invoice_id: string | null
          is_sent: boolean | null
          organization_id: string
          reminder_type: string | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before_due?: number | null
          email_sent_to?: string | null
          id?: string
          invoice_id?: string | null
          is_sent?: boolean | null
          organization_id: string
          reminder_type?: string | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before_due?: number | null
          email_sent_to?: string | null
          id?: string
          invoice_id?: string | null
          is_sent?: boolean | null
          organization_id?: string
          reminder_type?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          annual_price: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          display_name: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_applications_per_month: number | null
          max_mentors: number | null
          max_startups: number | null
          max_users: number | null
          monthly_price: number | null
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          annual_price?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_applications_per_month?: number | null
          max_mentors?: number | null
          max_startups?: number | null
          max_users?: number | null
          monthly_price?: number | null
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          annual_price?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          display_name?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_applications_per_month?: number | null
          max_mentors?: number | null
          max_startups?: number | null
          max_users?: number | null
          monthly_price?: number | null
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "super_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_reviews: {
        Row: {
          action_plan: string | null
          assessor_comments: string | null
          created_at: string | null
          customer_count: number | null
          id: string
          improvement_areas: Json | null
          milestones_achieved: Json | null
          milestones_pending: Json | null
          organization_id: string
          overall_score: number | null
          performance_rating: string | null
          product_status: string | null
          revenue: number | null
          review_period_end: string
          review_period_start: string
          review_status: string | null
          review_type: string
          reviewed_by: string | null
          startup_id: string
          team_size: number | null
          updated_at: string | null
        }
        Insert: {
          action_plan?: string | null
          assessor_comments?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          improvement_areas?: Json | null
          milestones_achieved?: Json | null
          milestones_pending?: Json | null
          organization_id: string
          overall_score?: number | null
          performance_rating?: string | null
          product_status?: string | null
          revenue?: number | null
          review_period_end: string
          review_period_start: string
          review_status?: string | null
          review_type: string
          reviewed_by?: string | null
          startup_id: string
          team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          action_plan?: string | null
          assessor_comments?: string | null
          created_at?: string | null
          customer_count?: number | null
          id?: string
          improvement_areas?: Json | null
          milestones_achieved?: Json | null
          milestones_pending?: Json | null
          organization_id?: string
          overall_score?: number | null
          performance_rating?: string | null
          product_status?: string | null
          revenue?: number | null
          review_period_end?: string
          review_period_start?: string
          review_status?: string | null
          review_type?: string
          reviewed_by?: string | null
          startup_id?: string
          team_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startup_reviews_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          annual_revenue: number | null
          business_model: string | null
          business_plan_url: string | null
          cin_number: string | null
          cofounders: Json | null
          created_at: string | null
          created_by: string | null
          customer_count: number | null
          deleted_at: string | null
          description: string | null
          founded_date: string | null
          founder_email: string | null
          founder_id: string | null
          founder_phone: string | null
          funding_raised: number | null
          gst_number: string | null
          id: string
          incubation_end_date: string | null
          incubation_start_date: string | null
          is_active: boolean | null
          lifecycle_stage: string | null
          logo_url: string | null
          logo_color: string | null
          initials: string | null
          monthly_revenue: number | null
          mrr: number | null
          name: string
          organization_id: string
          pan_number: string | null
          pitch_deck_url: string | null
          problem_statement: string | null
          registration_number: string | null
          registration_type: string | null
          revenue_model: string | null
          sector: string | null
          solution_description: string | null
          stage: string | null
          status: string | null
          target_market: string | null
          team_members: Json | null
          team_size: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          business_model?: string | null
          business_plan_url?: string | null
          cin_number?: string | null
          cofounders?: Json | null
          created_at?: string | null
          created_by?: string | null
          customer_count?: number | null
          deleted_at?: string | null
          description?: string | null
          founded_date?: string | null
          founder_email?: string | null
          founder_id?: string | null
          founder_phone?: string | null
          funding_raised?: number | null
          gst_number?: string | null
          id?: string
          incubation_end_date?: string | null
          incubation_start_date?: string | null
          is_active?: boolean | null
          lifecycle_stage?: string | null
          logo_url?: string | null
          logo_color?: string | null
          initials?: string | null
          monthly_revenue?: number | null
          mrr?: number | null
          name: string
          organization_id: string
          pan_number?: string | null
          pitch_deck_url?: string | null
          problem_statement?: string | null
          registration_number?: string | null
          registration_type?: string | null
          revenue_model?: string | null
          sector?: string | null
          solution_description?: string | null
          stage?: string | null
          status?: string | null
          target_market?: string | null
          team_members?: Json | null
          team_size?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          business_model?: string | null
          business_plan_url?: string | null
          cin_number?: string | null
          cofounders?: Json | null
          created_at?: string | null
          created_by?: string | null
          customer_count?: number | null
          deleted_at?: string | null
          description?: string | null
          founded_date?: string | null
          founder_email?: string | null
          founder_id?: string | null
          founder_phone?: string | null
          funding_raised?: number | null
          gst_number?: string | null
          id?: string
          incubation_end_date?: string | null
          incubation_start_date?: string | null
          is_active?: boolean | null
          lifecycle_stage?: string | null
          logo_url?: string | null
          logo_color?: string | null
          initials?: string | null
          monthly_revenue?: number | null
          mrr?: number | null
          name?: string
          organization_id?: string
          pan_number?: string | null
          pitch_deck_url?: string | null
          problem_statement?: string | null
          registration_number?: string | null
          registration_type?: string | null
          revenue_model?: string | null
          sector?: string | null
          solution_description?: string | null
          stage?: string | null
          status?: string | null
          target_market?: string | null
          team_members?: Json | null
          team_size?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "startups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startups_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "startups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          can_block_orgs: boolean | null
          can_manage_billing: boolean | null
          can_manage_pricing: boolean | null
          can_manage_staff: boolean | null
          can_view_all_orgs: boolean | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          phone: string | null
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          can_block_orgs?: boolean | null
          can_manage_billing?: boolean | null
          can_manage_pricing?: boolean | null
          can_manage_staff?: boolean | null
          can_view_all_orgs?: boolean | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          can_block_orgs?: boolean | null
          can_manage_billing?: boolean | null
          can_manage_pricing?: boolean | null
          can_manage_staff?: boolean | null
          can_view_all_orgs?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_by_user_id: string | null
          assigned_to_startup_id: string | null
          assigned_to_user_id: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          organization_id: string
          priority: string | null
          progress_percentage: number | null
          related_review_id: string | null
          related_session_id: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by_user_id?: string | null
          assigned_to_startup_id?: string | null
          assigned_to_user_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          organization_id: string
          priority?: string | null
          progress_percentage?: number | null
          related_review_id?: string | null
          related_session_id?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by_user_id?: string | null
          assigned_to_startup_id?: string | null
          assigned_to_user_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          organization_id?: string
          priority?: string | null
          progress_percentage?: number | null
          related_review_id?: string | null
          related_session_id?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_startup_id_fkey"
            columns: ["assigned_to_startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "startup_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_session_id_fkey"
            columns: ["related_session_id"]
            isOneToOne: false
            referencedRelation: "mentorship_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          linkedin_url: string | null
          organization_id: string
          phone: string | null
          phone_verified: boolean | null
          profile_picture_url: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          organization_id: string
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          organization_id?: string
          phone?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
