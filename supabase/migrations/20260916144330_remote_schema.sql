drop extension if exists "pg_net";


  create table "public"."applications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "startup_id" uuid,
    "application_type" character varying(50) not null,
    "cohort_name" character varying(100),
    "applicant_name" character varying(255) not null,
    "applicant_email" character varying(255) not null,
    "applicant_phone" character varying(20),
    "form_data" jsonb not null,
    "status" character varying(50) default 'submitted'::character varying,
    "score" numeric(5,2),
    "reviewer_comments" text,
    "reviewed_by" uuid,
    "reviewed_at" timestamp without time zone,
    "uploaded_documents" jsonb default '[]'::jsonb,
    "admission_status" character varying(50),
    "admission_letter_url" character varying(500),
    "admission_date" date,
    "mou_signed" boolean default false,
    "mou_signed_date" timestamp without time zone,
    "mou_document_url" character varying(500),
    "submitted_at" timestamp without time zone default now(),
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone,
    "created_by" uuid
      );


alter table "public"."applications" enable row level security;


  create table "public"."documents" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "file_name" character varying(500) not null,
    "file_url" character varying(500) not null,
    "file_type" character varying(50),
    "file_size_kb" integer,
    "document_type" character varying(100),
    "startup_id" uuid,
    "application_id" uuid,
    "version_number" integer default 1,
    "previous_version_id" uuid,
    "status" character varying(50) default 'active'::character varying,
    "expiry_date" date,
    "is_public" boolean default false,
    "allowed_users" jsonb default '[]'::jsonb,
    "requires_signature" boolean default false,
    "is_signed" boolean default false,
    "signed_by" uuid,
    "signed_at" timestamp without time zone,
    "uploaded_by" uuid,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone
      );


alter table "public"."documents" enable row level security;


  create table "public"."evaluation_criteria" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "name" character varying(255) not null,
    "description" text,
    "max_score" numeric(5,2) default 10,
    "weight" numeric(5,2) default 1,
    "evaluation_type" character varying(50) default 'numeric'::character varying,
    "scale_labels" jsonb,
    "is_active" boolean default true,
    "application_type" character varying(50),
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "display_order" integer default 0
      );


alter table "public"."evaluation_criteria" enable row level security;


  create table "public"."evaluations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "application_id" uuid not null,
    "criteria_id" uuid not null,
    "score" numeric(5,2) not null,
    "comments" text,
    "evaluator_id" uuid not null,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."evaluations" enable row level security;


  create table "public"."mentors" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "user_id" uuid not null,
    "expertise_areas" jsonb default '[]'::jsonb,
    "industry_experience" text,
    "company_background" text,
    "years_of_experience" integer,
    "is_available" boolean default true,
    "availability_hours_per_month" integer default 10,
    "preferred_meeting_mode" character varying(50),
    "timezone" character varying(50),
    "calendar_url" character varying(500),
    "availability_json" jsonb default '{}'::jsonb,
    "bio" text,
    "certifications" jsonb default '[]'::jsonb,
    "website" character varying(500),
    "linkedin_url" character varying(500),
    "is_active" boolean default true,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone
      );


alter table "public"."mentors" enable row level security;


  create table "public"."mentorship_sessions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "startup_id" uuid not null,
    "mentor_id" uuid not null,
    "session_title" character varying(255),
    "description" text,
    "scheduled_date" date not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "duration_minutes" integer,
    "timezone" character varying(50),
    "meeting_mode" character varying(50),
    "meeting_location" text,
    "meeting_link" character varying(500),
    "agenda" text,
    "status" character varying(50) default 'scheduled'::character varying,
    "attended" boolean default false,
    "session_notes" text,
    "action_points" jsonb default '[]'::jsonb,
    "startup_feedback" text,
    "startup_rating" integer,
    "mentor_feedback" text,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "created_by" uuid
      );


alter table "public"."mentorship_sessions" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "recipient_id" uuid not null,
    "title" character varying(255) not null,
    "message" text not null,
    "notification_type" character varying(50),
    "send_email" boolean default true,
    "send_sms" boolean default false,
    "send_in_app" boolean default true,
    "is_read" boolean default false,
    "read_at" timestamp without time zone,
    "related_entity_type" character varying(50),
    "related_entity_id" uuid,
    "created_at" timestamp without time zone default now(),
    "expires_at" timestamp without time zone
      );


alter table "public"."notifications" enable row level security;


  create table "public"."organizations" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" character varying(255) not null,
    "slug" character varying(100) not null,
    "description" text,
    "logo_url" character varying(500),
    "website" character varying(255),
    "email" character varying(255),
    "phone" character varying(20),
    "address" text,
    "city" character varying(100),
    "state" character varying(100),
    "country" character varying(100),
    "postal_code" character varying(20),
    "founder_name" character varying(255),
    "founder_email" character varying(255),
    "subscription_tier" character varying(50) default 'free'::character varying,
    "subscription_status" character varying(50) default 'active'::character varying,
    "subscription_started_at" timestamp without time zone,
    "subscription_ends_at" timestamp without time zone,
    "billing_email" character varying(255),
    "primary_color" character varying(7),
    "secondary_color" character varying(7),
    "max_startups_allowed" integer default 20,
    "max_mentors_allowed" integer default 10,
    "is_active" boolean default true,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone
      );


alter table "public"."organizations" enable row level security;


  create table "public"."startup_reviews" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "startup_id" uuid not null,
    "review_type" character varying(50) not null,
    "review_period_start" date not null,
    "review_period_end" date not null,
    "revenue" numeric(15,2),
    "customer_count" integer,
    "team_size" integer,
    "product_status" character varying(100),
    "milestones_achieved" jsonb default '[]'::jsonb,
    "milestones_pending" jsonb default '[]'::jsonb,
    "overall_score" numeric(5,2),
    "performance_rating" character varying(50),
    "assessor_comments" text,
    "improvement_areas" jsonb default '[]'::jsonb,
    "action_plan" text,
    "review_status" character varying(50) default 'completed'::character varying,
    "reviewed_by" uuid,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."startup_reviews" enable row level security;


  create table "public"."startups" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "name" character varying(255) not null,
    "logo_url" character varying(500),
    "website" character varying(500),
    "description" text,
    "sector" character varying(100),
    "stage" character varying(50),
    "founded_date" date,
    "founder_id" uuid,
    "founder_email" character varying(255),
    "founder_phone" character varying(20),
    "cofounders" jsonb default '[]'::jsonb,
    "team_members" jsonb default '[]'::jsonb,
    "team_size" integer default 1,
    "problem_statement" text,
    "solution_description" text,
    "target_market" text,
    "business_model" text,
    "revenue_model" character varying(100),
    "registration_type" character varying(50),
    "registration_number" character varying(100),
    "pan_number" character varying(20),
    "gst_number" character varying(20),
    "cin_number" character varying(25),
    "monthly_revenue" numeric(15,2) default 0,
    "annual_revenue" numeric(15,2) default 0,
    "funding_raised" numeric(15,2) default 0,
    "customer_count" integer default 0,
    "mrr" numeric(15,2) default 0,
    "pitch_deck_url" character varying(500),
    "business_plan_url" character varying(500),
    "status" character varying(50) default 'active'::character varying,
    "lifecycle_stage" character varying(50) default 'application'::character varying,
    "incubation_start_date" date,
    "incubation_end_date" date,
    "is_active" boolean default true,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone,
    "created_by" uuid
      );


alter table "public"."startups" enable row level security;


  create table "public"."tasks" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "title" character varying(255) not null,
    "description" text,
    "task_type" character varying(50),
    "assigned_to_user_id" uuid,
    "assigned_to_startup_id" uuid,
    "assigned_by_user_id" uuid,
    "due_date" date not null,
    "priority" character varying(50) default 'medium'::character varying,
    "status" character varying(50) default 'open'::character varying,
    "progress_percentage" integer default 0,
    "completion_date" timestamp without time zone,
    "related_session_id" uuid,
    "related_review_id" uuid,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now()
      );


alter table "public"."tasks" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "role" character varying(50) not null,
    "permissions" jsonb default '{}'::jsonb,
    "is_active" boolean default true,
    "assigned_at" timestamp without time zone default now(),
    "expires_at" timestamp without time zone
      );


alter table "public"."user_roles" enable row level security;


  create table "public"."users" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "organization_id" uuid not null,
    "email" character varying(255) not null,
    "phone" character varying(20),
    "first_name" character varying(100) not null,
    "last_name" character varying(100),
    "full_name" character varying(255),
    "profile_picture_url" character varying(500),
    "bio" text,
    "linkedin_url" character varying(500),
    "website" character varying(500),
    "is_active" boolean default true,
    "email_verified" boolean default false,
    "phone_verified" boolean default false,
    "last_login_at" timestamp without time zone,
    "created_at" timestamp without time zone default now(),
    "updated_at" timestamp without time zone default now(),
    "deleted_at" timestamp without time zone
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX applications_pkey ON public.applications USING btree (id);

CREATE UNIQUE INDEX documents_pkey ON public.documents USING btree (id);

CREATE UNIQUE INDEX evaluation_criteria_pkey ON public.evaluation_criteria USING btree (id);

CREATE UNIQUE INDEX evaluations_pkey ON public.evaluations USING btree (id);

CREATE INDEX idx_applications_applicant_email ON public.applications USING btree (applicant_email);

CREATE INDEX idx_applications_application_type ON public.applications USING btree (application_type);

CREATE INDEX idx_applications_organization_id ON public.applications USING btree (organization_id);

CREATE INDEX idx_applications_startup_id ON public.applications USING btree (startup_id);

CREATE INDEX idx_applications_status ON public.applications USING btree (status);

CREATE INDEX idx_applications_submitted_at ON public.applications USING btree (submitted_at);

CREATE INDEX idx_documents_application_id ON public.documents USING btree (application_id);

CREATE INDEX idx_documents_document_type ON public.documents USING btree (document_type);

CREATE INDEX idx_documents_organization_id ON public.documents USING btree (organization_id);

CREATE INDEX idx_documents_startup_id ON public.documents USING btree (startup_id);

CREATE INDEX idx_evaluation_criteria_is_active ON public.evaluation_criteria USING btree (is_active);

CREATE INDEX idx_evaluation_criteria_organization_id ON public.evaluation_criteria USING btree (organization_id);

CREATE INDEX idx_evaluations_application_id ON public.evaluations USING btree (application_id);

CREATE INDEX idx_evaluations_criteria_id ON public.evaluations USING btree (criteria_id);

CREATE INDEX idx_evaluations_evaluator_id ON public.evaluations USING btree (evaluator_id);

CREATE INDEX idx_mentors_is_available ON public.mentors USING btree (is_available);

CREATE INDEX idx_mentors_organization_id ON public.mentors USING btree (organization_id);

CREATE INDEX idx_mentors_user_id ON public.mentors USING btree (user_id);

CREATE INDEX idx_mentorship_sessions_mentor_id ON public.mentorship_sessions USING btree (mentor_id);

CREATE INDEX idx_mentorship_sessions_organization_id ON public.mentorship_sessions USING btree (organization_id);

CREATE INDEX idx_mentorship_sessions_scheduled_date ON public.mentorship_sessions USING btree (scheduled_date);

CREATE INDEX idx_mentorship_sessions_startup_id ON public.mentorship_sessions USING btree (startup_id);

CREATE INDEX idx_mentorship_sessions_status ON public.mentorship_sessions USING btree (status);

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);

CREATE INDEX idx_notifications_organization_id ON public.notifications USING btree (organization_id);

CREATE INDEX idx_notifications_recipient_id ON public.notifications USING btree (recipient_id);

CREATE INDEX idx_organizations_slug ON public.organizations USING btree (slug);

CREATE INDEX idx_organizations_subscription_tier ON public.organizations USING btree (subscription_tier);

CREATE INDEX idx_startup_reviews_organization_id ON public.startup_reviews USING btree (organization_id);

CREATE INDEX idx_startup_reviews_review_type ON public.startup_reviews USING btree (review_type);

CREATE INDEX idx_startup_reviews_startup_id ON public.startup_reviews USING btree (startup_id);

CREATE INDEX idx_startups_founder_id ON public.startups USING btree (founder_id);

CREATE INDEX idx_startups_lifecycle_stage ON public.startups USING btree (lifecycle_stage);

CREATE INDEX idx_startups_organization_id ON public.startups USING btree (organization_id);

CREATE INDEX idx_startups_sector ON public.startups USING btree (sector);

CREATE INDEX idx_startups_stage ON public.startups USING btree (stage);

CREATE INDEX idx_startups_status ON public.startups USING btree (status);

CREATE INDEX idx_tasks_assigned_to_startup_id ON public.tasks USING btree (assigned_to_startup_id);

CREATE INDEX idx_tasks_assigned_to_user_id ON public.tasks USING btree (assigned_to_user_id);

CREATE INDEX idx_tasks_due_date ON public.tasks USING btree (due_date);

CREATE INDEX idx_tasks_organization_id ON public.tasks USING btree (organization_id);

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);

CREATE INDEX idx_user_roles_organization_id ON public.user_roles USING btree (organization_id);

CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);

CREATE UNIQUE INDEX idx_user_roles_unique ON public.user_roles USING btree (user_id, organization_id, role) WHERE (is_active = true);

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE UNIQUE INDEX idx_users_org_email ON public.users USING btree (organization_id, email) WHERE (deleted_at IS NULL);

CREATE INDEX idx_users_organization_id ON public.users USING btree (organization_id);

CREATE UNIQUE INDEX mentors_pkey ON public.mentors USING btree (id);

CREATE UNIQUE INDEX mentorship_sessions_pkey ON public.mentorship_sessions USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

CREATE UNIQUE INDEX organizations_slug_key ON public.organizations USING btree (slug);

CREATE UNIQUE INDEX startup_reviews_pkey ON public.startup_reviews USING btree (id);

CREATE UNIQUE INDEX startups_pkey ON public.startups USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."applications" add constraint "applications_pkey" PRIMARY KEY using index "applications_pkey";

alter table "public"."documents" add constraint "documents_pkey" PRIMARY KEY using index "documents_pkey";

alter table "public"."evaluation_criteria" add constraint "evaluation_criteria_pkey" PRIMARY KEY using index "evaluation_criteria_pkey";

alter table "public"."evaluations" add constraint "evaluations_pkey" PRIMARY KEY using index "evaluations_pkey";

alter table "public"."mentors" add constraint "mentors_pkey" PRIMARY KEY using index "mentors_pkey";

alter table "public"."mentorship_sessions" add constraint "mentorship_sessions_pkey" PRIMARY KEY using index "mentorship_sessions_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."organizations" add constraint "organizations_pkey" PRIMARY KEY using index "organizations_pkey";

alter table "public"."startup_reviews" add constraint "startup_reviews_pkey" PRIMARY KEY using index "startup_reviews_pkey";

alter table "public"."startups" add constraint "startups_pkey" PRIMARY KEY using index "startups_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."applications" add constraint "applications_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."applications" validate constraint "applications_created_by_fkey";

alter table "public"."applications" add constraint "applications_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."applications" validate constraint "applications_organization_id_fkey";

alter table "public"."applications" add constraint "applications_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."applications" validate constraint "applications_reviewed_by_fkey";

alter table "public"."applications" add constraint "applications_startup_id_fkey" FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE SET NULL not valid;

alter table "public"."applications" validate constraint "applications_startup_id_fkey";

alter table "public"."documents" add constraint "documents_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_application_id_fkey";

alter table "public"."documents" add constraint "documents_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."documents" validate constraint "documents_organization_id_fkey";

alter table "public"."documents" add constraint "documents_previous_version_id_fkey" FOREIGN KEY (previous_version_id) REFERENCES public.documents(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_previous_version_id_fkey";

alter table "public"."documents" add constraint "documents_signed_by_fkey" FOREIGN KEY (signed_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_signed_by_fkey";

alter table "public"."documents" add constraint "documents_startup_id_fkey" FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_startup_id_fkey";

alter table "public"."documents" add constraint "documents_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."documents" validate constraint "documents_uploaded_by_fkey";

alter table "public"."evaluation_criteria" add constraint "evaluation_criteria_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."evaluation_criteria" validate constraint "evaluation_criteria_organization_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_application_id_fkey" FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE not valid;

alter table "public"."evaluations" validate constraint "evaluations_application_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_criteria_id_fkey" FOREIGN KEY (criteria_id) REFERENCES public.evaluation_criteria(id) ON DELETE CASCADE not valid;

alter table "public"."evaluations" validate constraint "evaluations_criteria_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_evaluator_id_fkey" FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."evaluations" validate constraint "evaluations_evaluator_id_fkey";

alter table "public"."evaluations" add constraint "evaluations_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."evaluations" validate constraint "evaluations_organization_id_fkey";

alter table "public"."mentors" add constraint "mentors_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."mentors" validate constraint "mentors_organization_id_fkey";

alter table "public"."mentors" add constraint "mentors_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."mentors" validate constraint "mentors_user_id_fkey";

alter table "public"."mentorship_sessions" add constraint "mentorship_sessions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."mentorship_sessions" validate constraint "mentorship_sessions_created_by_fkey";

alter table "public"."mentorship_sessions" add constraint "mentorship_sessions_mentor_id_fkey" FOREIGN KEY (mentor_id) REFERENCES public.mentors(id) ON DELETE CASCADE not valid;

alter table "public"."mentorship_sessions" validate constraint "mentorship_sessions_mentor_id_fkey";

alter table "public"."mentorship_sessions" add constraint "mentorship_sessions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."mentorship_sessions" validate constraint "mentorship_sessions_organization_id_fkey";

alter table "public"."mentorship_sessions" add constraint "mentorship_sessions_startup_id_fkey" FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE CASCADE not valid;

alter table "public"."mentorship_sessions" validate constraint "mentorship_sessions_startup_id_fkey";

alter table "public"."notifications" add constraint "notifications_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_organization_id_fkey";

alter table "public"."notifications" add constraint "notifications_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_recipient_id_fkey";

alter table "public"."organizations" add constraint "organizations_slug_key" UNIQUE using index "organizations_slug_key";

alter table "public"."organizations" add constraint "valid_subscription_tier" CHECK (((subscription_tier)::text = ANY ((ARRAY['free'::character varying, 'pro'::character varying, 'enterprise'::character varying])::text[]))) not valid;

alter table "public"."organizations" validate constraint "valid_subscription_tier";

alter table "public"."startup_reviews" add constraint "startup_reviews_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."startup_reviews" validate constraint "startup_reviews_organization_id_fkey";

alter table "public"."startup_reviews" add constraint "startup_reviews_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."startup_reviews" validate constraint "startup_reviews_reviewed_by_fkey";

alter table "public"."startup_reviews" add constraint "startup_reviews_startup_id_fkey" FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE CASCADE not valid;

alter table "public"."startup_reviews" validate constraint "startup_reviews_startup_id_fkey";

alter table "public"."startups" add constraint "startups_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."startups" validate constraint "startups_created_by_fkey";

alter table "public"."startups" add constraint "startups_founder_id_fkey" FOREIGN KEY (founder_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."startups" validate constraint "startups_founder_id_fkey";

alter table "public"."startups" add constraint "startups_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."startups" validate constraint "startups_organization_id_fkey";

alter table "public"."startups" add constraint "valid_stage" CHECK (((stage)::text = ANY ((ARRAY['Idea'::character varying, 'MVP'::character varying, 'Pre-revenue'::character varying, 'Revenue'::character varying, 'Growth'::character varying, 'Scale'::character varying])::text[]))) not valid;

alter table "public"."startups" validate constraint "valid_stage";

alter table "public"."tasks" add constraint "tasks_assigned_by_user_id_fkey" FOREIGN KEY (assigned_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_assigned_by_user_id_fkey";

alter table "public"."tasks" add constraint "tasks_assigned_to_startup_id_fkey" FOREIGN KEY (assigned_to_startup_id) REFERENCES public.startups(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_assigned_to_startup_id_fkey";

alter table "public"."tasks" add constraint "tasks_assigned_to_user_id_fkey" FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_assigned_to_user_id_fkey";

alter table "public"."tasks" add constraint "tasks_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_organization_id_fkey";

alter table "public"."tasks" add constraint "tasks_related_review_id_fkey" FOREIGN KEY (related_review_id) REFERENCES public.startup_reviews(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_related_review_id_fkey";

alter table "public"."tasks" add constraint "tasks_related_session_id_fkey" FOREIGN KEY (related_session_id) REFERENCES public.mentorship_sessions(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_related_session_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_organization_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "valid_role" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'startup_founder'::character varying, 'mentor'::character varying, 'investor'::character varying, 'judge'::character varying, 'faculty'::character varying, 'partner'::character varying])::text[]))) not valid;

alter table "public"."user_roles" validate constraint "valid_role";

alter table "public"."users" add constraint "users_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_organization_id_fkey";

alter table "public"."users" add constraint "valid_email" CHECK (((email)::text ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text)) not valid;

alter table "public"."users" validate constraint "valid_email";

grant delete on table "public"."applications" to "anon";

grant insert on table "public"."applications" to "anon";

grant references on table "public"."applications" to "anon";

grant select on table "public"."applications" to "anon";

grant trigger on table "public"."applications" to "anon";

grant truncate on table "public"."applications" to "anon";

grant update on table "public"."applications" to "anon";

grant delete on table "public"."applications" to "authenticated";

grant insert on table "public"."applications" to "authenticated";

grant references on table "public"."applications" to "authenticated";

grant select on table "public"."applications" to "authenticated";

grant trigger on table "public"."applications" to "authenticated";

grant truncate on table "public"."applications" to "authenticated";

grant update on table "public"."applications" to "authenticated";

grant delete on table "public"."applications" to "service_role";

grant insert on table "public"."applications" to "service_role";

grant references on table "public"."applications" to "service_role";

grant select on table "public"."applications" to "service_role";

grant trigger on table "public"."applications" to "service_role";

grant truncate on table "public"."applications" to "service_role";

grant update on table "public"."applications" to "service_role";

grant delete on table "public"."documents" to "anon";

grant insert on table "public"."documents" to "anon";

grant references on table "public"."documents" to "anon";

grant select on table "public"."documents" to "anon";

grant trigger on table "public"."documents" to "anon";

grant truncate on table "public"."documents" to "anon";

grant update on table "public"."documents" to "anon";

grant delete on table "public"."documents" to "authenticated";

grant insert on table "public"."documents" to "authenticated";

grant references on table "public"."documents" to "authenticated";

grant select on table "public"."documents" to "authenticated";

grant trigger on table "public"."documents" to "authenticated";

grant truncate on table "public"."documents" to "authenticated";

grant update on table "public"."documents" to "authenticated";

grant delete on table "public"."documents" to "service_role";

grant insert on table "public"."documents" to "service_role";

grant references on table "public"."documents" to "service_role";

grant select on table "public"."documents" to "service_role";

grant trigger on table "public"."documents" to "service_role";

grant truncate on table "public"."documents" to "service_role";

grant update on table "public"."documents" to "service_role";

grant delete on table "public"."evaluation_criteria" to "anon";

grant insert on table "public"."evaluation_criteria" to "anon";

grant references on table "public"."evaluation_criteria" to "anon";

grant select on table "public"."evaluation_criteria" to "anon";

grant trigger on table "public"."evaluation_criteria" to "anon";

grant truncate on table "public"."evaluation_criteria" to "anon";

grant update on table "public"."evaluation_criteria" to "anon";

grant delete on table "public"."evaluation_criteria" to "authenticated";

grant insert on table "public"."evaluation_criteria" to "authenticated";

grant references on table "public"."evaluation_criteria" to "authenticated";

grant select on table "public"."evaluation_criteria" to "authenticated";

grant trigger on table "public"."evaluation_criteria" to "authenticated";

grant truncate on table "public"."evaluation_criteria" to "authenticated";

grant update on table "public"."evaluation_criteria" to "authenticated";

grant delete on table "public"."evaluation_criteria" to "service_role";

grant insert on table "public"."evaluation_criteria" to "service_role";

grant references on table "public"."evaluation_criteria" to "service_role";

grant select on table "public"."evaluation_criteria" to "service_role";

grant trigger on table "public"."evaluation_criteria" to "service_role";

grant truncate on table "public"."evaluation_criteria" to "service_role";

grant update on table "public"."evaluation_criteria" to "service_role";

grant delete on table "public"."evaluations" to "anon";

grant insert on table "public"."evaluations" to "anon";

grant references on table "public"."evaluations" to "anon";

grant select on table "public"."evaluations" to "anon";

grant trigger on table "public"."evaluations" to "anon";

grant truncate on table "public"."evaluations" to "anon";

grant update on table "public"."evaluations" to "anon";

grant delete on table "public"."evaluations" to "authenticated";

grant insert on table "public"."evaluations" to "authenticated";

grant references on table "public"."evaluations" to "authenticated";

grant select on table "public"."evaluations" to "authenticated";

grant trigger on table "public"."evaluations" to "authenticated";

grant truncate on table "public"."evaluations" to "authenticated";

grant update on table "public"."evaluations" to "authenticated";

grant delete on table "public"."evaluations" to "service_role";

grant insert on table "public"."evaluations" to "service_role";

grant references on table "public"."evaluations" to "service_role";

grant select on table "public"."evaluations" to "service_role";

grant trigger on table "public"."evaluations" to "service_role";

grant truncate on table "public"."evaluations" to "service_role";

grant update on table "public"."evaluations" to "service_role";

grant delete on table "public"."mentors" to "anon";

grant insert on table "public"."mentors" to "anon";

grant references on table "public"."mentors" to "anon";

grant select on table "public"."mentors" to "anon";

grant trigger on table "public"."mentors" to "anon";

grant truncate on table "public"."mentors" to "anon";

grant update on table "public"."mentors" to "anon";

grant delete on table "public"."mentors" to "authenticated";

grant insert on table "public"."mentors" to "authenticated";

grant references on table "public"."mentors" to "authenticated";

grant select on table "public"."mentors" to "authenticated";

grant trigger on table "public"."mentors" to "authenticated";

grant truncate on table "public"."mentors" to "authenticated";

grant update on table "public"."mentors" to "authenticated";

grant delete on table "public"."mentors" to "service_role";

grant insert on table "public"."mentors" to "service_role";

grant references on table "public"."mentors" to "service_role";

grant select on table "public"."mentors" to "service_role";

grant trigger on table "public"."mentors" to "service_role";

grant truncate on table "public"."mentors" to "service_role";

grant update on table "public"."mentors" to "service_role";

grant delete on table "public"."mentorship_sessions" to "anon";

grant insert on table "public"."mentorship_sessions" to "anon";

grant references on table "public"."mentorship_sessions" to "anon";

grant select on table "public"."mentorship_sessions" to "anon";

grant trigger on table "public"."mentorship_sessions" to "anon";

grant truncate on table "public"."mentorship_sessions" to "anon";

grant update on table "public"."mentorship_sessions" to "anon";

grant delete on table "public"."mentorship_sessions" to "authenticated";

grant insert on table "public"."mentorship_sessions" to "authenticated";

grant references on table "public"."mentorship_sessions" to "authenticated";

grant select on table "public"."mentorship_sessions" to "authenticated";

grant trigger on table "public"."mentorship_sessions" to "authenticated";

grant truncate on table "public"."mentorship_sessions" to "authenticated";

grant update on table "public"."mentorship_sessions" to "authenticated";

grant delete on table "public"."mentorship_sessions" to "service_role";

grant insert on table "public"."mentorship_sessions" to "service_role";

grant references on table "public"."mentorship_sessions" to "service_role";

grant select on table "public"."mentorship_sessions" to "service_role";

grant trigger on table "public"."mentorship_sessions" to "service_role";

grant truncate on table "public"."mentorship_sessions" to "service_role";

grant update on table "public"."mentorship_sessions" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant delete on table "public"."startup_reviews" to "anon";

grant insert on table "public"."startup_reviews" to "anon";

grant references on table "public"."startup_reviews" to "anon";

grant select on table "public"."startup_reviews" to "anon";

grant trigger on table "public"."startup_reviews" to "anon";

grant truncate on table "public"."startup_reviews" to "anon";

grant update on table "public"."startup_reviews" to "anon";

grant delete on table "public"."startup_reviews" to "authenticated";

grant insert on table "public"."startup_reviews" to "authenticated";

grant references on table "public"."startup_reviews" to "authenticated";

grant select on table "public"."startup_reviews" to "authenticated";

grant trigger on table "public"."startup_reviews" to "authenticated";

grant truncate on table "public"."startup_reviews" to "authenticated";

grant update on table "public"."startup_reviews" to "authenticated";

grant delete on table "public"."startup_reviews" to "service_role";

grant insert on table "public"."startup_reviews" to "service_role";

grant references on table "public"."startup_reviews" to "service_role";

grant select on table "public"."startup_reviews" to "service_role";

grant trigger on table "public"."startup_reviews" to "service_role";

grant truncate on table "public"."startup_reviews" to "service_role";

grant update on table "public"."startup_reviews" to "service_role";

grant delete on table "public"."startups" to "anon";

grant insert on table "public"."startups" to "anon";

grant references on table "public"."startups" to "anon";

grant select on table "public"."startups" to "anon";

grant trigger on table "public"."startups" to "anon";

grant truncate on table "public"."startups" to "anon";

grant update on table "public"."startups" to "anon";

grant delete on table "public"."startups" to "authenticated";

grant insert on table "public"."startups" to "authenticated";

grant references on table "public"."startups" to "authenticated";

grant select on table "public"."startups" to "authenticated";

grant trigger on table "public"."startups" to "authenticated";

grant truncate on table "public"."startups" to "authenticated";

grant update on table "public"."startups" to "authenticated";

grant delete on table "public"."startups" to "service_role";

grant insert on table "public"."startups" to "service_role";

grant references on table "public"."startups" to "service_role";

grant select on table "public"."startups" to "service_role";

grant trigger on table "public"."startups" to "service_role";

grant truncate on table "public"."startups" to "service_role";

grant update on table "public"."startups" to "service_role";

grant delete on table "public"."tasks" to "anon";

grant insert on table "public"."tasks" to "anon";

grant references on table "public"."tasks" to "anon";

grant select on table "public"."tasks" to "anon";

grant trigger on table "public"."tasks" to "anon";

grant truncate on table "public"."tasks" to "anon";

grant update on table "public"."tasks" to "anon";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "Founders see own application"
  on "public"."applications"
  as permissive
  for select
  to public
using ((((applicant_email)::text = (( SELECT users.email
   FROM public.users
  WHERE (users.id = auth.uid())))::text) OR (organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['admin'::character varying, 'mentor'::character varying])::text[])))))));



  create policy "Users see org applications"
  on "public"."applications"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org documents"
  on "public"."documents"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org evaluation criteria"
  on "public"."evaluation_criteria"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org evaluations"
  on "public"."evaluations"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org mentors"
  on "public"."mentors"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Mentors see own sessions"
  on "public"."mentorship_sessions"
  as permissive
  for select
  to public
using (((mentor_id IN ( SELECT mentors.id
   FROM public.mentors
  WHERE (mentors.user_id = auth.uid()))) OR (startup_id IN ( SELECT startups.id
   FROM public.startups
  WHERE (startups.founder_id = auth.uid())))));



  create policy "Users see org sessions"
  on "public"."mentorship_sessions"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((recipient_id = auth.uid()));



  create policy "Admins can update own organization"
  on "public"."organizations"
  as permissive
  for update
  to public
using ((id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = 'admin'::text)))));



  create policy "Users see own organization"
  on "public"."organizations"
  as permissive
  for select
  to public
using ((id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org reviews"
  on "public"."startup_reviews"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Founders manage own startup"
  on "public"."startups"
  as permissive
  for all
  to public
using (((founder_id = auth.uid()) OR (organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['admin'::character varying, 'mentor'::character varying])::text[])))))));



  create policy "Users see org startups"
  on "public"."startups"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org tasks"
  on "public"."tasks"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Users see org user roles"
  on "public"."user_roles"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users.organization_id
   FROM public.users
  WHERE (users.id = auth.uid()))));



  create policy "Admins manage org users"
  on "public"."users"
  as permissive
  for all
  to public
using ((organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = 'admin'::text)))));



  create policy "Users see org members"
  on "public"."users"
  as permissive
  for select
  to public
using ((organization_id IN ( SELECT users_1.organization_id
   FROM public.users users_1
  WHERE (users_1.id = auth.uid()))));



